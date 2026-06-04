import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PublicNavbarComponent],
  template: `
    <app-public-navbar></app-public-navbar>

    <div class="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <!-- Panel de marca (oscuro) -->
      <aside class="relative hidden overflow-hidden bg-hero p-12 text-white lg:flex lg:flex-col lg:justify-center">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_10%,rgba(255,107,0,0.30),transparent_70%)]"></div>
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_45%_at_90%_100%,rgba(230,57,70,0.22),transparent_70%)]"></div>

        <a routerLink="/" class="absolute left-10 top-10 flex items-center gap-2 font-display text-lg font-extrabold">
          <img src="logo.svg" alt="RescateYa" class="h-10 w-10 rounded-lg object-contain ring-1 ring-white/10"> RescateYa
        </a>

        <div class="relative max-w-md">
          <span class="relative flex h-3 w-3">
            <span class="absolute inline-flex h-full w-full rounded-full bg-brand-400 animate-beacon"></span>
            <span class="relative inline-flex h-3 w-3 rounded-full bg-brand-500"></span>
          </span>
          <h2 class="mt-6 font-display text-4xl font-bold leading-[1.15]">
            Emergencias vehiculares con <span class="text-gradient">inteligencia artificial</span>
          </h2>
          <p class="mt-5 text-lg leading-relaxed text-slate-400">
            Panel avanzado para talleres. Asignación automática, monitoreo GPS en tiempo real y clasificación IA.
          </p>

          <dl class="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-6">
            <div><dt class="font-mono text-xl font-bold text-brand-400">24/7</dt><dd class="mt-1 text-xs uppercase tracking-wide text-slate-500">Disponible</dd></div>
            <div><dt class="font-mono text-xl font-bold text-brand-400">IA</dt><dd class="mt-1 text-xs uppercase tracking-wide text-slate-500">Clasificación</dd></div>
            <div><dt class="font-mono text-xl font-bold text-brand-400">GPS</dt><dd class="mt-1 text-xs uppercase tracking-wide text-slate-500">Tiempo real</dd></div>
          </dl>
        </div>
      </aside>

      <!-- Formulario -->
      <div class="flex items-center justify-center bg-slate-50 p-6 dark:bg-[#0d1117]">
        <div class="w-full max-w-md animate-reveal">
          <img src="logo.svg" alt="RescateYa" class="mb-6 h-12 w-12 rounded-xl object-contain ring-1 ring-black/5 lg:hidden">
          <h1 class="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Bienvenido</h1>
          <p class="mt-1 text-slate-500 dark:text-slate-400">Ingresa a tu panel de gestión</p>

          <form (ngSubmit)="onLogin()" class="mt-8 space-y-5" #f="ngForm">
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Correo electrónico</label>
              <div class="relative">
                <span class="material-symbols-rounded pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input type="email" [(ngModel)]="email" name="email" required autocomplete="email" placeholder="correo&#64;taller.com"
                  class="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Contraseña</label>
              <div class="relative">
                <span class="material-symbols-rounded pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" required autocomplete="current-password" placeholder="••••••••"
                  class="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <button type="button" (click)="showPassword = !showPassword" tabindex="-1"
                  class="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10">
                  <span class="material-symbols-rounded text-xl">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <div *ngIf="error" class="flex items-center gap-2 rounded-xl bg-emergency-50 px-3 py-2.5 text-sm font-medium text-emergency-600 dark:bg-emergency-500/10 dark:text-emergency-300">
              <span class="material-symbols-rounded text-lg">error</span>
              <span>{{ error }}</span>
            </div>

            <button type="submit" [disabled]="loading || !f.valid"
              class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-brand-400 to-emergency-500 font-bold text-white shadow-brand transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0">
              <ng-container *ngIf="!loading">
                <span>Ingresar al panel</span>
                <span class="material-symbols-rounded">arrow_forward</span>
              </ng-container>
              <ng-container *ngIf="loading">
                <span class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                <span>Verificando...</span>
              </ng-container>
            </button>
          </form>

          <div class="mt-8 flex items-center justify-center gap-1.5 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            <span>¿No tienes cuenta?</span>
            <a routerLink="/register" class="font-bold text-brand-600 hover:text-emergency-500 dark:text-brand-400">Crear cuenta de taller</a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate([this.getHomeRoute()]);
    }
  }

  onLogin() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        const role = this.auth.getCurrentUser()?.role;
        if (role === 'client' || role === 'technician') {
          this.auth.logout();
          this.error = 'Esta cuenta debe ingresar desde la app movil de RescateYa.';
          this.loading = false;
          return;
        }
        this.router.navigate([this.getHomeRoute()]);
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error al iniciar sesion';
        this.loading = false;
      },
    });
  }

  private getHomeRoute(): string {
    const role = this.auth.getCurrentUser()?.role;
    if (role === 'client' || role === 'technician') {
      this.auth.logout();
      return '/login';
    }
    return '/dashboard';
  }
}
