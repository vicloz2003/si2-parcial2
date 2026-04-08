import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <!-- Brand -->
      <div class="sidebar-brand">
        <a routerLink="/dashboard" class="brand-link">
          <div class="brand-icon">
            <img src="logo.png" alt="AsisteCar" class="brand-logo">
          </div>
          <span class="brand-name" *ngIf="!collapsed">AsisteCar</span>
        </a>
        <button class="collapse-btn" (click)="toggle()" [title]="collapsed ? 'Expandir' : 'Colapsar'">
          <span class="material-symbols-rounded">{{ collapsed ? 'menu' : 'menu_open' }}</span>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="nav-section">
          <span class="nav-label" *ngIf="!collapsed">PRINCIPAL</span>
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item" [title]="collapsed ? 'Dashboard' : ''">
            <span class="material-symbols-rounded">dashboard</span>
            <span class="nav-text" *ngIf="!collapsed">Dashboard</span>
          </a>
          <a routerLink="/incidents" routerLinkActive="active" class="nav-item" [title]="collapsed ? 'Incidentes' : ''">
            <span class="material-symbols-rounded">warning</span>
            <span class="nav-text" *ngIf="!collapsed">Incidentes</span>
            <span class="nav-badge" *ngIf="pendingCount > 0 && !collapsed">{{ pendingCount }}</span>
            <span class="nav-dot" *ngIf="pendingCount > 0 && collapsed"></span>
          </a>
        </div>

        <div class="nav-section">
          <span class="nav-label" *ngIf="!collapsed">GESTION</span>
          <a routerLink="/technicians" routerLinkActive="active" class="nav-item" [title]="collapsed ? 'Tecnicos' : ''">
            <span class="material-symbols-rounded">engineering</span>
            <span class="nav-text" *ngIf="!collapsed">Tecnicos</span>
          </a>
          <a routerLink="/history" routerLinkActive="active" class="nav-item" [title]="collapsed ? 'Historial' : ''">
            <span class="material-symbols-rounded">history</span>
            <span class="nav-text" *ngIf="!collapsed">Historial</span>
          </a>
          <a routerLink="/reports" routerLinkActive="active" class="nav-item" [title]="collapsed ? 'Reportes' : ''">
            <span class="material-symbols-rounded">bar_chart</span>
            <span class="nav-text" *ngIf="!collapsed">Reportes</span>
          </a>
        </div>

        <div class="nav-section">
          <span class="nav-label" *ngIf="!collapsed">CUENTA</span>
          <a routerLink="/profile" routerLinkActive="active" class="nav-item" [title]="collapsed ? 'Mi Perfil' : ''">
            <span class="material-symbols-rounded">settings</span>
            <span class="nav-text" *ngIf="!collapsed">Mi Perfil</span>
          </a>
        </div>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <div class="footer-divider"></div>
        <div class="sidebar-version" *ngIf="!collapsed">
          <span class="material-symbols-rounded">info</span>
          <span>AsisteCar v1.0</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 0; left: 0; bottom: 0;
      width: var(--sidebar-width);
      background: var(--sidebar-bg);
      display: flex; flex-direction: column;
      z-index: 200;
      transition: width 0.3s var(--ease-spring);
      overflow: hidden;
    }

    .sidebar.collapsed { width: var(--sidebar-collapsed); }

    .sidebar-brand {
      height: var(--navbar-height);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 14px;
      flex-shrink: 0;
    }
    .collapsed .sidebar-brand {
      justify-content: center;
      padding: 0;
    }

    .brand-link { display: flex; align-items: center; gap: 10px; overflow: hidden; }
    .collapsed .brand-link { display: none; }

    .brand-icon {
      width: 38px; height: 38px; border-radius: 10px;
      background: var(--color-surface-alt); display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .brand-logo { width: 28px; height: 28px; object-fit: contain; }

    .brand-name {
      font-size: 18px; font-weight: 800; color: var(--sidebar-text-active);
      white-space: nowrap; letter-spacing: -0.03em;
    }

    .collapse-btn {
      width: 30px; height: 30px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: var(--sidebar-text); transition: all 0.2s var(--ease-out);
      flex-shrink: 0;
      .material-symbols-rounded { font-size: 20px; }
      &:hover { background: var(--sidebar-hover); color: var(--sidebar-text-active); }
    }

    .sidebar-nav {
      flex: 1; overflow-y: auto; overflow-x: hidden;
      padding: 16px 10px;
      display: flex; flex-direction: column; gap: 4px;
    }

    .nav-section { display: flex; flex-direction: column; gap: 2px; margin-bottom: 16px; }

    .nav-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px; font-weight: 700;
      color: var(--sidebar-text);
      text-transform: uppercase; letter-spacing: 0.14em;
      padding: 0 14px; margin-bottom: 8px; white-space: nowrap;
    }

    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 14px; border-radius: 10px;
      color: var(--sidebar-text); font-size: 14px; font-weight: 500;
      transition: all 0.2s var(--ease-out);
      position: relative; white-space: nowrap; overflow: hidden;

      .material-symbols-rounded { font-size: 21px; flex-shrink: 0; transition: color 0.2s; }

      &:hover { background: var(--sidebar-hover); color: var(--sidebar-text-active); }

      &.active {
        background: var(--sidebar-active-bg);
        color: var(--sidebar-text-active); font-weight: 600;
        .material-symbols-rounded { color: var(--color-accent); }
        &::before {
          content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
          width: 3px; height: 22px;
          background: var(--color-accent);
          border-radius: 0 4px 4px 0;

        }
      }
    }

    .collapsed .nav-item { justify-content: center; padding: 10px; }
    .nav-text { overflow: hidden; text-overflow: ellipsis; }

    .nav-badge {
      margin-left: auto; min-width: 20px; height: 20px; padding: 0 6px;
      background: var(--color-accent); color: white; border-radius: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;

    }

    .nav-dot {
      position: absolute; top: 8px; right: 8px;
      width: 8px; height: 8px;
      background: var(--color-accent); border-radius: 50%;

    }

    .sidebar-footer { flex-shrink: 0; padding: 12px; }
    .footer-divider { display: none; }

    .sidebar-version {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 14px; color: var(--sidebar-text);
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px; white-space: nowrap;
      .material-symbols-rounded { font-size: 15px; }
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() pendingCount = 0;
  @Output() collapsedChange = new EventEmitter<boolean>();

  toggle() {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}
