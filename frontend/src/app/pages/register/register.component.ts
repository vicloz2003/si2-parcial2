import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PublicNavbarComponent],
  template: `
    <app-public-navbar></app-public-navbar>

    <div class="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <!-- Panel de marca (oscuro) -->
      <aside class="relative hidden overflow-hidden bg-hero p-12 text-white lg:flex lg:flex-col lg:justify-center">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_10%,rgba(255,107,0,0.30),transparent_70%)]"></div>
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_45%_at_90%_100%,rgba(230,57,70,0.22),transparent_70%)]"></div>

        <a routerLink="/login" class="absolute left-10 top-10 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-white/10 hover:text-white">
          <span class="material-symbols-rounded text-lg">arrow_back</span> Volver al login
        </a>

        <div class="relative max-w-md">
          <img src="logo.svg" alt="RescateYa" class="h-12 w-12 rounded-xl object-contain ring-1 ring-white/10">
          <h2 class="mt-6 font-display text-4xl font-bold leading-[1.15]">
            Únete a la red de <span class="text-gradient">talleres RescateYa</span>
          </h2>
          <p class="mt-5 text-lg leading-relaxed text-slate-400">
            Recibe solicitudes de emergencia vehicular automáticamente y gestiona tu equipo desde un solo panel.
          </p>
          <ul class="mt-8 space-y-2.5">
            <li class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <span class="material-symbols-rounded text-brand-400">bolt</span> Asignación automática por cercanía
            </li>
            <li class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <span class="material-symbols-rounded text-brand-400">smart_toy</span> Clasificación con IA integrada
            </li>
            <li class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <span class="material-symbols-rounded text-brand-400">payments</span> Gestión de pagos y comisiones
            </li>
          </ul>
        </div>
      </aside>

      <!-- Formulario -->
      <div class="flex items-center justify-center bg-slate-50 p-6 dark:bg-[#0d1117]">
        <div class="w-full max-w-md animate-reveal py-8">
          <div class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 font-mono text-xs font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
            <span class="material-symbols-rounded text-base">store</span> Registro de taller
          </div>
          <h1 class="mt-3 font-display text-3xl font-extrabold text-slate-900 dark:text-white">Crea tu cuenta</h1>
          <p class="mt-1 text-slate-500 dark:text-slate-400">Completa tus datos para empezar</p>

          <form (ngSubmit)="onRegister()" class="mt-7 space-y-4" #f="ngForm">
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Nombre completo / Razón social</label>
              <div class="relative">
                <span class="material-symbols-rounded pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">badge</span>
                <input type="text" [(ngModel)]="form.full_name" name="full_name" required placeholder="Taller Mecánico López"
                  class="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Correo electrónico</label>
              <div class="relative">
                <span class="material-symbols-rounded pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input type="email" [(ngModel)]="form.email" name="email" required placeholder="contacto&#64;taller.com"
                  class="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Teléfono</label>
              <div class="relative">
                <span class="material-symbols-rounded pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">call</span>
                <input type="tel" [(ngModel)]="form.phone" name="phone" required placeholder="78912345"
                  class="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Contraseña</label>
              <div class="relative">
                <span class="material-symbols-rounded pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="form.password" name="password" required minlength="6" placeholder="Mínimo 6 caracteres"
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
                <span>Crear cuenta</span>
                <span class="material-symbols-rounded">arrow_forward</span>
              </ng-container>
              <ng-container *ngIf="loading">
                <span class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                <span>Registrando...</span>
              </ng-container>
            </button>
          </form>

          <div class="mt-7 flex items-center justify-center gap-1.5 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            <span>¿Ya tienes cuenta?</span>
            <a routerLink="/login" class="font-bold text-brand-600 hover:text-emergency-500 dark:text-brand-400">Inicia sesión</a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  form = {
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'workshop',
  };
  error = '';
  loading = false;
  showPassword = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  onRegister() {
    this.loading = true;
    this.error = '';
    this.auth.register(this.form).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err.error?.detail || 'Error al registrarse';
        this.loading = false;
      },
    });
  }
}
