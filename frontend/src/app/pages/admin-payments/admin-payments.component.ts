import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AdminPayment, AdminPaymentSummary } from '../../models/interfaces';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-content reveal">
      <div class="page-header">
        <div>
          <h1 class="page-title">Pagos y comisiones</h1>
          <p class="page-subtitle">Control economico global de la plataforma</p>
        </div>
      </div>

      <div class="stats-grid" *ngIf="summary">
        <div class="stat-card card"><span class="material-symbols-rounded">receipt_long</span><div><strong>{{ summary.total_payments }}</strong><small>Pagos</small></div></div>
        <div class="stat-card card"><span class="material-symbols-rounded">payments</span><div><strong>Bs {{ summary.total_amount | number:'1.2-2' }}</strong><small>Total cobrado</small></div></div>
        <div class="stat-card card"><span class="material-symbols-rounded">account_balance</span><div><strong>Bs {{ summary.total_commission | number:'1.2-2' }}</strong><small>Comision plataforma</small></div></div>
        <div class="stat-card card"><span class="material-symbols-rounded">credit_card</span><div><strong>Bs {{ summary.card_amount | number:'1.2-2' }}</strong><small>Tarjeta</small></div></div>
      </div>

      <div class="toolbar card">
        <div class="search-box">
          <span class="material-symbols-rounded">search</span>
          <input class="input" [(ngModel)]="searchTerm" (input)="applyFilter()" placeholder="Buscar cliente, taller o transaccion">
        </div>
        <select class="input filter" [(ngModel)]="methodFilter" (change)="applyFilter()">
          <option value="">Todos los metodos</option>
          <option value="card">Tarjeta</option>
          <option value="cash">Efectivo</option>
        </select>
      </div>

      <div class="card" *ngIf="filteredPayments.length > 0; else emptyTpl">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr><th>Incidente</th><th>Cliente</th><th>Taller</th><th>Metodo</th><th>Monto</th><th>Comision</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let payment of filteredPayments">
                <td>#{{ payment.incident_id }}</td>
                <td>{{ payment.client_name || 'Cliente' }}</td>
                <td>{{ payment.workshop_name || 'Sin taller' }}</td>
                <td><span class="badge badge-soft">{{ payment.payment_method === 'cash' ? 'Efectivo' : 'Tarjeta' }}</span></td>
                <td>Bs {{ payment.amount | number:'1.2-2' }}</td>
                <td>Bs {{ payment.commission_amount | number:'1.2-2' }}</td>
                <td>{{ payment.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ng-template #emptyTpl>
        <div class="empty-state card"><div class="empty-icon"><span class="material-symbols-rounded">payments</span></div><h3>Sin pagos</h3><p>No hay pagos que coincidan con los filtros.</p></div>
      </ng-template>
    </div>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-md); margin-bottom: var(--space-md); }
    .stat-card { padding: var(--space-md); display: flex; align-items: center; gap: var(--space-md); }
    .stat-card > .material-symbols-rounded { width: 2.75rem; height: 2.75rem; display: grid; place-items: center; border-radius: var(--radius-md); background: var(--color-primary-50); color: var(--color-primary); }
    .stat-card strong { display: block; color: var(--color-text-primary); font-size: 1.25rem; }
    .stat-card small { color: var(--color-text-secondary); font-weight: 800; }
    .toolbar { padding: var(--space-md); display: flex; gap: var(--space-sm); margin-bottom: var(--space-md); }
    .search-box { position: relative; flex: 1; }
    .search-box .material-symbols-rounded { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--color-text-tertiary); }
    .search-box .input { padding-left: 2.5rem; }
    .filter { max-width: 14rem; }
    .table-wrapper { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.875rem; text-align: left; border-bottom: 1px solid var(--color-divider); white-space: nowrap; }
    th { background: var(--color-surface-alt); color: var(--color-text-tertiary); font-size: 0.6875rem; text-transform: uppercase; }
    @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .toolbar { flex-direction: column; } .filter { max-width: none; } }
    @media (max-width: 560px) { .stats-grid { grid-template-columns: 1fr; } }
  `],
})
export class AdminPaymentsComponent implements OnInit {
  payments: AdminPayment[] = [];
  filteredPayments: AdminPayment[] = [];
  summary: AdminPaymentSummary | null = null;
  searchTerm = '';
  methodFilter = '';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getAdminPaymentSummary().subscribe(summary => { this.summary = summary; this.cdr.markForCheck(); });
    this.api.getAdminPayments().subscribe(payments => { this.payments = payments; this.applyFilter(); this.cdr.markForCheck(); });
  }

  applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredPayments = this.payments.filter(payment => {
      const matchesMethod = !this.methodFilter || payment.payment_method === this.methodFilter;
      const haystack = [payment.client_name || '', payment.workshop_name || '', payment.transaction_id || '', String(payment.incident_id)].join(' ').toLowerCase();
      const matchesTerm = !term || haystack.includes(term);
      return matchesMethod && matchesTerm;
    });
  }
}