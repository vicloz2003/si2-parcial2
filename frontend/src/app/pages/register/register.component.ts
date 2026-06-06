import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';
import { AppIconComponent } from '../../shared/app-icon.component';

/*
 * frontend-design skill — Spotify palette
 * Aside: #111111 dark panel, grid texture, sin glows naranjas, iconos blancos
 * Form: claro/dark:#181818, badge neutral, inputs focus ring neutral
 * CTA: bg-[#111111] / dark:bg-white
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PublicNavbarComponent, AppIconComponent],
  template: `
    <app-public-navbar></app-public-navbar>

    <div class="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">

      <!-- ── Panel de marca (Spotify #111111) ── -->
      <aside class="relative hidden overflow-hidden bg-[#111111] p-12
                    text-white lg:flex lg:flex-col lg:justify-center">

        <!-- Grid texture -->
        <div class="pointer-events-none absolute inset-0 opacity-[0.045]"
             style="background-image:linear-gradient(#fff 1px,transparent 1px),
                    linear-gradient(90deg,#fff 1px,transparent 1px);
                    background-size:48px 48px"></div>
        <div class="pointer-events-none absolute inset-0
                    bg-[radial-gradient(55%_60%_at_20%_30%,rgba(255,255,255,0.04),transparent)]"></div>

        <a routerLink="/login"
           class="absolute left-10 top-10 inline-flex items-center gap-1.5
                  rounded-lg px-2 py-1.5 text-sm font-medium text-white/40
                  transition hover:bg-white/8 hover:text-white">
          <app-icon name="arrow_back" [size]="18" /> Volver al login
        </a>

        <div class="relative max-w-md">
          <!-- Logo B&W -->
          <span class="grid h-12 w-12 place-items-center rounded-xl
                       bg-white text-[#111111] text-xl font-black">R</span>

          <h2 class="mt-6 font-display text-4xl font-bold leading-[1.15]">
            Únete a la red de<br>
            <span class="text-gradient">talleres RescateYa</span>
          </h2>
          <p class="mt-5 text-lg leading-relaxed text-white/45">
            Recibe solicitudes de emergencia vehicular automáticamente y
            gestiona tu equipo desde un solo panel.
          </p>

          <!-- Feature list — iconos blancos, sin color de marca -->
          <ul class="mt-8 space-y-2.5">
            <li class="flex items-center gap-3 rounded-xl
                       border border-white/10 bg-white/5 px-4 py-3
                       text-sm text-white/70">
              <app-icon name="bolt" class="text-white flex-shrink-0" />
              Asignación automática por cercanía
            </li>
            <li class="flex items-center gap-3 rounded-xl
                       border border-white/10 bg-white/5 px-4 py-3
                       text-sm text-white/70">
              <app-icon name="smart_toy" class="text-white flex-shrink-0" />
              Clasificación con IA integrada
            </li>
            <li class="flex items-center gap-3 rounded-xl
                       border border-white/10 bg-white/5 px-4 py-3
                       text-sm text-white/70">
              <app-icon name="payments" class="text-white flex-shrink-0" />
              Gestión de pagos y comisiones
            </li>
          </ul>
        </div>
      </aside>

      <!-- ── Formulario ── -->
      <div class="flex items-center justify-center
                  bg-slate-50 p-6 dark:bg-[#181818]">
        <div class="w-full max-w-md animate-reveal py-8">

          <!-- Badge "Registro de taller" — neutral, sin naranja -->
          <div class="inline-flex items-center gap-1.5 rounded-full
                      bg-slate-200/80 px-3 py-1 font-mono text-xs
                      font-bold text-slate-700
                      dark:bg-white/10 dark:text-white/70">
            <app-icon name="store" [size]="14" /> Registro de taller
          </div>

          <h1 class="mt-3 font-display text-3xl font-extrabold
                     text-slate-900 dark:text-white">Crea tu cuenta</h1>
          <p class="mt-1 text-slate-500 dark:text-white/40">
            Completa tus datos para empezar
          </p>

          <form (ngSubmit)="onRegister()" class="mt-7 space-y-4" #f="ngForm">

            <!-- Nombre -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wide
                            text-slate-500 dark:text-white/40">
                Nombre completo / Razón social
              </label>
              <div class="relative">
                <app-icon name="badge"
                          class="pointer-events-none absolute left-3 top-1/2
                                 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                <input type="text" [(ngModel)]="form.full_name" name="full_name"
                       required placeholder="Taller Mecánico López"
                       class="h-12 w-full rounded-xl border border-slate-200 bg-white
                              pl-11 pr-4 text-slate-900 outline-none transition
                              focus:border-slate-400 focus:ring-2 focus:ring-black/8
                              dark:border-white/10 dark:bg-[#282828] dark:text-white
                              dark:focus:border-white/40 dark:focus:ring-white/8" />
              </div>
            </div>

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
                <input type="email" [(ngModel)]="form.email" name="email"
                       required placeholder="contacto&#64;taller.com"
                       class="h-12 w-full rounded-xl border border-slate-200 bg-white
                              pl-11 pr-4 text-slate-900 outline-none transition
                              focus:border-slate-400 focus:ring-2 focus:ring-black/8
                              dark:border-white/10 dark:bg-[#282828] dark:text-white
                              dark:focus:border-white/40 dark:focus:ring-white/8" />
              </div>
            </div>

            <!-- Teléfono -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wide
                            text-slate-500 dark:text-white/40">
                Teléfono
              </label>
              <div class="relative">
                <app-icon name="call"
                          class="pointer-events-none absolute left-3 top-1/2
                                 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                <input type="tel" [(ngModel)]="form.phone" name="phone"
                       required placeholder="78912345"
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
                       [(ngModel)]="form.password" name="password"
                       required minlength="6"
                       placeholder="Mínimo 6 caracteres"
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
                               dark:text-white/30 dark:hover:bg-white/10
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
                <span>Crear cuenta</span>
                <app-icon name="arrow_forward" />
              </ng-container>
              <ng-container *ngIf="loading">
                <span class="h-5 w-5 animate-spin rounded-full
                             border-2 border-current/30 border-t-current"></span>
                <span>Registrando...</span>
              </ng-container>
            </button>
          </form>

          <div class="mt-7 flex items-center justify-center gap-1.5
                      border-t border-slate-200 pt-6 text-sm
                      text-slate-500 dark:border-white/10 dark:text-white/40">
            <span>¿Ya tienes cuenta?</span>
            <a routerLink="/login"
               class="font-bold text-slate-900 hover:text-slate-600
                      transition-colors dark:text-white dark:hover:text-white/70">
              Inicia sesión
            </a>
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
