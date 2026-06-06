import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { User, Workshop } from '../../models/interfaces';
import { environment } from '../../../environments/environment';
import { AppIconComponent } from '../../shared/app-icon.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  template: `
    <div class="animate-reveal mx-auto max-w-5xl space-y-6" *ngIf="!loading; else loadingTpl">
      <header class="space-y-1">
        <h1 class="font-display text-3xl font-bold text-slate-900 dark:text-white">Mi Perfil</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Gestiona tu información personal y la de tu taller</p>
      </header>

      <!-- Avatar card -->
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-hero-line dark:bg-hero-soft">
        <div class="relative">
          <div class="h-24 bg-[#111111] dark:bg-white dark:text-[#111111]"></div>
          <div class="flex flex-col items-center gap-4 px-6 pb-6 text-center sm:flex-row sm:items-end sm:text-left">
            <div class="group relative -mt-12 h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-2xl ring-4 ring-white dark:ring-hero-soft" (click)="photoInput.click()">
              <img *ngIf="photoUrl" [src]="photoUrl" alt="Foto de perfil" class="h-full w-full object-cover">
              <div *ngIf="!photoUrl" class="flex h-full w-full items-center justify-center bg-[#111111] dark:bg-white dark:text-[#111111] text-2xl font-bold text-white">
                {{ initials }}
              </div>
              <div class="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition group-hover:opacity-100">
                <app-icon name="photo_camera" class="text-white" />
              </div>
              <input #photoInput type="file" accept="image/jpeg,image/png,image/webp" (change)="onPhotoSelected($event)" hidden>
            </div>
            <div class="flex-1 pt-2 sm:pb-1">
              <h2 class="font-display text-xl font-bold text-slate-900 dark:text-white">{{ user?.full_name }}</h2>
              <span class="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-white/8 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                <app-icon name="verified" [size]="14" /> Workshop
              </span>
              <p class="mt-2 inline-flex items-center justify-center gap-1.5 text-sm text-slate-400 sm:justify-start">
                <app-icon name="calendar_today" [size]="16" />
                Miembro desde {{ user?.created_at | date:'MMMM yyyy' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Forms grid -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Personal info -->
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-hero-line dark:bg-hero-soft">
          <div class="flex items-center gap-3 border-b border-slate-100 p-5 dark:border-hero-line">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/8 text-slate-900 dark:text-white">
              <app-icon name="person" />
            </div>
            <div>
              <h3 class="font-display text-base font-bold text-slate-900 dark:text-white">Información Personal</h3>
              <p class="text-xs text-slate-400">Datos de tu cuenta</p>
            </div>
          </div>
          <div class="space-y-4 p-5">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">Nombre completo</label>
              <div class="relative">
                <app-icon name="badge" [size]="18" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2  text-slate-400" />
                <input type="text" [(ngModel)]="form.full_name" placeholder="Tu nombre completo" [ngClass]="inputCls">
              </div>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">Correo electrónico</label>
              <div class="relative">
                <app-icon name="mail" [size]="18" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2  text-slate-400" />
                <input type="email" [value]="user?.email" disabled [ngClass]="inputCls" class="opacity-60">
              </div>
              <span class="mt-1 block text-xs text-slate-400">El correo no se puede modificar</span>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">Teléfono</label>
              <div class="relative">
                <app-icon name="phone" [size]="18" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2  text-slate-400" />
                <input type="tel" [(ngModel)]="form.phone" placeholder="+591 ..." [ngClass]="inputCls">
              </div>
            </div>
            <div class="flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-hero-line">
              <button (click)="saveProfile()" [disabled]="savingProfile" [ngClass]="saveBtnCls">
                <app-icon name="save" [size]="18" *ngIf="!savingProfile" />
                {{ savingProfile ? 'Guardando...' : 'Guardar cambios' }}
              </button>
              <span class="inline-flex items-center gap-1 text-sm font-semibold text-success" *ngIf="profileSaved">
                <app-icon name="check_circle" [size]="18" /> Guardado
              </span>
            </div>
          </div>
        </div>

        <!-- Workshop info -->
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-hero-line dark:bg-hero-soft">
          <div class="flex items-center gap-3 border-b border-slate-100 p-5 dark:border-hero-line">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emergency-500/10 text-emergency-600 dark:text-emergency-300">
              <app-icon name="garage" />
            </div>
            <div>
              <h3 class="font-display text-base font-bold text-slate-900 dark:text-white">Datos del Taller</h3>
              <p class="text-xs text-slate-400">Información pública de tu taller</p>
            </div>
          </div>
          <div class="space-y-4 p-5" *ngIf="workshop; else noWorkshopTpl">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">Nombre del taller</label>
              <div class="relative">
                <app-icon name="store" [size]="18" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2  text-slate-400" />
                <input type="text" [(ngModel)]="workshopForm.name" placeholder="Nombre del taller" [ngClass]="inputCls">
              </div>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">Descripción</label>
              <div class="relative">
                <app-icon name="description" [size]="18" class="pointer-events-none absolute left-3 top-3.5  text-slate-400" />
                <textarea [(ngModel)]="workshopForm.description" placeholder="Describe tu taller..." rows="3" [ngClass]="inputCls" class="resize-y"></textarea>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">Dirección</label>
                <div class="relative">
                  <app-icon name="location_on" [size]="18" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2  text-slate-400" />
                  <input type="text" [(ngModel)]="workshopForm.address" placeholder="Dirección" [ngClass]="inputCls">
                </div>
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">Teléfono del taller</label>
                <div class="relative">
                  <app-icon name="call" [size]="18" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2  text-slate-400" />
                  <input type="tel" [(ngModel)]="workshopForm.phone" placeholder="+591 ..." [ngClass]="inputCls">
                </div>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">Capacidad</label>
                <div class="relative">
                  <app-icon name="groups" [size]="18" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2  text-slate-400" />
                  <input type="number" [(ngModel)]="workshopForm.capacity" min="1" [ngClass]="inputCls">
                </div>
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">Servicios</label>
                <div class="relative">
                  <app-icon name="build" [size]="18" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2  text-slate-400" />
                  <input type="text" [(ngModel)]="workshopForm.services" placeholder="battery,tire,engine..." [ngClass]="inputCls">
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-hero-line">
              <button (click)="saveWorkshop()" [disabled]="savingWorkshop" [ngClass]="saveBtnCls">
                <app-icon name="save" [size]="18" *ngIf="!savingWorkshop" />
                {{ savingWorkshop ? 'Guardando...' : 'Guardar taller' }}
              </button>
              <span class="inline-flex items-center gap-1 text-sm font-semibold text-success" *ngIf="workshopSaved">
                <app-icon name="check_circle" [size]="18" /> Guardado
              </span>
            </div>
          </div>
          <ng-template #noWorkshopTpl>
            <div class="flex flex-col items-center gap-2 px-6 py-12 text-center text-slate-400">
              <app-icon name="garage" [size]="36" />
              <p class="text-sm">No tienes un taller registrado aún</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Stats summary -->
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-hero-line dark:bg-hero-soft" *ngIf="workshop">
        <div class="flex items-center gap-3 border-b border-slate-100 p-5 dark:border-hero-line">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
            <app-icon name="analytics" />
          </div>
          <div>
            <h3 class="font-display text-base font-bold text-slate-900 dark:text-white">Resumen</h3>
            <p class="text-xs text-slate-400">Estado actual de tu taller</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 p-5 lg:grid-cols-4">
          <div class="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5">
            <app-icon name="star" [size]="24" class="text-amber-500" />
            <div>
              <span class="block font-display text-lg font-bold text-slate-900 dark:text-white">{{ workshop.rating | number:'1.1-1' }}</span>
              <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">Rating</span>
            </div>
          </div>
          <div class="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5">
            <app-icon name="reviews" [size]="24" class="text-slate-700 dark:text-white" />
            <div>
              <span class="block font-display text-lg font-bold text-slate-900 dark:text-white">{{ workshop.total_ratings }}</span>
              <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">Valoraciones</span>
            </div>
          </div>
          <div class="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5">
            <app-icon name="groups" [size]="24" class="text-info" />
            <div>
              <span class="block font-display text-lg font-bold text-slate-900 dark:text-white">{{ workshop.capacity }}</span>
              <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">Capacidad</span>
            </div>
          </div>
          <div class="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5">
            <app-icon [name]="workshop.is_available ? 'check_circle' : 'cancel'" [size]="24"
                      [ngClass]="workshop.is_available ? 'text-success' : 'text-slate-400'" />
            <div>
              <span class="block font-display text-lg font-bold text-slate-900 dark:text-white">{{ workshop.is_available ? 'Activo' : 'Inactivo' }}</span>
              <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">Estado</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div class="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
        <app-icon name="progress_activity" [size]="30" class="animate-spin" />
        <p class="text-sm">Cargando perfil...</p>
      </div>
    </ng-template>
  `,
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

  // Clases compartidas (evita repetir utilidades en cada input del template).
  readonly inputCls =
    'w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 dark:border-white/60 focus:bg-white focus:ring-2 focus:ring-slate-900 dark:ring-white/20 disabled:cursor-not-allowed dark:border-hero-line dark:bg-white/5 dark:text-slate-200';
  readonly saveBtnCls =
    'inline-flex items-center gap-2 rounded-xl bg-[#111111] dark:bg-white dark:text-[#111111] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(0,0,0,0.12)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

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
