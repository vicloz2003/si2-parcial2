import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { User, Workshop } from '../../models/interfaces';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page" *ngIf="!loading; else loadingTpl">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Mi Perfil</h1>
          <p class="subtitle">Gestiona tu informacion personal y la de tu taller</p>
        </div>
      </div>

      <!-- Profile card -->
      <div class="profile-section">
        <div class="section-card avatar-card">
          <div class="avatar-area">
            <div class="avatar-wrapper" (click)="photoInput.click()">
              <img *ngIf="photoUrl" [src]="photoUrl" alt="Foto de perfil" class="avatar-img">
              <div *ngIf="!photoUrl" class="avatar-placeholder">
                {{ initials }}
              </div>
              <div class="avatar-overlay">
                <span class="material-symbols-rounded">photo_camera</span>
              </div>
              <input
                #photoInput
                type="file"
                accept="image/jpeg,image/png,image/webp"
                (change)="onPhotoSelected($event)"
                hidden
              >
            </div>
            <div class="avatar-info">
              <h2>{{ user?.full_name }}</h2>
              <span class="role-chip">
                <span class="material-symbols-rounded">verified</span>
                Workshop
              </span>
              <p class="member-since">
                <span class="material-symbols-rounded">calendar_today</span>
                Miembro desde {{ user?.created_at | date:'MMMM yyyy' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Forms grid -->
      <div class="forms-grid">
        <!-- Personal info -->
        <div class="section-card">
          <div class="card-header">
            <div class="header-icon">
              <span class="material-symbols-rounded">person</span>
            </div>
            <div>
              <h3>Informacion Personal</h3>
              <p>Datos de tu cuenta</p>
            </div>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label>Nombre completo</label>
              <div class="input-wrapper">
                <span class="material-symbols-rounded input-icon">badge</span>
                <input type="text" [(ngModel)]="form.full_name" placeholder="Tu nombre completo">
              </div>
            </div>
            <div class="form-group">
              <label>Correo electronico</label>
              <div class="input-wrapper">
                <span class="material-symbols-rounded input-icon">mail</span>
                <input type="email" [value]="user?.email" disabled>
              </div>
              <span class="field-hint">El correo no se puede modificar</span>
            </div>
            <div class="form-group">
              <label>Telefono</label>
              <div class="input-wrapper">
                <span class="material-symbols-rounded input-icon">phone</span>
                <input type="tel" [(ngModel)]="form.phone" placeholder="+591 ...">
              </div>
            </div>
            <div class="card-actions">
              <button class="btn btn-primary" (click)="saveProfile()" [disabled]="savingProfile">
                <span class="material-symbols-rounded" *ngIf="!savingProfile">save</span>
                <span *ngIf="savingProfile">Guardando...</span>
                <span *ngIf="!savingProfile">Guardar cambios</span>
              </button>
              <span class="save-feedback" *ngIf="profileSaved">
                <span class="material-symbols-rounded">check_circle</span> Guardado
              </span>
            </div>
          </div>
        </div>

        <!-- Workshop info -->
        <div class="section-card">
          <div class="card-header">
            <div class="header-icon workshop-icon">
              <span class="material-symbols-rounded">garage</span>
            </div>
            <div>
              <h3>Datos del Taller</h3>
              <p>Informacion publica de tu taller</p>
            </div>
          </div>
          <div class="card-body" *ngIf="workshop; else noWorkshopTpl">
            <div class="form-group">
              <label>Nombre del taller</label>
              <div class="input-wrapper">
                <span class="material-symbols-rounded input-icon">store</span>
                <input type="text" [(ngModel)]="workshopForm.name" placeholder="Nombre del taller">
              </div>
            </div>
            <div class="form-group">
              <label>Descripcion</label>
              <div class="input-wrapper textarea-wrapper">
                <span class="material-symbols-rounded input-icon">description</span>
                <textarea [(ngModel)]="workshopForm.description" placeholder="Describe tu taller..." rows="3"></textarea>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Direccion</label>
                <div class="input-wrapper">
                  <span class="material-symbols-rounded input-icon">location_on</span>
                  <input type="text" [(ngModel)]="workshopForm.address" placeholder="Direccion">
                </div>
              </div>
              <div class="form-group">
                <label>Telefono del taller</label>
                <div class="input-wrapper">
                  <span class="material-symbols-rounded input-icon">call</span>
                  <input type="tel" [(ngModel)]="workshopForm.phone" placeholder="+591 ...">
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Capacidad</label>
                <div class="input-wrapper">
                  <span class="material-symbols-rounded input-icon">groups</span>
                  <input type="number" [(ngModel)]="workshopForm.capacity" min="1">
                </div>
              </div>
              <div class="form-group">
                <label>Servicios</label>
                <div class="input-wrapper">
                  <span class="material-symbols-rounded input-icon">build</span>
                  <input type="text" [(ngModel)]="workshopForm.services" placeholder="battery,tire,engine...">
                </div>
              </div>
            </div>
            <div class="card-actions">
              <button class="btn btn-primary" (click)="saveWorkshop()" [disabled]="savingWorkshop">
                <span class="material-symbols-rounded" *ngIf="!savingWorkshop">save</span>
                <span *ngIf="savingWorkshop">Guardando...</span>
                <span *ngIf="!savingWorkshop">Guardar taller</span>
              </button>
              <span class="save-feedback" *ngIf="workshopSaved">
                <span class="material-symbols-rounded">check_circle</span> Guardado
              </span>
            </div>
          </div>
          <ng-template #noWorkshopTpl>
            <div class="empty-state">
              <span class="material-symbols-rounded">garage</span>
              <p>No tienes un taller registrado aun</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Stats summary -->
      <div class="section-card stats-summary" *ngIf="workshop">
        <div class="card-header">
          <div class="header-icon stats-icon">
            <span class="material-symbols-rounded">analytics</span>
          </div>
          <div>
            <h3>Resumen</h3>
            <p>Estado actual de tu taller</p>
          </div>
        </div>
        <div class="stats-row">
          <div class="summary-stat">
            <span class="material-symbols-rounded stat-ic">star</span>
            <div>
              <span class="stat-val">{{ workshop.rating | number:'1.1-1' }}</span>
              <span class="stat-lbl">Rating</span>
            </div>
          </div>
          <div class="summary-stat">
            <span class="material-symbols-rounded stat-ic">reviews</span>
            <div>
              <span class="stat-val">{{ workshop.total_ratings }}</span>
              <span class="stat-lbl">Valoraciones</span>
            </div>
          </div>
          <div class="summary-stat">
            <span class="material-symbols-rounded stat-ic">groups</span>
            <div>
              <span class="stat-val">{{ workshop.capacity }}</span>
              <span class="stat-lbl">Capacidad</span>
            </div>
          </div>
          <div class="summary-stat">
            <span class="material-symbols-rounded stat-ic" [class.available]="workshop.is_available">
              {{ workshop.is_available ? 'check_circle' : 'cancel' }}
            </span>
            <div>
              <span class="stat-val">{{ workshop.is_available ? 'Activo' : 'Inactivo' }}</span>
              <span class="stat-lbl">Estado</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .profile-page {
      max-width: 960px;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-header {
      margin-bottom: var(--space-xl);

      h1 {
        font-size: 26px;
        font-weight: 800;
        color: var(--color-text-primary);
        margin-bottom: 4px;
      }

      .subtitle {
        color: var(--color-text-secondary);
        font-size: 14px;
      }
    }

    /* Section card */
    .section-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      margin-bottom: var(--space-lg);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-lg);
      border-bottom: 1px solid var(--color-divider);

      h3 {
        font-size: 16px;
        font-weight: 700;
        color: var(--color-text-primary);
      }

      p {
        font-size: 13px;
        color: var(--color-text-tertiary);
        margin-top: 2px;
      }
    }

    .header-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-primary-50);
      flex-shrink: 0;

      .material-symbols-rounded { font-size: 22px; color: var(--color-primary); }
    }

    .workshop-icon {
      background: rgba(255, 122, 0, 0.08);
      .material-symbols-rounded { color: var(--color-accent); }
    }

    .stats-icon {
      background: rgba(15, 173, 115, 0.08);
      .material-symbols-rounded { color: var(--color-success); }
    }

    .card-body {
      padding: var(--space-lg);
    }

    /* Avatar card */
    .avatar-card {
      padding: var(--space-xl);
    }

    .avatar-area {
      display: flex;
      align-items: center;
      gap: var(--space-xl);
    }

    .avatar-wrapper {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      position: relative;
      cursor: pointer;
      flex-shrink: 0;
      overflow: hidden;

      &:hover .avatar-overlay {
        opacity: 1;
      }
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: var(--color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .avatar-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;

      .material-symbols-rounded {
        color: white;
        font-size: 28px;
      }
    }

    .avatar-info {
      h2 {
        font-size: 22px;
        font-weight: 800;
        color: var(--color-text-primary);
        margin-bottom: 6px;
      }
    }

    .role-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 700;
      color: var(--color-primary);
      background: var(--color-primary-50);
      padding: 4px 12px;
      border-radius: var(--radius-pill);
      text-transform: uppercase;
      letter-spacing: 0.04em;

      .material-symbols-rounded { font-size: 14px; }
    }

    .member-since {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--color-text-tertiary);
      margin-top: 8px;

      .material-symbols-rounded { font-size: 16px; }
    }

    /* Forms */
    .forms-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-lg);
    }

    .form-group {
      margin-bottom: var(--space-md);

      label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-secondary);
        margin-bottom: 6px;
      }
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 0 var(--space-md);
      transition: all 0.2s ease;

      &:focus-within {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-50);
      }
    }

    .input-icon {
      font-size: 18px;
      color: var(--color-text-tertiary);
      flex-shrink: 0;
    }

    .input-wrapper input,
    .input-wrapper textarea {
      flex: 1;
      border: none;
      background: transparent;
      padding: 10px 0;
      font-size: 14px;
      color: var(--color-text-primary);
      outline: none;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &::placeholder {
        color: var(--color-text-tertiary);
      }
    }

    .textarea-wrapper {
      align-items: flex-start;

      .input-icon { margin-top: 10px; }

      textarea {
        resize: vertical;
        min-height: 60px;
      }
    }

    .field-hint {
      font-size: 11px;
      color: var(--color-text-tertiary);
      margin-top: 4px;
      display: block;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-top: var(--space-lg);
      padding-top: var(--space-md);
      border-top: 1px solid var(--color-divider);
    }

    .save-feedback {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-success);

      .material-symbols-rounded { font-size: 18px; }
    }

    /* Stats summary */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-md);
      padding: var(--space-lg);
    }

    .summary-stat {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
      border-radius: var(--radius-lg);
      background: var(--color-surface-alt);
    }

    .stat-ic {
      font-size: 24px;
      color: var(--color-accent);

      &.available { color: var(--color-success); }
    }

    .stat-val {
      display: block;
      font-size: 18px;
      font-weight: 800;
      color: var(--color-text-primary);
      line-height: 1.2;
    }

    .stat-lbl {
      font-size: 11px;
      color: var(--color-text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-weight: 600;
    }

    /* Empty & loading states */
    .empty-state {
      text-align: center;
      padding: var(--space-2xl);
      color: var(--color-text-tertiary);

      .material-symbols-rounded { font-size: 40px; display: block; margin: 0 auto var(--space-sm); }
      p { font-size: 14px; }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-md);
      padding: var(--space-3xl);
      color: var(--color-text-secondary);
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .forms-grid { grid-template-columns: 1fr; }
      .form-row { grid-template-columns: 1fr; }
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .avatar-area { flex-direction: column; text-align: center; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  workshop: Workshop | null = null;
  photoUrl: string | null = null;
  initials = '';
  loading = true;

  form = { full_name: '', phone: '' };
  workshopForm = { name: '', description: '', address: '', phone: '', capacity: 1, services: '' };

  savingProfile = false;
  savingWorkshop = false;
  profileSaved = false;
  workshopSaved = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadWorkshop();
  }

  loadProfile() {
    this.api.getMe().subscribe({
      next: (user) => {
        this.user = user;
        this.form.full_name = user.full_name;
        this.form.phone = user.phone || '';
        this.computeInitials(user.full_name);
        if (user.profile_photo_url) {
          this.photoUrl = user.profile_photo_url.startsWith('http')
            ? user.profile_photo_url
            : environment.apiUrl.replace('/api', '') + user.profile_photo_url;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        const cached = this.auth.getCurrentUser();
        if (cached) {
          this.user = cached;
          this.form.full_name = cached.full_name;
          this.form.phone = cached.phone || '';
          this.computeInitials(cached.full_name);
        }
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadWorkshop() {
    this.api.getMyWorkshop().subscribe({
      next: (w) => {
        this.workshop = w;
        this.workshopForm = {
          name: w.name,
          description: w.description || '',
          address: w.address,
          phone: w.phone,
          capacity: w.capacity,
          services: w.services,
        };
        this.cdr.markForCheck();
      },
      error: () => {
        this.workshop = null;
        this.cdr.markForCheck();
      }
    });
  }

  computeInitials(name: string) {
    const parts = name.split(' ');
    this.initials = parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (parts[0]?.[0] || '?').toUpperCase();
  }

  onPhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.api.uploadProfilePhoto(file).subscribe({
      next: (user) => {
        this.user = user;
        this.auth.updateUser(user);
        if (user.profile_photo_url) {
          this.photoUrl = user.profile_photo_url.startsWith('http')
            ? user.profile_photo_url
            : environment.apiUrl.replace('/api', '') + user.profile_photo_url;
        }
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  saveProfile() {
    this.savingProfile = true;
    this.profileSaved = false;
    this.api.updateProfile(this.form).subscribe({
      next: (user) => {
        this.user = user;
        this.auth.updateUser(user);
        this.computeInitials(user.full_name);
        this.savingProfile = false;
        this.profileSaved = true;
        this.cdr.markForCheck();
        setTimeout(() => { this.profileSaved = false; this.cdr.markForCheck(); }, 3000);
      },
      error: () => {
        this.savingProfile = false;
        this.cdr.markForCheck();
      }
    });
  }

  saveWorkshop() {
    this.savingWorkshop = true;
    this.workshopSaved = false;
    this.api.updateWorkshop(this.workshopForm).subscribe({
      next: (w) => {
        this.workshop = w;
        this.savingWorkshop = false;
        this.workshopSaved = true;
        this.cdr.markForCheck();
        setTimeout(() => { this.workshopSaved = false; this.cdr.markForCheck(); }, 3000);
      },
      error: () => {
        this.savingWorkshop = false;
        this.cdr.markForCheck();
      }
    });
  }
}
