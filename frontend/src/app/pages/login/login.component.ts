import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';
import { AppIconComponent } from '../../shared/app-icon.component';

/*
 * frontend-design skill — Spotify palette
 * Aside: #111111 dark panel, grid texture, sin glows naranjas
 * Form: fondo claro / dark:#181818, inputs con focus ring blanco/neutral
 * CTA: bg-white text-[#111111]
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PublicNavbarComponent, AppIconComponent],
  template: `
    <app-public-navbar></app-public-navbar>

    <div class="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">

      <!-- ── Panel de marca (Spotify #111111) ── -->
      <aside class="relative hidden overflow-hidden bg-[#111111] p-12
                    text-white lg:flex lg:flex-col lg:justify-center">

        <!-- Grid texture — sin glows de color -->
        <div class="pointer-events-none absolute inset-0 opacity-[0.045]"
             style="background-image:linear-gradient(#fff 1px,transparent 1px),
                    linear-gradient(90deg,#fff 1px,transparent 1px);
                    background-size:48px 48px"></div>
        <!-- Vignette lateral suave -->
        <div class="pointer-events-none absolute inset-0
                    bg-[radial-gradient(55%_60%_at_20%_30%,rgba(255,255,255,0.04),transparent)]"></div>

        <a routerLink="/"
           class="absolute left-10 top-10 flex items-center gap-2
                  font-display text-lg font-extrabold">
          <span class="grid h-9 w-9 place-items-center rounded-xl
                       bg-white text-[#111111] text-sm font-black">R</span>
          RescateYa
        </a>

        <div class="relative max-w-md">
          <!-- Beacon blanco -->
          <span class="relative flex h-3 w-3">
            <span class="absolute inline-flex h-full w-full rounded-full
                         bg-white/50 animate-beacon"></span>
            <span class="relative inline-flex h-3 w-3 rounded-full bg-white"></span>
          </span>

          <h2 class="mt-6 font-display text-4xl font-bold leading-[1.15]">
            Emergencias vehiculares con
            <span class="text-gradient">inteligencia artificial</span>
          </h2>
          <p class="mt-5 text-lg leading-relaxed text-white/45">
            Panel avanzado para talleres. Asignación automática, monitoreo
            GPS en tiempo real y clasificación IA.
          </p>

          <dl class="mt-10 grid grid-cols-3 gap-6
                     border-t border-white/10 pt-6">
            <div>
              <dt class="font-mono text-xl font-bold text-white">24/7</dt>
              <dd class="mt-1 text-xs uppercase tracking-wide text-white/35">Disponible</dd>
            </div>
            <div>
              <dt class="font-mono text-xl font-bold text-white">IA</dt>
              <dd class="mt-1 text-xs uppercase tracking-wide text-white/35">Clasificación</dd>
            </div>
            <div>
              <dt class="font-mono text-xl font-bold text-white">GPS</dt>
              <dd class="mt-1 text-xs uppercase tracking-wide text-white/35">Tiempo real</dd>
            </div>
          </dl>
        </div>
      </aside>

      <!-- ── Formulario ── -->
      <div class="flex items-center justify-center
                  bg-slate-50 p-6 dark:bg-[#181818]">
        <div class="w-full max-w-md animate-reveal">

          <!-- Logo móvil -->
          <span class="mb-6 grid h-12 w-12 place-items-center rounded-xl
                       bg-[#111111] text-white text-lg font-black
                       lg:hidden">R</span>

          <h1 class="font-display text-3xl font-extrabold
                     text-slate-900 dark:text-white">Bienvenido</h1>
          <p class="mt-1 text-slate-500 dark:text-white/40">
            Ingresa a tu panel de gestión
          </p>

          <form (ngSubmit)="onLogin()" class="mt-8 space-y-5" #f="ngForm">

            <!-- Email -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wide
                            text-slate-500 dark:text-white/40">
                Correo electrónico
              </label>
              <div class="relative">
                <app-icon name="mail"
                          class="pointer-events-none absolute left-3 top-1/2
                                 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                <input type="email" [(ngModel)]="email" name="email"
                       required autocomplete="email"
                       placeholder="correo&#64;taller.com"
                       class="h-12 w-full rounded-xl border border-slate-200 bg-white
                              pl-11 pr-4 text-slate-900 outline-none transition
                              focus:border-slate-400 focus:ring-2 focus:ring-black/8
                              dark:border-white/10 dark:bg-[#282828] dark:text-white
                              dark:focus:border-white/40 dark:focus:ring-white/8" />
              </div>
            </div>

            <!-- Contraseña -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wide
                            text-slate-500 dark:text-white/40">
                Contraseña
              </label>
              <div class="relative">
                <app-icon name="lock"
                          class="pointer-events-none absolute left-3 top-1/2
                                 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                <input [type]="showPassword ? 'text' : 'password'"
                       [(ngModel)]="password" name="password"
                       required autocomplete="current-password"
                       placeholder="••••••••"
                       class="h-12 w-full rounded-xl border border-slate-200 bg-white
                              pl-11 pr-11 text-slate-900 outline-none transition
                              focus:border-slate-400 focus:ring-2 focus:ring-black/8
                              dark:border-white/10 dark:bg-[#282828] dark:text-white
                              dark:focus:border-white/40 dark:focus:ring-white/8" />
                <button type="button" (click)="showPassword = !showPassword"
                        tabindex="-1"
                        class="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2
                               place-items-center rounded-lg text-slate-400
                               hover:bg-slate-100 hover:text-slate-700
                               dark:hover:bg-white/10 dark:text-white/30
                               dark:hover:text-white">
                  <app-icon [name]="showPassword ? 'visibility_off' : 'visibility'" />
                </button>
              </div>
            </div>

            <!-- Error -->
            <div *ngIf="error"
                 class="flex items-center gap-2 rounded-xl
                        bg-emergency-50 px-3 py-2.5 text-sm font-medium
                        text-emergency-600
                        dark:bg-emergency-500/10 dark:text-emergency-300">
              <app-icon name="error" [size]="18" />
              <span>{{ error }}</span>
            </div>

            <!-- Submit -->
            <button type="submit" [disabled]="loading || !f.valid"
                    class="inline-flex h-12 w-full items-center justify-center gap-2
                           rounded-xl bg-[#111111] font-bold text-white
                           shadow-[0_4px_20px_rgba(0,0,0,0.2)]
                           transition-all hover:-translate-y-0.5
                           hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]
                           disabled:cursor-not-allowed disabled:opacity-50
                           disabled:hover:translate-y-0
                           dark:bg-white dark:text-[#111111]
                           dark:shadow-[0_4px_20px_rgba(255,255,255,0.12)]
                           dark:hover:shadow-[0_8px_32px_rgba(255,255,255,0.2)]">
              <ng-container *ngIf="!loading">
                <span>Ingresar al panel</span>
                <app-icon name="arrow_forward" />
              </ng-container>
              <ng-container *ngIf="loading">
                <span class="h-5 w-5 animate-spin rounded-full
                             border-2 border-current/30 border-t-current"></span>
                <span>Verificando...</span>
              </ng-container>
            </button>
          </form>

          <div class="mt-8 flex items-center justify-center gap-1.5
                      border-t border-slate-200 pt-6 text-sm
                      text-slate-500 dark:border-white/10 dark:text-white/40">
            <span>¿No tienes cuenta?</span>
            <a routerLink="/register"
               class="font-bold text-slate-900 hover:text-slate-600
                      dark:text-white dark:hover:text-white/70 transition-colors">
              Crear cuenta de taller
            </a>
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
