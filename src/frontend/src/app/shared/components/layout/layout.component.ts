import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    MenuModule,
    ButtonModule,
    AvatarModule
  ],
  template: `
    <div class="layout-container">
      <!-- Sidebar -->
      <div class="sidebar">
        <!-- Logo/Header -->
        <div class="sidebar-header">
          <i class="pi pi-folder text-2xl text-primary"></i>
          <span class="ml-3 text-lg font-bold text-primary">Docuratio</span>
        </div>

        <!-- Navigation Menu -->
        <div class="sidebar-content">
          <nav class="custom-menu">
            <!-- Dashboard - Single Item -->
            <div class="menu-item" (click)="navigate('/app/dashboard')">
              <i class="pi pi-home"></i>
              <span>Dashboard</span>
            </div>
            
            <div class="menu-separator"></div>
            
            <!-- Documents - with submenu -->
            <p-menu [model]="documentsMenu" styleClass="sidebar-menu"></p-menu>
            
            <div class="menu-separator"></div>
            
            <!-- Administration - with submenu -->
            <p-menu [model]="administrationMenu" styleClass="sidebar-menu"></p-menu>
          </nav>
        </div>

        <!-- User Profile -->
        <div class="sidebar-footer">
          <div class="user-profile">
            <p-avatar 
              [label]="getUserInitials()" 
              shape="circle" 
              size="normal"
              styleClass="bg-primary">
            </p-avatar>
            <div class="user-info" *ngIf="currentUser">
              <div class="user-name">{{ currentUser.name }}</div>
              <div class="user-email">{{ currentUser.email }}</div>
            </div>
            <div class="user-info" *ngIf="!currentUser">
              <div class="user-name">Loading...</div>
            </div>
            <p-button 
              icon="pi pi-sign-out" 
              [text]="true"
              size="small"
              (onClick)="logout()"
              class="logout-btn">
            </p-button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    .sidebar {
      width: 280px;
      background: white;
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .sidebar-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      min-height: 60px;
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem 0;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid #e5e7eb;
      margin-top: auto;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 8px;
      transition: background-color 0.2s;
    }

    .user-profile:hover {
      background-color: #f9fafb;
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-weight: 500;
      font-size: 0.875rem;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 0.75rem;
      color: #6b7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .main-content {
      flex: 1;
      height: 100vh;
      overflow: hidden;
      background-color: #f9fafb;
    }

    /* Custom Menu Styling */
    :host ::ng-deep .sidebar-menu {
      border: none;
      box-shadow: none;
      background: transparent;
      width: 100%;
    }

    :host ::ng-deep .sidebar-menu .p-menu-list {
      padding: 0;
    }

    :host ::ng-deep .sidebar-menu .p-menuitem {
      margin: 0.125rem 0;
    }

    :host ::ng-deep .sidebar-menu .p-menuitem-link {
      padding: 0.5rem 0.75rem;
      margin: 0 0.75rem;
      border-radius: 6px;
      color: #374151;
      transition: all 0.2s;
      font-size: 0.875rem;
    }

    :host ::ng-deep .sidebar-menu .p-menuitem-link:hover {
      background-color: #f3f4f6;
      color: #111827;
    }

    :host ::ng-deep .sidebar-menu .p-menuitem-link:focus {
      box-shadow: 0 0 0 0.2rem #bfdbfe;
    }

    :host ::ng-deep .sidebar-menu .p-menuitem-icon {
      margin-right: 0.5rem;
      color: #6b7280;
      font-size: 0.875rem;
    }

    :host ::ng-deep .sidebar-menu .p-menuitem-text {
      font-weight: 400;
    }

    :host ::ng-deep .sidebar-menu .p-submenu-list {
      padding-left: 0;
      margin-top: 0.25rem;
    }

    :host ::ng-deep .sidebar-menu .p-submenu-list .p-menuitem-link {
      padding-left: 2rem;
      font-size: 0.8125rem;
      color: #6b7280;
    }
  `]
})
export class LayoutComponent implements OnInit {
  currentUser: any = null;
  documentsMenu: MenuItem[] = [];
  administrationMenu: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.initializeMenu();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  private initializeMenu(): void {
    this.documentsMenu = [
      {
        label: 'Documents',
        icon: 'pi pi-file',
        items: [
          {
            label: 'Search',
            icon: 'pi pi-search',
            command: (event: any) => this.navigate('/app/documents/search')
          },
          {
            label: 'Favorites',
            icon: 'pi pi-star',
            command: (event: any) => this.navigate('/app/documents/favorites')
          },
          {
            label: 'Overview',
            icon: 'pi pi-list',
            command: (event: any) => this.navigate('/app/documents/overview')
          }
        ]
      }
    ];

    this.administrationMenu = [
      {
        label: 'Administration',
        icon: 'pi pi-cog',
        items: [
          {
            label: 'Document Types',
            icon: 'pi pi-tags',
            command: (event: any) => this.navigate('/app/admin/document-types')
          },
          {
            label: 'Document Attributes',
            icon: 'pi pi-sliders-h',
            command: (event: any) => this.navigate('/app/admin/document-attributes')
          },
          {
            label: 'Storage',
            icon: 'pi pi-database',
            command: (event: any) => this.navigate('/app/admin/storage')
          }
        ]
      }
    ];
  }

  getUserInitials(): string {
    if (!this.currentUser?.name) {
      return 'U';
    }
    
    const names = this.currentUser.name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}