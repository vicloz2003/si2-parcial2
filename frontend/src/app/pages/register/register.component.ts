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
      <div class="auth-wrapper">
        <div class="auth-hero">
          <div class="hero-content">
            <a routerLink="/login" class="back-link">
              <span class="material-symbols-rounded">arrow_back</span>
              Volver al login
            </a>
            <img src="logo.png" alt="AsisteCar" class="hero-logo">
            <h2>Únete a la red de <span class="highlight">talleres AsisteCar</span></h2>
            <p>Recibe solicitudes de emergencia vehicular automáticamente y gestiona tu equipo desde un solo panel.</p>
            <div class="hero-features">
              <div class="feature-item">
                <span class="material-symbols-rounded">bolt</span>
                <span>Asignación automática por cercanía</span>
              </div>
              <div class="feature-item">
                <span class="material-symbols-rounded">smart_toy</span>
                <span>Clasificación con IA integrada</span>
              </div>
              <div class="feature-item">
                <span class="material-symbols-rounded">payments</span>
                <span>Gestión de pagos y comisiones</span>
              </div>
            </div>
          </div>
        </div>

        <div class="auth-card">
          <div class="auth-card-inner">
            <div class="brand">
              <div class="step-indicator">
                <span class="material-symbols-rounded">store</span>
                Registro de taller
              </div>
              <h1>Crea tu cuenta</h1>
              <p>Completa tus datos para empezar</p>
            </div>

            <form (ngSubmit)="onRegister()" class="auth-form" #f="ngForm">
              <div class="field">
                <label class="field-label">Nombre completo / Razón social</label>
                <div class="input-with-icon">
                  <span class="material-symbols-rounded">badge</span>
                  <input type="text" class="input" [(ngModel)]="form.full_name" name="full_name"
                    placeholder="Taller Mecánico López" required />
                </div>
              </div>

              <div class="field">
                <label class="field-label">Correo electrónico</label>
                <div class="input-with-icon">
                  <span class="material-symbols-rounded">mail</span>
                  <input type="email" class="input" [(ngModel)]="form.email" name="email"
                    placeholder="contacto&#64;taller.com" required />
                </div>
              </div>

              <div class="field">
                <label class="field-label">Teléfono</label>
                <div class="input-with-icon">
                  <span class="material-symbols-rounded">call</span>
                  <input type="tel" class="input" [(ngModel)]="form.phone" name="phone"
                    placeholder="78912345" required />
                </div>
              </div>

              <div class="field">
                <label class="field-label">Contraseña</label>
                <div class="input-with-icon">
                  <span class="material-symbols-rounded">lock</span>
                  <input [type]="showPassword ? 'text' : 'password'" class="input"
                    [(ngModel)]="form.password" name="password" placeholder="Mínimo 6 caracteres"
                    required minlength="6" />
                  <button type="button" class="toggle-pass" (click)="showPassword = !showPassword" tabindex="-1">
                    <span class="material-symbols-rounded">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
              </div>

              <div class="error-box" *ngIf="error">
                <span class="material-symbols-rounded">error</span>
                <span>{{ error }}</span>
              </div>

              <button type="submit" class="btn btn-primary btn-block register-btn" [disabled]="loading || !f.valid">
                <ng-container *ngIf="!loading">
                  <span>Crear cuenta</span>
                  <span class="material-symbols-rounded">arrow_forward</span>
                </ng-container>
                <ng-container *ngIf="loading">
                  <span class="spinner"></span>
                  <span>Registrando...</span>
                </ng-container>
              </button>
            </form>

            <div class="auth-footer">
              <span>¿Ya tienes cuenta?</span>
              <a routerLink="/login">Inicia sesión</a>
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

    .back-link {
      display: inline-flex; align-items: center; gap: 4px;
      color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 500;
      margin-bottom: var(--space-xl); padding: 6px 12px; margin-left: -12px;
      border-radius: var(--radius-sm); transition: all var(--transition-fast);
      .material-symbols-rounded { font-size: 18px; }
      &:hover { background: rgba(255,255,255,0.08); color: white; }
    }

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
    }

    .hero-features { display: flex; flex-direction: column; gap: var(--space-sm); }

    .feature-item {
      display: flex; align-items: center; gap: var(--space-sm);
      color: rgba(255,255,255,0.6); font-size: 13px; font-weight: 500;
      padding: 8px 12px; border-radius: var(--radius-sm);
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
      transition: all var(--transition-fast);
      .material-symbols-rounded { font-size: 18px; color: var(--color-accent); }
      &:hover { background: rgba(255,255,255,0.1); }
    }

    .auth-card {
      width: 440px; flex-shrink: 0;
      background: var(--color-surface); display: flex; align-items: center;
    }

    .auth-card-inner { width: 100%; padding: var(--space-xl); }
    .brand { margin-bottom: var(--space-lg); }

    .step-indicator {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 12px;
      background: var(--color-primary-50); color: var(--color-primary);
      border-radius: var(--radius-pill);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px; font-weight: 700; letter-spacing: 0.02em;
      margin-bottom: var(--space-md);
      .material-symbols-rounded { font-size: 16px; }
    }

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

    .register-btn { margin-top: var(--space-sm); min-height: 48px; font-size: 15px; border-radius: var(--radius-md); font-weight: 700; }

    .toggle-pass {
      position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
      padding: 6px; border-radius: var(--radius-sm);
      color: var(--color-text-tertiary); display: flex; align-items: center;
      transition: all var(--transition-fast);
      &:hover { background: var(--color-surface-alt); color: var(--color-text-primary); }
      .material-symbols-rounded { font-size: 20px; }
    }

    .register-btn { margin-top: var(--space-sm); min-height: 48px; font-size: 15px; border-radius: var(--radius-md); font-weight: 700; }

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
    }
  `]
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
