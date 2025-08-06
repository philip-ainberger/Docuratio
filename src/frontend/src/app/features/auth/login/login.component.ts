import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h2 class="mt-6 text-3xl font-bold text-gray-900">Docuratio</h2>
          <p class="mt-2 text-sm text-gray-600">Document Management System</p>
        </div>
        
        <p-card class="shadow-lg">
          <div class="space-y-6 p-6">
            <div class="text-center">
              <h3 class="text-lg font-medium text-gray-900">Sign in to your account</h3>
              <p class="mt-2 text-sm text-gray-600">
                Use your Microsoft account to access Docuratio
              </p>
            </div>
            
            <div class="mt-8">
              <p-button 
                label="Sign in with Microsoft" 
                icon="pi pi-microsoft"
                class="w-full"
                [loading]="isLoading"
                (onClick)="loginWithMicrosoft()"
                severity="info">
              </p-button>
            </div>
          </div>
        </p-card>
        
        <div class="text-center text-xs text-gray-500">
          <p>© 2024 Docuratio. All rights reserved.</p>
        </div>
      </div>
    </div>
    
    <p-toast></p-toast>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class LoginComponent {
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  loginWithMicrosoft(): void {
    this.isLoading = true;
    
    this.authService.loginWithMicrosoft().subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Login Successful',
            detail: 'Welcome to Docuratio!'
          });
          this.router.navigate(['/app/dashboard']);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: 'Please try again.'
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Login Error',
          detail: 'An error occurred during login. Please try again.'
        });
      }
    });
  }
}