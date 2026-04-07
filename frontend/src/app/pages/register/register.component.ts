import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="bg-orb orb-1"></div>
        <div class="bg-orb orb-2"></div>
      </div>

      <div class="auth-card fade-in">
        <a routerLink="/login" class="back-link">
          <span class="material-symbols-rounded">arrow_back</span>
          Volver
        </a>

        <div class="brand">
          <div class="brand-icon">
            <span class="material-symbols-rounded">store</span>
          </div>
          <h1>Registra tu taller</h1>
          <p>Crea tu cuenta para recibir solicitudes</p>
        </div>

        <form (ngSubmit)="onRegister()" class="auth-form" #f="ngForm">
          <div class="field">
            <label class="field-label">Nombre completo / Razon social</label>
            <div class="input-with-icon">
              <span class="material-symbols-rounded">badge</span>
              <input
                type="text"
                class="input"
                [(ngModel)]="form.full_name"
                name="full_name"
                placeholder="Taller Mecanico Lopez"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="field-label">Correo electronico</label>
            <div class="input-with-icon">
              <span class="material-symbols-rounded">mail</span>
              <input
                type="email"
                class="input"
                [(ngModel)]="form.email"
                name="email"
                placeholder="contacto@taller.com"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="field-label">Telefono</label>
            <div class="input-with-icon">
              <span class="material-symbols-rounded">call</span>
              <input
                type="tel"
                class="input"
                [(ngModel)]="form.phone"
                name="phone"
                placeholder="78912345"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="field-label">Contrasena</label>
            <div class="input-with-icon">
              <span class="material-symbols-rounded">lock</span>
              <input
                [type]="showPassword ? 'text' : 'password'"
                class="input"
                [(ngModel)]="form.password"
                name="password"
                placeholder="Minimo 6 caracteres"
                required
                minlength="6"
              />
              <button
                type="button"
                class="toggle-pass"
                (click)="showPassword = !showPassword"
                tabindex="-1"
              >
                <span class="material-symbols-rounded">
                  {{ showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
          </div>

          <div class="error-box" *ngIf="error">
            <span class="material-symbols-rounded">error</span>
            <span>{{ error }}</span>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            [disabled]="loading || !f.valid"
          >
            <ng-container *ngIf="!loading">
              <span>Crear cuenta</span>
              <span class="material-symbols-rounded">check</span>
            </ng-container>
            <ng-container *ngIf="loading">
              <span class="spinner"></span>
              <span>Registrando...</span>
            </ng-container>
          </button>
        </form>

        <div class="auth-footer">
          Ya tienes cuenta?
          <a routerLink="/login">Inicia sesion</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-page {
        position: relative;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--gradient-primary);
        padding: var(--space-lg);
        overflow: hidden;
      }

      .auth-bg {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .bg-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.4;
      }
      .orb-1 {
        width: 380px;
        height: 380px;
        background: var(--color-accent);
        top: -80px;
        right: -80px;
      }
      .orb-2 {
        width: 320px;
        height: 320px;
        background: var(--color-info);
        bottom: -60px;
        left: -60px;
      }

      .auth-card {
        position: relative;
        background: var(--color-surface);
        border-radius: var(--radius-xl);
        padding: var(--space-2xl);
        width: 100%;
        max-width: 460px;
        box-shadow: var(--shadow-xl);
        z-index: 1;
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--color-text-tertiary);
        font-size: 13px;
        font-weight: 500;
        margin-bottom: var(--space-md);
        padding: 6px 10px;
        margin-left: -10px;
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);

        .material-symbols-rounded {
          font-size: 18px;
        }

        &:hover {
          background: var(--color-surface-alt);
          color: var(--color-text-primary);
        }
      }

      .brand {
        text-align: center;
        margin-bottom: var(--space-xl);
      }

      .brand-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto var(--space-md);
        background: var(--gradient-primary);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-md);

        .material-symbols-rounded {
          font-size: 36px;
          color: white;
        }
      }

      .brand h1 {
        font-size: 24px;
        font-weight: 800;
        color: var(--color-primary);
        margin-bottom: 4px;
      }

      .brand p {
        color: var(--color-text-tertiary);
        font-size: 14px;
      }

      .auth-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      .input-with-icon {
        position: relative;
      }

      .toggle-pass {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        padding: 6px;
        border-radius: var(--radius-sm);
        color: var(--color-text-tertiary);
        display: flex;
        align-items: center;

        &:hover {
          background: var(--color-surface-alt);
          color: var(--color-text-primary);
        }

        .material-symbols-rounded {
          font-size: 20px;
        }
      }

      .error-box {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: 10px 14px;
        background: rgba(230, 57, 70, 0.08);
        border: 1px solid rgba(230, 57, 70, 0.25);
        border-radius: var(--radius-md);
        color: var(--color-danger);
        font-size: 13px;
        animation: fadeIn 0.3s ease-out;

        .material-symbols-rounded {
          font-size: 18px;
        }
      }

      .spinner {
        width: 18px;
        height: 18px;
        border: 2.5px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .auth-footer {
        text-align: center;
        margin-top: var(--space-lg);
        padding-top: var(--space-lg);
        border-top: 1px solid var(--color-divider);
        color: var(--color-text-secondary);
        font-size: 14px;

        a {
          color: var(--color-primary);
          font-weight: 700;
          margin-left: 4px;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    `,
  ],
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
