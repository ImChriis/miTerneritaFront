/**
 * Roles del backend: `client` compra entradas, `user` es el personal del local
 * (crea eventos, entradas y carta, y escanea) y `admin` lo administra todo.
 * Solo el personal y el admin entran al panel.
 */
export const ROLES_PANEL = ['admin', 'user'];

export const puedeVerPanel = (role?: string | null): boolean => !!role && ROLES_PANEL.includes(role);
