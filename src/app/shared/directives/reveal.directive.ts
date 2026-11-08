import { Directive, ElementRef, inject, input, OnDestroy, OnInit } from '@angular/core';

/**
 * Hace aparecer el elemento con un leve desplazamiento cuando entra en pantalla.
 * Uso: <section appReveal> o <div appReveal [revealDelay]="120">
 */
@Directive({
  selector: '[appReveal]',
  host: { class: 'tm-reveal' }
})
export class RevealDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  revealDelay = input(0);

  ngOnInit() {
    const node = this.el.nativeElement as HTMLElement;
    node.style.setProperty('--reveal-delay', `${this.revealDelay()}ms`);

    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('is-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    this.observer.observe(node);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
