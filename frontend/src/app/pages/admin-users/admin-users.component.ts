import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/interfaces';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-content reveal">
      <div class="page-header">
        <div>
          <h1 class="page-title">Usuarios</h1>
          <p class="page-subtitle">Gestion general de cuentas de la plataforma</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card card">
          <span class="material-symbols-rounded">groups</span>
          <div><strong>{{ users.length }}</strong><small>Total usuarios</small></div>
        </div>
        <div class="stat-card card">
          <span class="material-symbols-rounded">store</span>
          <div><strong>{{ countByRole('workshop') }}</strong><small>Talleres</small></div>
        </div>
        <div class="stat-card card">
          <span class="material-symbols-rounded">directions_car</span>
          <div><strong>{{ countByRole('client') }}</strong><small>Clientes</small></div>
        </div>
        <div class="stat-card card">
          <span class="material-symbols-rounded">admin_panel_settings</span>
          <div><strong>{{ countByRole('admin') }}</strong><small>Admins</small></div>
        </div>
      </div>

      <div class="toolbar card">
        <div class="search-box">
          <span class="material-symbols-rounded">search</span>
          <input class="input" [(ngModel)]="searchTerm" (input)="applyFilter()" placeholder="Buscar nombre, correo o telefono">
        </div>
        <select class="input role-filter" [(ngModel)]="roleFilter" (change)="applyFilter()">
          <option value="">Todos los roles</option>
          <option value="admin">Admins</option>
          <option value="workshop">Talleres</option>
          <option value="client">Clientes</option>
        </select>
      </div>

      <div class="error-banner" *ngIf="error && !loading">
        <span class="material-symbols-rounded">cloud_off</span>
        <span>No se pudo cargar usuarios</span>
        <button class="retry-btn" (click)="loadData()">Reintentar</button>
      </div>

      <div class="card" *ngIf="filteredUsers.length > 0; else emptyTpl">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Telefono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of filteredUsers">
                <td>
                  <div class="user-cell">
                    <div class="avatar">{{ getInitials(user.full_name) }}</div>
                    <strong>{{ user.full_name }}</strong>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>{{ user.phone }}</td>
                <td><span class="badge badge-soft" [ngClass]="'role-' + user.role">{{ getRoleLabel(user.role) }}</span></td>
                <td><span class="status" [class.active]="user.is_active">{{ user.is_active ? 'Activo' : 'Inactivo' }}</span></td>
                <td>{{ user.created_at | date: 'dd/MM/yyyy' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ng-template #emptyTpl>
        <div class="empty-state card">
          <div class="empty-icon"><span class="material-symbols-rounded">person_search</span></div>
          <h3>Sin usuarios</h3>
          <p>No hay cuentas que coincidan con los filtros.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-md); margin-bottom: var(--space-md); }
    .stat-card { padding: var(--space-md); display: flex; align-items: center; gap: var(--space-md); }
    .stat-card > .material-symbols-rounded { width: 2.75rem; height: 2.75rem; display: grid; place-items: center; border-radius: var(--radius-md); background: var(--color-primary-50); color: var(--color-primary); }
    .stat-card strong { display: block; font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; color: var(--color-text-primary); }
    .stat-card small { color: var(--color-text-secondary); font-weight: 700; }
    .toolbar { padding: var(--space-md); display: flex; gap: var(--space-sm); margin-bottom: var(--space-md); }
    .search-box { position: relative; flex: 1; }
    .search-box .material-symbols-rounded { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--color-text-tertiary); }
    .search-box .input { padding-left: 2.5rem; }
    .role-filter { max-width: 14rem; }
    .table-wrapper { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.875rem; text-align: left; border-bottom: 1px solid var(--color-divider); white-space: nowrap; }
    th { background: var(--color-surface-alt); color: var(--color-text-tertiary); font-size: 0.6875rem; text-transform: uppercase; }
    .user-cell { display: flex; align-items: center; gap: var(--space-sm); }
    .avatar { width: 2rem; height: 2rem; border-radius: 50%; display: grid; place-items: center; background: var(--color-primary); color: white; font-weight: 800; font-size: 0.75rem; }
    .role-admin { color: var(--color-primary); }
    .role-workshop { color: var(--color-accent); }
    .role-client { color: var(--color-success); }
    .status { color: var(--color-text-tertiary); font-weight: 700; }
    .status.active { color: var(--color-success); }
    .error-banner { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-md); margin-bottom: var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); }
    .retry-btn { margin-left: auto; color: var(--color-primary); font-weight: 800; }
    @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .toolbar { flex-direction: column; } .role-filter { max-width: none; } }
    @media (max-width: 560px) { .stats-grid { grid-template-columns: 1fr; } }
  `],
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

  getInitials(name: string) {
    const parts = name.split(' ').filter(Boolean);
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : (parts[0]?.[0] || '?').toUpperCase();
  }
}