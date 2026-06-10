import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/interfaces';
import { AppIconComponent } from '../../shared/app-icon.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  template: `
    <div class="animate-reveal space-y-6">

      <!-- ── Header ── -->
      <header class="space-y-2">
        <div class="inline-flex items-center gap-2 rounded-lg border border-slate-200/60 bg-white px-3 py-1.5 shadow-sm dark:border-white/8 dark:bg-white/5">
          <div class="flex h-4 w-4 items-center justify-center text-blue-500">
            <app-icon name="manage_accounts" [size]="14" />
          </div>
          <span class="font-mono text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-white/50">Directorio</span>
          <span class="h-3.5 w-px bg-slate-200 dark:bg-white/10"></span>
          <span class="font-mono text-[0.65rem] text-slate-400 dark:text-white/30">{{ users.length }} cuentas</span>
        </div>
        <h1 class="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Usuarios&nbsp;<span class="text-slate-400 dark:text-white/40">/ cuentas</span>
        </h1>
        <p class="text-sm text-slate-400 dark:text-white/35">Gestión general de cuentas de la plataforma</p>
      </header>

      <!-- ── Stats ── -->
      <section class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div *ngFor="let s of statCards()"
             class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-white/8 dark:bg-hero-soft">
          <div class="absolute left-0 top-0 h-full w-[3px] rounded-l-2xl" [ngClass]="s.accentBar"></div>
          <span class="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-30" [ngClass]="s.glow"></span>
          <div class="p-5">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl" [ngClass]="s.tile">
              <app-icon [name]="s.icon" [size]="20" />
            </div>
            <div class="mt-4">
              <div class="font-display text-3xl font-black tracking-tight text-slate-900 dark:text-white">{{ s.value }}</div>
              <div class="font-mono mt-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-white/30">{{ s.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Filtros ── -->
      <div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:flex-row dark:border-white/8 dark:bg-hero-soft">
        <div class="relative flex-1">
          <app-icon name="search" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" />
          <input [(ngModel)]="searchTerm" (input)="applyFilter()" placeholder="Buscar nombre, correo o teléfono…"
                 class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition
                        focus:border-slate-400 focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-black/8
                        dark:border-white/8 dark:bg-white/5 dark:text-white dark:placeholder:text-white/25
                        dark:focus:border-white/30 dark:focus:ring-white/8">
        </div>
        <select [(ngModel)]="roleFilter" (change)="applyFilter()"
                class="h-10 cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition
                       focus:border-slate-400 focus:ring-2 focus:ring-black/8
                       dark:border-white/8 dark:bg-white/5 dark:text-white dark:[color-scheme:dark]
                       dark:focus:border-white/30 sm:w-44">
          <option value="">Todos los roles</option>
          <option value="admin">Admins</option>
          <option value="workshop">Talleres</option>
          <option value="client">Clientes</option>
        </select>
      </div>

      <!-- ── Error ── -->
      <div *ngIf="error && !loading"
           class="flex flex-wrap items-center gap-3 rounded-2xl border border-emergency-200 bg-emergency-50 px-4 py-3 text-sm text-emergency-700 dark:border-emergency-500/30 dark:bg-emergency-500/10 dark:text-emergency-300">
        <app-icon name="cloud_off" /><span>No se pudo cargar usuarios</span>
        <button (click)="loadData()" class="ml-auto inline-flex items-center gap-1 rounded-lg border border-emergency-300 px-3 py-1.5 text-xs font-semibold hover:bg-emergency-100">
          <app-icon name="refresh" [size]="14" /> Reintentar
        </button>
      </div>

      <!-- ── Tabla ── -->
      <div *ngIf="filteredUsers.length > 0; else emptyTpl"
           class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-white/8 dark:bg-hero-soft">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/80 text-left dark:border-white/6 dark:bg-white/4">
                <th class="whitespace-nowrap px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-white/30">Usuario</th>
                <th class="whitespace-nowrap px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-white/30">Correo</th>
                <th class="whitespace-nowrap px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-white/30">Teléfono</th>
                <th class="whitespace-nowrap px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-white/30">Rol</th>
                <th class="whitespace-nowrap px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-white/30">Estado</th>
                <th class="whitespace-nowrap px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-white/30">Registro</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr *ngFor="let user of filteredUsers"
                  class="transition hover:bg-slate-50/80 dark:hover:bg-white/4">
                <!-- Avatar + nombre -->
                <td class="whitespace-nowrap px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white shadow-sm"
                         [ngClass]="userAvatarCls(user.full_name)">
                      {{ getInitials(user.full_name) }}
                    </div>
                    <div>
                      <div class="font-semibold text-slate-800 dark:text-slate-100">{{ user.full_name }}</div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">{{ user.email }}</td>
                <td class="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{{ user.phone }}</td>
                <!-- Rol coloreado -->
                <td class="whitespace-nowrap px-4 py-3">
                  <span class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold" [ngClass]="roleCls(user.role)">
                    <app-icon [name]="roleIcon(user.role)" [size]="12" />
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <!-- Estado -->
                <td class="whitespace-nowrap px-4 py-3">
                  <span class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold"
                        [ngClass]="user.is_active ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-white/6 dark:text-slate-500'">
                    <span class="h-1.5 w-1.5 rounded-full"
                          [ngClass]="user.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'"></span>
                    {{ user.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-400 dark:text-white/30">{{ user.created_at | date: 'dd/MM/yyyy' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ng-template #emptyTpl>
        <div class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-card dark:border-white/8 dark:bg-hero-soft">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5"><app-icon name="person_search" [size]="32" /></div>
          <div>
            <h3 class="font-display text-base font-bold text-slate-700 dark:text-slate-200">Sin usuarios</h3>
            <p class="mt-1 text-sm text-slate-400">No hay cuentas que coincidan con los filtros.</p>
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  roleFilter = '';
  loading = true;
  error = false;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = false;
    this.api.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilter();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredUsers = this.users.filter(user => {
      const matchesTerm = !term || [user.full_name, user.email, user.phone].some(value => value.toLowerCase().includes(term));
      const matchesRole = !this.roleFilter || user.role === this.roleFilter;
      return matchesTerm && matchesRole;
    });
  }

  countByRole(role: User['role']) {
    return this.users.filter(user => user.role === role).length;
  }

  getRoleLabel(role: User['role']) {
    return role === 'admin' ? 'Admin' : role === 'workshop' ? 'Taller' : 'Cliente';
  }

  roleIcon(role: User['role']): string {
    return role === 'admin' ? 'shield' : role === 'workshop' ? 'store' : 'directions_car';
  }

  roleCls(role: User['role']): string {
    const map: Record<string, string> = {
      admin:    'bg-violet-500/12 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
      workshop: 'bg-amber-400/12 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
      client:   'bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    };
    return map[role] || 'bg-slate-100 text-slate-500 dark:bg-white/6';
  }

  getInitials(name: string) {
    const parts = name.split(' ').filter(Boolean);
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : (parts[0]?.[0] || '?').toUpperCase();
  }

  /** Avatar color generado por hash del nombre — 10 colores distintos */
  userAvatarCls(name: string): string {
    const palettes = [
      'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
      'bg-rose-500',  'bg-cyan-500',    'bg-indigo-500', 'bg-orange-500',
      'bg-teal-500',  'bg-pink-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xff;
    return palettes[hash % palettes.length];
  }

  /** Stats cards — mismo sistema visual que dashboard/KPIs */
  statCards() {
    return [
      { label: 'Total usuarios',  icon: 'groups',              value: this.users.length,
        tile: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
        glow: 'bg-blue-500', accentBar: 'bg-blue-500' },
      { label: 'Talleres socios', icon: 'store',               value: this.countByRole('workshop'),
        tile: 'bg-amber-400/15 text-amber-600 dark:text-amber-400',
        glow: 'bg-amber-400', accentBar: 'bg-amber-400' },
      { label: 'Clientes activos', icon: 'directions_car',     value: this.countByRole('client'),
        tile: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        glow: 'bg-emerald-500', accentBar: 'bg-emerald-500' },
      { label: 'Administradores', icon: 'admin_panel_settings', value: this.countByRole('admin'),
        tile: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
        glow: 'bg-violet-500', accentBar: 'bg-violet-500' },
    ];
  }
}