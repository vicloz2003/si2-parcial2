import { Component, OnInit } from '@angular/core';
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
      <div class="auth-wrapper">
        <div class="auth-hero">
          <div class="hero-content">
            <img src="logo.png" alt="AsisteCar" class="hero-logo">
            <h2>Emergencias vehiculares con <span class="highlight">inteligencia artificial</span></h2>
            <p>Panel avanzado para talleres. Asignación automatica, monitoreo GPS en tiempo real y clasificación IA.</p>
            <div class="hero-metrics">
              <div class="metric">
                <span class="metric-value">24/7</span>
                <span class="metric-label">Disponible</span>
              </div>
              <div class="metric-divider"></div>
              <div class="metric">
                <span class="metric-value">IA</span>
                <span class="metric-label">Clasificación</span>
              </div>
              <div class="metric-divider"></div>
              <div class="metric">
                <span class="metric-value">GPS</span>
                <span class="metric-label">Tiempo real</span>
              </div>
            </div>
          </div>
        </div>

        <div class="auth-card">
          <div class="auth-card-inner">
            <div class="brand">
              <h1>Bienvenido</h1>
              <p>Ingresa a tu panel de gestión</p>
            </div>

            <form (ngSubmit)="onLogin()" class="auth-form" #f="ngForm">
              <div class="field">
                <label class="field-label">Correo electrónico</label>
                <div class="input-with-icon">
                  <span class="material-symbols-rounded">mail</span>
                  <input type="email" class="input" [(ngModel)]="email" name="email"
                    placeholder="correo&#64;taller.com" required autocomplete="email" />
                </div>
              </div>

              <div class="field">
                <label class="field-label">Contraseña</label>
                <div class="input-with-icon">
                  <span class="material-symbols-rounded">lock</span>
                  <input [type]="showPassword ? 'text' : 'password'" class="input"
                    [(ngModel)]="password" name="password" placeholder="••••••••"
                    required autocomplete="current-password" />
                  <button type="button" class="toggle-pass" (click)="showPassword = !showPassword" tabindex="-1">
                    <span class="material-symbols-rounded">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
              </div>

              <div class="error-box" *ngIf="error">
                <span class="material-symbols-rounded">error</span>
                <span>{{ error }}</span>
              </div>

              <button type="submit" class="btn btn-primary btn-block login-btn" [disabled]="loading || !f.valid">
                <ng-container *ngIf="!loading">
                  <span>Ingresar al panel</span>
                  <span class="material-symbols-rounded">arrow_forward</span>
                </ng-container>
                <ng-container *ngIf="loading">
                  <span class="spinner"></span>
                  <span>Verificando...</span>
                </ng-container>
              </button>
            </form>

            <div class="auth-footer">
              <span>¿No tienes cuenta?</span>
              <a routerLink="/register">Crear cuenta de taller</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: var(--color-bg);
      padding: var(--space-lg);
    }

    .auth-wrapper {
      display: flex;
      max-width: 960px; width: 100%;
      border-radius: var(--radius-xl); overflow: hidden;
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      box-shadow: var(--shadow-lg);
      animation: revealUp 0.6s var(--ease-out) both;
    }

    .auth-hero {
      flex: 1;
      background: var(--color-primary);
      padding: var(--space-2xl);
      display: flex; align-items: center;
    }

    .hero-content { position: relative; z-index: 1; }

    .hero-logo {
      width: 56px; height: 56px;
      border-radius: var(--radius-md);
      object-fit: contain; background: white; padding: 6px;
      margin-bottom: var(--space-lg);
    }

    .auth-hero h2 {
      font-size: 26px; font-weight: 800; color: white;
      line-height: 1.3; letter-spacing: -0.03em;
      margin-bottom: var(--space-md);
    }

    .highlight { color: var(--color-accent); }

    .auth-hero p {
      color: rgba(255,255,255,0.55); font-size: 14px;
      line-height: 1.7; margin-bottom: var(--space-xl);
      max-width: 380px;
    }

    .hero-metrics {
      display: flex; align-items: center; gap: var(--space-lg);
      padding-top: var(--space-lg);
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .metric { display: flex; flex-direction: column; gap: 2px; }
    .metric-value { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 700; color: white; }
    .metric-label { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; }
    .metric-divider { width: 1px; height: 28px; background: rgba(255,255,255,0.1); }

    .auth-card {
      width: 420px; flex-shrink: 0;
      background: var(--color-surface); display: flex; align-items: center;
    }

    .auth-card-inner { width: 100%; padding: var(--space-2xl) var(--space-xl); }

    .brand { margin-bottom: var(--space-xl); }
    .brand h1 { font-size: 26px; font-weight: 800; color: var(--color-text-primary); letter-spacing: -0.03em; margin-bottom: 4px; }
    .brand p { color: var(--color-text-tertiary); font-size: 14px; }

    .auth-form { display: flex; flex-direction: column; gap: var(--space-md); }

    .toggle-pass {
      position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
      padding: 6px; border-radius: var(--radius-sm);
      color: var(--color-text-tertiary); display: flex; align-items: center;
      transition: all var(--transition-fast);
      &:hover { background: var(--color-surface-alt); color: var(--color-text-primary); }
      .material-symbols-rounded { font-size: 20px; }
    }

    .login-btn { margin-top: var(--space-sm); min-height: 48px; font-size: 15px; border-radius: var(--radius-md); font-weight: 700; letter-spacing: -0.01em; }

    .error-box {
      display: flex; align-items: center; gap: var(--space-sm);
      padding: 10px 14px;
      background: var(--color-danger-light);
      border-radius: var(--radius-md);
      color: var(--color-danger); font-size: 13px; font-weight: 500;
      animation: fadeIn 0.3s var(--ease-out);
      .material-symbols-rounded { font-size: 18px; }
    }

    .spinner { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .auth-footer {
      text-align: center; margin-top: var(--space-xl);
      padding-top: var(--space-lg); border-top: 1px solid var(--color-divider);
      color: var(--color-text-tertiary); font-size: 14px;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      a { color: var(--color-blue); font-weight: 700; &:hover { color: var(--color-accent); } }
    }

    @media (max-width: 768px) {
      .auth-wrapper { flex-direction: column; max-width: 440px; }
      .auth-hero { padding: var(--space-xl); }
      .auth-hero h2 { font-size: 22px; }
      .auth-card { width: 100%; }
      .hero-metrics { display: none; }
    }
  `],
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
      this.router.navigate(['/dashboard']);
    }
  }

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
