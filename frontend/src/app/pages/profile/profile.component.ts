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
    /* ── Mobile-first: Profile page ── */
    .profile-page {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(0.5rem); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-header {
      margin-bottom: var(--space-lg);
      h1 { font-size: 1.375rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: 0.25rem; }
      .subtitle { color: var(--color-text-secondary); font-size: 0.875rem; }
    }

    /* Section card */
    .section-card {
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-radius: var(--radius-lg); margin-bottom: var(--space-md);
    }

    .card-header {
      display: flex; align-items: center; gap: var(--space-sm);
      padding: var(--space-md); border-bottom: 1px solid var(--color-divider);
      h3 { font-size: 1rem; font-weight: 700; color: var(--color-text-primary); }
      p { font-size: 0.8125rem; color: var(--color-text-tertiary); margin-top: 0.125rem; }
    }

    .header-icon {
      width: 2.25rem; height: 2.25rem; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      background: var(--color-primary-50); flex-shrink: 0;
      .material-symbols-rounded { font-size: 1.25rem; color: var(--color-primary); }
    }

    .workshop-icon {
      background: rgba(255, 122, 0, 0.08);
      .material-symbols-rounded { color: var(--color-accent); }
    }

    .stats-icon {
      background: rgba(15, 173, 115, 0.08);
      .material-symbols-rounded { color: var(--color-success); }
    }

    .card-body { padding: var(--space-md); }

    /* Avatar card — mobile: stacked, centered */
    .avatar-card { padding: var(--space-md); }

    .avatar-area {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; gap: var(--space-md);
    }

    .avatar-wrapper {
      width: 5rem; height: 5rem; border-radius: 50%;
      position: relative; cursor: pointer; flex-shrink: 0; overflow: hidden;
      &:hover .avatar-overlay { opacity: 1; }
    }

    .avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }

    .avatar-placeholder {
      width: 100%; height: 100%; border-radius: 50%;
      background: var(--color-primary); color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.75rem; font-weight: 800; letter-spacing: -0.02em;
    }

    .avatar-overlay {
      position: absolute; inset: 0; background: rgba(0, 0, 0, 0.45);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.2s ease;
      .material-symbols-rounded { color: white; font-size: 1.75rem; }
    }

    .avatar-info {
      h2 { font-size: 1.125rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: 0.375rem; }
    }

    .role-chip {
      display: inline-flex; align-items: center; gap: 0.25rem;
      font-size: 0.75rem; font-weight: 700; color: var(--color-primary);
      background: var(--color-primary-50);
      padding: 0.25rem 0.75rem; border-radius: var(--radius-pill);
      text-transform: uppercase; letter-spacing: 0.04em;
      .material-symbols-rounded { font-size: 0.875rem; }
    }

    .member-since {
      display: flex; align-items: center; justify-content: center; gap: 0.375rem;
      font-size: 0.8125rem; color: var(--color-text-tertiary); margin-top: 0.5rem;
      .material-symbols-rounded { font-size: 1rem; }
    }

    /* Forms — mobile: single column */
    .forms-grid {
      display: grid; grid-template-columns: 1fr; gap: var(--space-md);
    }

    .form-group {
      margin-bottom: var(--space-sm);
      label { display: block; font-size: 0.8125rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 0.375rem; }
    }

    .input-wrapper {
      display: flex; align-items: center; gap: var(--space-sm);
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md); padding: 0 var(--space-md);
      transition: all 0.2s ease;
      &:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-50); }
    }

    .input-icon { font-size: 1.125rem; color: var(--color-text-tertiary); flex-shrink: 0; }

    .input-wrapper input, .input-wrapper textarea {
      flex: 1; border: none; background: transparent;
      padding: 0.625rem 0; font-size: 0.875rem;
      color: var(--color-text-primary); outline: none;
      &:disabled { opacity: 0.5; cursor: not-allowed; }
      &::placeholder { color: var(--color-text-tertiary); }
    }

    .textarea-wrapper {
      align-items: flex-start;
      .input-icon { margin-top: 0.625rem; }
      textarea { resize: vertical; min-height: 3.75rem; }
    }

    .field-hint { font-size: 0.6875rem; color: var(--color-text-tertiary); margin-top: 0.25rem; display: block; }

    .form-row { display: grid; grid-template-columns: 1fr; gap: var(--space-sm); }

    .card-actions {
      display: flex; align-items: center; gap: var(--space-sm);
      margin-top: var(--space-md); padding-top: var(--space-sm);
      border-top: 1px solid var(--color-divider);
    }

    .save-feedback {
      display: inline-flex; align-items: center; gap: 0.25rem;
      font-size: 0.8125rem; font-weight: 600; color: var(--color-success);
      .material-symbols-rounded { font-size: 1.125rem; }
    }

    /* Stats — mobile: 1-col */
    .stats-row {
      display: grid; grid-template-columns: 1fr;
      gap: var(--space-sm); padding: var(--space-md);
    }

    .summary-stat {
      display: flex; align-items: center; gap: var(--space-sm);
      padding: var(--space-sm); border-radius: var(--radius-lg);
      background: var(--color-surface-alt);
    }

    .stat-ic { font-size: 1.5rem; color: var(--color-accent); &.available { color: var(--color-success); } }
    .stat-val { display: block; font-size: 1.125rem; font-weight: 800; color: var(--color-text-primary); line-height: 1.2; }
    .stat-lbl { font-size: 0.6875rem; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }

    /* Empty & loading */
    .empty-state {
      text-align: center; padding: var(--space-xl); color: var(--color-text-tertiary);
      .material-symbols-rounded { font-size: 2.5rem; display: block; margin: 0 auto var(--space-sm); }
      p { font-size: 0.875rem; }
    }

    .loading-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: var(--space-md); padding: var(--space-2xl); color: var(--color-text-secondary);
    }

    .spinner {
      width: 2.25rem; height: 2.25rem; border: 3px solid var(--color-border);
      border-top-color: var(--color-primary); border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── ≥576px: 2-col stats ── */
    @media (min-width: 576px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); gap: var(--space-md); }
      .avatar-wrapper { width: 5.5rem; height: 5.5rem; }
      .avatar-placeholder { font-size: 2rem; }
      .summary-stat { padding: var(--space-md); }
    }

    /* ── ≥768px: side-by-side avatar, 2-col form-row ── */
    @media (min-width: 768px) {
      .avatar-area { flex-direction: row; text-align: left; gap: var(--space-xl); }
      .member-since { justify-content: flex-start; }
      .avatar-wrapper { width: 6.25rem; height: 6.25rem; }
      .avatar-placeholder { font-size: 2.25rem; }
      .avatar-info h2 { font-size: 1.375rem; }
      .form-row { grid-template-columns: 1fr 1fr; gap: var(--space-md); }
      .section-card { border-radius: var(--radius-xl); }
      .card-header { padding: var(--space-lg); gap: var(--space-md); }
      .card-body { padding: var(--space-lg); }
      .avatar-card { padding: var(--space-xl); }
      .header-icon { width: 2.5rem; height: 2.5rem; .material-symbols-rounded { font-size: 1.375rem; } }
    }

    /* ── ≥1024px: 2-col forms grid, 4-col stats, max-width ── */
    @media (min-width: 1024px) {
      .profile-page { max-width: 60rem; }
      .forms-grid { grid-template-columns: 1fr 1fr; gap: var(--space-lg); }
      .stats-row { grid-template-columns: repeat(4, 1fr); padding: var(--space-lg); }
      .page-header h1 { font-size: 1.625rem; }
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
