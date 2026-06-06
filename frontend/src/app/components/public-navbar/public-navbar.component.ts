import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AppIconComponent } from '../../shared/app-icon.component';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, AppIconComponent],
  template: `
    <nav class="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b border-black/5 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-12 dark:border-white/10 dark:bg-hero/80"
         aria-label="Navegacion principal">
      <a routerLink="/" class="flex min-w-0 items-center gap-2 font-display text-lg font-extrabold text-slate-900 dark:text-white" aria-label="RescateYa inicio">
        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#111111] text-white text-sm font-black shadow-sm dark:bg-white dark:text-[#111111]">R</span>
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
          <app-icon [name]="themeSvc.theme() === 'dark' ? 'light_mode' : 'dark_mode'" />
        </button>

        <a routerLink="/register"
           class="inline-flex h-11 items-center justify-center gap-2 rounded-xl
                  bg-white px-4 font-extrabold text-[#111111]
                  shadow-[0_2px_12px_rgba(255,255,255,0.15)]
                  transition-all hover:-translate-y-0.5 hover:bg-neutral-100
                  active:scale-[0.98] max-sm:w-11 max-sm:px-0">
          <span class="max-sm:hidden">Registrar taller</span>
          <app-icon name="arrow_forward" />
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
