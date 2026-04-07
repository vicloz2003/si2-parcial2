import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="bg-orb orb-1"></div>
        <div class="bg-orb orb-2"></div>
        <div class="bg-orb orb-3"></div>
      </div>

      <div class="auth-card fade-in">
        <div class="brand">
          <div class="brand-icon">
            <span class="material-symbols-rounded">car_crash</span>
          </div>
          <h1>EmergenciApp</h1>
          <p>Portal de talleres</p>
        </div>

        <form (ngSubmit)="onLogin()" class="auth-form" #f="ngForm">
          <div class="field">
            <label class="field-label">Correo electronico</label>
            <div class="input-with-icon">
              <span class="material-symbols-rounded">mail</span>
              <input
                type="email"
                class="input"
                [(ngModel)]="email"
                name="email"
                placeholder="correo@taller.com"
                required
                autocomplete="email"
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
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••"
                required
                autocomplete="current-password"
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
              <span>Ingresar</span>
              <span class="material-symbols-rounded">arrow_forward</span>
            </ng-container>
            <ng-container *ngIf="loading">
              <span class="spinner"></span>
              <span>Ingresando...</span>
            </ng-container>
          </button>
        </form>

        <div class="auth-footer">
          No tienes cuenta?
          <a routerLink="/register">Registrate aqui</a>
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
        width: 400px;
        height: 400px;
        background: var(--color-accent);
        top: -100px;
        left: -100px;
      }
      .orb-2 {
        width: 350px;
        height: 350px;
        background: var(--color-info);
        bottom: -80px;
        right: -80px;
      }
      .orb-3 {
        width: 280px;
        height: 280px;
        background: var(--color-primary-light);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .auth-card {
        position: relative;
        background: var(--color-surface);
        border-radius: var(--radius-xl);
        padding: var(--space-2xl);
        width: 100%;
        max-width: 440px;
        box-shadow: var(--shadow-xl);
        z-index: 1;
      }

      .brand {
        text-align: center;
        margin-bottom: var(--space-xl);
      }

      .brand-icon {
        width: 72px;
        height: 72px;
        margin: 0 auto var(--space-md);
        background: var(--gradient-primary);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-md);

        .material-symbols-rounded {
          font-size: 40px;
          color: white;
        }
      }

      .brand h1 {
        font-size: 28px;
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
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  onLogin() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error al iniciar sesion';
        this.loading = false;
      },
    });
  }
}
