import { Component, inject, input, OnInit, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { concatMap, from, finalize } from 'rxjs';
import { EventsService } from '../../../../@core/services/events.service';
import { EventPhoto } from '../../../../@core/models/event.model';
import { eventImage } from '../../../../@core/utils/event-utils';

/** Fotos por petición (el backend acepta hasta 20). */
const TANDA = 10;
const esWebp = (f: File) => f.name.toLowerCase().endsWith('.webp');
const leerLote = (lector: FileSystemDirectoryReader) =>
  new Promise<FileSystemEntry[]>((ok, ko) => lector.readEntries(ok, ko));

/**
 * Galería del evento en el modal de edición: el admin suelta fotos o carpetas
 * enteras (.webp) y se suben al instante, en tandas. Los clientes solo las ven.
 */
@Component({
  selector: 'app-event-photos',
  template: `
    <section class="adm-section">
      <h3>Fotos de la noche · {{ fotos().length }}</h3>

      <div
        class="zona"
        [class.encima]="encima()"
        (dragover)="$event.preventDefault(); encima.set(true)"
        (dragleave)="encima.set(false)"
        (drop)="soltar($event)"
      >
        @if (subiendo(); as s) {
          <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
          <strong>Subiendo {{ s.hechas }} de {{ s.total }}…</strong>
          <progress [value]="s.hechas" [max]="s.total"></progress>
        } @else {
          <i class="pi pi-images" aria-hidden="true"></i>
          <strong>Arrastra aquí las fotos o una carpeta</strong>
          <small>Solo .webp · se suben al instante y los clientes las ven en la página del evento</small>
          <div class="botones">
            <button type="button" class="adm-btn adm-btn--ghost" (click)="archivos.click()"><i class="pi pi-image"></i> Elegir fotos</button>
            <button type="button" class="adm-btn adm-btn--ghost" (click)="carpeta.click()"><i class="pi pi-folder-open"></i> Elegir carpeta</button>
          </div>
        }
        <input #archivos type="file" accept=".webp,image/webp" multiple hidden (change)="elegir(archivos)" />
        <input #carpeta type="file" webkitdirectory multiple hidden (change)="elegir(carpeta)" />
      </div>

      @if (fotos().length) {
        <ul class="miniaturas">
          @for (f of fotos(); track f.idPhoto) {
            <li>
              <img [src]="url(f)" alt="" loading="lazy" />
              <button type="button" class="quitar" (click)="borrar(f)" aria-label="Eliminar foto"><i class="pi pi-times"></i></button>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    .zona {
      display: grid;
      justify-items: center;
      gap: 0.5rem;
      padding: 1.5rem 1rem;
      border: 2px dashed var(--border-strong);
      border-radius: var(--radius-md);
      background: var(--surface-2);
      color: var(--text-muted);
      text-align: center;
      transition: border-color var(--dur-fast) var(--ease-out), background-color var(--dur-fast) var(--ease-out);

      > .pi {
        font-size: 1.6rem;
        color: var(--primary);
      }

      strong {
        color: var(--text);
      }

      small {
        font-size: 0.78rem;
      }

      progress {
        width: min(320px, 100%);
        accent-color: var(--primary);
      }
    }

    .encima {
      border-color: var(--primary);
      background: var(--primary-soft);
    }

    .botones {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .miniaturas {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
      gap: 0.5rem;
      max-height: 260px;
      margin: 0;
      padding: 0;
      overflow-y: auto;
      list-style: none;

      li {
        position: relative;
        aspect-ratio: 1;
        border-radius: var(--radius-sm);
        overflow: hidden;
        background: var(--surface-3);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .quitar {
      position: absolute;
      top: 4px;
      right: 4px;
      display: grid;
      place-items: center;
      width: 26px;
      height: 26px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: rgba(5, 5, 8, 0.7);
      color: #fff;
      font-size: 0.7rem;
      cursor: pointer;

      &:hover {
        background: var(--danger);
      }
    }
  `
})
export class EventPhotosComponent implements OnInit {
  private eventsService = inject(EventsService);
  private messageService = inject(MessageService);

  readonly idEvents = input.required<number>();
  readonly fotos = signal<EventPhoto[]>([]);
  readonly encima = signal(false);
  readonly subiendo = signal<{ hechas: number; total: number } | null>(null);

  ngOnInit() {
    this.eventsService.getPhotos(this.idEvents()).subscribe(f => this.fotos.set(f));
  }

  url(f: EventPhoto) {
    return eventImage(f.image);
  }

  elegir(input: HTMLInputElement) {
    this.subir([...(input.files ?? [])]);
    input.value = '';
  }

  async soltar(e: DragEvent) {
    e.preventDefault();
    this.encima.set(false);
    const items = e.dataTransfer?.items;
    if (!items) return;
    // webkitGetAsEntry solo vale durante el evento: se piden todas antes del primer await.
    const entradas = [...items].map(i => i.webkitGetAsEntry()).filter((x): x is FileSystemEntry => !!x);
    const archivos: File[] = [];
    const leer = async (entrada: FileSystemEntry): Promise<void> => {
      if (entrada.isFile) {
        archivos.push(await new Promise<File>((ok, ko) => (entrada as FileSystemFileEntry).file(ok, ko)));
      } else if (entrada.isDirectory) {
        const lector = (entrada as FileSystemDirectoryEntry).createReader();
        // readEntries entrega por lotes (100 en Chrome): se lee hasta que venga vacío.
        for (let lote = await leerLote(lector); lote.length; lote = await leerLote(lector)) {
          await Promise.all(lote.map(leer));
        }
      }
    };
    await Promise.all(entradas.map(leer));
    this.subir(archivos);
  }

  private subir(todos: File[]) {
    const fotos = todos.filter(esWebp);
    const omitidas = todos.length - fotos.length;
    if (omitidas) {
      this.messageService.add({ severity: 'warn', summary: 'Fotos', detail: `${omitidas} archivo(s) no son .webp y se omitieron` });
    }
    if (!fotos.length || this.subiendo()) return;

    const tandas = Array.from({ length: Math.ceil(fotos.length / TANDA) }, (_, i) => fotos.slice(i * TANDA, (i + 1) * TANDA));
    this.subiendo.set({ hechas: 0, total: fotos.length });
    from(tandas)
      .pipe(
        // Una tanda tras otra: si una falla, las anteriores ya quedaron guardadas.
        concatMap(tanda => this.eventsService.uploadPhotos(this.idEvents(), tanda)),
        finalize(() => this.subiendo.set(null))
      )
      .subscribe({
        next: nuevas => {
          this.fotos.update(f => [...f, ...nuevas]);
          this.subiendo.update(s => s && { ...s, hechas: s.hechas + nuevas.length });
        },
        complete: () => this.messageService.add({ severity: 'success', summary: 'Fotos', detail: `${fotos.length} foto(s) subidas` }),
        error: err => this.messageService.add({ severity: 'error', summary: 'Fotos', detail: err?.error?.message ?? 'No se pudieron subir todas las fotos' })
      });
  }

  borrar(foto: EventPhoto) {
    this.eventsService.deletePhoto(this.idEvents(), foto.idPhoto).subscribe({
      next: () => this.fotos.update(f => f.filter(x => x.idPhoto !== foto.idPhoto)),
      error: () => this.messageService.add({ severity: 'error', summary: 'Fotos', detail: 'No se pudo eliminar la foto' })
    });
  }
}
