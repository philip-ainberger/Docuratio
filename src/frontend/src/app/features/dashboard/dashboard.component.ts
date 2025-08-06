import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  template: `
    <div class="dashboard-content p-6 bg-gray-50 min-h-screen">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="mt-2 text-gray-600">Welcome to your document management system</p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <p-card>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">0</div>
            <div class="text-gray-600">Total Documents</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 mb-2">0</div>
            <div class="text-gray-600">Recent Uploads</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600 mb-2">0</div>
            <div class="text-gray-600">Shared Files</div>
          </div>
        </p-card>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <p-card>
          <ng-template pTemplate="header">
            <div class="px-6 py-4 border-b">
              <h3 class="text-lg font-semibold">Quick Actions</h3>
            </div>
          </ng-template>
          <div class="space-y-4">
            <p-button 
              label="Upload Document" 
              icon="pi pi-upload" 
              class="w-full"
              severity="primary">
            </p-button>
            <p-button 
              label="Create Folder" 
              icon="pi pi-folder" 
              class="w-full"
              severity="secondary">
            </p-button>
            <p-button 
              label="Share Files" 
              icon="pi pi-share-alt" 
              class="w-full"
              severity="info">
            </p-button>
          </div>
        </p-card>

        <p-card>
          <ng-template pTemplate="header">
            <div class="px-6 py-4 border-b">
              <h3 class="text-lg font-semibold">Recent Activity</h3>
            </div>
          </ng-template>
          <div class="space-y-4">
            <div class="text-center text-gray-500 py-8">
              <i class="pi pi-inbox text-4xl mb-4"></i>
              <p>No recent activity</p>
            </div>
          </div>
        </p-card>
      </div>
    </div>
  `
})
export class DashboardComponent {
}