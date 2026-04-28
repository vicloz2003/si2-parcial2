import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { User, Workshop } from '../../models/interfaces';

@Component({
  selector: 'app-admin-workshops',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-content reveal">
      <div class="page-header">
        <div>
          <h1 class="page-title">Talleres</h1>
          <p class="page-subtitle">Supervision de talleres registrados en AsisteCar</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card card"><span class="material-symbols-rounded">store</span><div><strong>{{ workshops.length }}</strong><small>Talleres</small></div></div>
        <div class="stat-card card"><span class="material-symbols-rounded">task_alt</span><div><strong>{{ availableCount }}</strong><small>Disponibles</small></div></div>
        <div class="stat-card card"><span class="material-symbols-rounded">engineering</span><div><strong>{{ totalCapacity }}</strong><small>Capacidad total</small></div></div>
        <div class="stat-card card"><span class="material-symbols-rounded">star</span><div><strong>{{ averageRating | number: '1.1-1' }}</strong><small>Rating promedio</small></div></div>
      </div>

      <div class="toolbar card">
        <div class="search-box">
          <span class="material-symbols-rounded">search</span>
          <input class="input" [(ngModel)]="searchTerm" (input)="applyFilter()" placeholder="Buscar taller, direccion o servicio">
        </div>
      </div>

      <div class="error-banner" *ngIf="error && !loading">
        <span class="material-symbols-rounded">cloud_off</span>
        <span>No se pudo cargar talleres</span>
        <button class="retry-btn" (click)="loadData()">Reintentar</button>
      </div>

      <div class="workshop-grid" *ngIf="filteredWorkshops.length > 0; else emptyTpl">
        <article class="workshop-card card" *ngFor="let workshop of filteredWorkshops">
          <div class="card-top">
            <div class="shop-icon"><span class="material-symbols-rounded">storefront</span></div>
            <span class="status" [class.active]="workshop.is_available">{{ workshop.is_available ? 'Disponible' : 'No disponible' }}</span>
          </div>
          <h3>{{ workshop.name }}</h3>
          <p>{{ workshop.description || 'Sin descripcion registrada.' }}</p>
          <div class="meta-list">
            <span><span class="material-symbols-rounded">person</span>{{ ownerName(workshop.user_id) }}</span>
            <span><span class="material-symbols-rounded">call</span>{{ workshop.phone }}</span>
            <span><span class="material-symbols-rounded">location_on</span>{{ workshop.address }}</span>
          </div>
          <div class="metrics">
            <div><strong>{{ workshop.capacity }}</strong><small>Capacidad</small></div>
            <div><strong>{{ workshop.rating | number: '1.1-1' }}</strong><small>Rating</small></div>
            <div><strong>{{ workshop.total_ratings }}</strong><small>Reviews</small></div>
          </div>
          <div class="services">
            <span *ngFor="let service of workshop.services.split(',')">{{ getServiceLabel(service) }}</span>
          </div>
        </article>
      </div>

      <ng-template #emptyTpl>
        <div class="empty-state card">
          <div class="empty-icon"><span class="material-symbols-rounded">storefront</span></div>
          <h3>Sin talleres</h3>
          <p>No hay talleres que coincidan con la busqueda.</p>
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
    .toolbar { padding: var(--space-md); margin-bottom: var(--space-md); }
    .search-box { position: relative; }
    .search-box .material-symbols-rounded { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--color-text-tertiary); }
    .search-box .input { padding-left: 2.5rem; }
    .workshop-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-md); }
    .workshop-card { padding: var(--space-lg); }
    .card-top { display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); margin-bottom: var(--space-md); }
    .shop-icon { width: 3rem; height: 3rem; display: grid; place-items: center; border-radius: var(--radius-md); background: var(--color-accent-50); color: var(--color-accent); }
    .workshop-card h3 { font-size: 1.125rem; margin-bottom: var(--space-sm); }
    .workshop-card p { color: var(--color-text-secondary); margin-bottom: var(--space-md); }
    .status { color: var(--color-text-tertiary); font-weight: 800; font-size: 0.75rem; }
    .status.active { color: var(--color-success); }
    .meta-list { display: grid; gap: var(--space-xs); color: var(--color-text-secondary); margin-bottom: var(--space-md); }
    .meta-list span { display: flex; align-items: center; gap: var(--space-xs); }
    .meta-list .material-symbols-rounded { font-size: 1.125rem; color: var(--color-text-tertiary); }
    .metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border: 1px solid var(--color-border); border-radius: var(--radius-sm); overflow: hidden; margin-bottom: var(--space-md); }
    .metrics div { padding: var(--space-sm); background: var(--color-surface-alt); border-right: 1px solid var(--color-border); }
    .metrics div:last-child { border-right: 0; }
    .metrics strong { display: block; font-family: 'JetBrains Mono', monospace; }
    .metrics small { color: var(--color-text-tertiary); font-weight: 700; }
    .services { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
    .services span { padding: 0.375rem 0.625rem; border-radius: var(--radius-sm); background: var(--color-primary-50); color: var(--color-primary); font-weight: 800; font-size: 0.75rem; }
    .error-banner { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-md); margin-bottom: var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); }
    .retry-btn { margin-left: auto; color: var(--color-primary); font-weight: 800; }
    @media (max-width: 980px) { .stats-grid, .workshop-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 640px) { .stats-grid, .workshop-grid { grid-template-columns: 1fr; } }
  `],
})
export class AdminWorkshopsComponent implements OnInit {
  workshops: Workshop[] = [];
  filteredWorkshops: Workshop[] = [];
  users: User[] = [];
  searchTerm = '';
  loading = true;
  error = false;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = false;
    this.api.getUsers().subscribe({ next: users => { this.users = users; this.cdr.markForCheck(); }, error: () => {} });
    this.api.getWorkshops().subscribe({
      next: (workshops) => {
        this.workshops = workshops;
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
    this.filteredWorkshops = this.workshops.filter(workshop => !term || [workshop.name, workshop.address, workshop.services, workshop.phone].some(value => value.toLowerCase().includes(term)));
  }

  get availableCount() {
    return this.workshops.filter(workshop => workshop.is_available).length;
  }

  get totalCapacity() {
    return this.workshops.reduce((sum, workshop) => sum + workshop.capacity, 0);
  }

  get averageRating() {
    if (!this.workshops.length) return 0;
    return this.workshops.reduce((sum, workshop) => sum + workshop.rating, 0) / this.workshops.length;
  }

  ownerName(userId: number) {
    return this.users.find(user => user.id === userId)?.full_name || `Usuario #${userId}`;
  }

  getServiceLabel(service: string) {
    const labels: Record<string, string> = { battery: 'Bateria', tire: 'Llantas', crash: 'Chaperio', engine: 'Motor', keys: 'Llaves', other: 'Otros' };
    return labels[service.trim()] || service.trim();
  }
}