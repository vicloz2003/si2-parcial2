import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b border-black/5 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-12 dark:border-white/10 dark:bg-hero/80"
         aria-label="Navegacion principal">
      <a routerLink="/" class="flex min-w-0 items-center gap-2 font-display text-lg font-extrabold text-slate-900 dark:text-white" aria-label="RescateYa inicio">
        <img src="logo.svg" alt="RescateYa" class="h-10 w-10 shrink-0 rounded-lg object-contain ring-1 ring-black/5">
        <span>RescateYa</span>
      </a>

      <div class="flex items-center gap-1">
        <a routerLink="/" routerLinkActive="text-slate-900 bg-slate-100 dark:text-white dark:bg-white/10"
           [routerLinkActiveOptions]="{ exact: true }"
           class="hidden h-10 items-center rounded-lg px-3 font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-flex dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">Inicio</a>
        <a routerLink="/login" routerLinkActive="text-slate-900 bg-slate-100 dark:text-white dark:bg-white/10"
           class="hidden h-10 items-center rounded-lg px-3 font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-flex dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">Ingresar</a>

        <button type="button" (click)="toggleTheme()"
                [title]="themeSvc.theme() === 'dark' ? 'Modo claro' : 'Modo oscuro'" aria-label="Cambiar tema"
                class="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
          <span class="material-symbols-rounded text-xl">{{ themeSvc.theme() === 'dark' ? 'light_mode' : 'dark_mode' }}</span>
        </button>

        <a routerLink="/register"
           class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-brand-400 to-emergency-500 px-4 font-extrabold text-white shadow-brand transition-transform hover:-translate-y-0.5 max-sm:w-11 max-sm:px-0">
          <span class="max-sm:hidden">Registrar taller</span>
          <span class="material-symbols-rounded text-xl">arrow_forward</span>
        </a>
      </div>
    </nav>
  `,
})
export class PublicNavbarComponent {
  constructor(public themeSvc: ThemeService) {}

  toggleTheme() {
    this.themeSvc.toggle();
  }
}
