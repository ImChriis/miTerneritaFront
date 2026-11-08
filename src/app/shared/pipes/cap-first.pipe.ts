import { Pipe, PipeTransform } from '@angular/core';

/** 'viernes 30 de octubre' -> 'Viernes 30 de octubre' (solo la primera letra). */
@Pipe({ name: 'capFirst' })
export class CapFirstPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
