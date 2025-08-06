import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { DocuratioApiService, AuthResponse } from './docuratio-api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private msalService: MsalService,
    private apiService: DocuratioApiService
  ) {
    this.checkAuthenticationStatus();
  }

  private checkAuthenticationStatus(): void {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    console.log('Checking auth status:', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });
    
    if (accessToken && refreshToken) {
      // Set the token for API calls
      this.apiService.setAuthToken(accessToken);
      this.isAuthenticatedSubject.next(true);
      this.loadCurrentUser();
    } else {
      this.isAuthenticatedSubject.next(false);
    }
  }

  loginWithMicrosoft(): Observable<boolean> {
    return from(this.msalService.instance.initialize()).pipe(
      switchMap(() => from(this.msalService.loginPopup({
        scopes: ['user.read']
      }))),
      switchMap((result: AuthenticationResult) => {
        if (result && result.accessToken) {
          return this.apiService.authenticateWithMicrosoft({
            accessToken: result.accessToken
          });
        }
        throw new Error('Failed to get Microsoft access token');
      }),
      tap((authResponse: AuthResponse) => {
        this.storeTokens(authResponse);
        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(authResponse.user);
      }),
      switchMap(() => of(true)),
      catchError((error) => {
        console.error('Login failed:', error);
        return of(false);
      })
    );
  }

  logout(): Observable<void> {
    // Clear local state and complete logout
    this.clearTokens();
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    
    // Return completed observable - no Microsoft logout popup needed
    return of(void 0);
  }

  refreshToken(): Observable<AuthResponse | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      this.logout();
      return of(null);
    }

    return this.apiService.refreshToken({ refreshToken }).pipe(
      tap((authResponse: AuthResponse) => {
        this.storeTokens(authResponse);
        this.currentUserSubject.next(authResponse.user);
      }),
      catchError((error) => {
        console.error('Token refresh failed:', error);
        this.logout();
        return of(null);
      })
    );
  }

  private loadCurrentUser(): void {
    this.apiService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
      },
      error: (error) => {
        console.error('Failed to load current user:', error);
        // Clear invalid tokens and mark as not authenticated
        this.clearTokens();
        this.isAuthenticatedSubject.next(false);
        this.currentUserSubject.next(null);
      }
    });
  }

  private storeTokens(authResponse: AuthResponse): void {
    localStorage.setItem('access_token', authResponse.accessToken);
    localStorage.setItem('refresh_token', authResponse.refreshToken);
    
    // Set the token for API calls
    this.apiService.setAuthToken(authResponse.accessToken);
    
    // Set automatic refresh timer
    const expirationTime = Date.now() + (authResponse.expiresIn * 1000) - 60000; // Refresh 1 minute before expiry
    const timeUntilRefresh = expirationTime - Date.now();
    
    if (timeUntilRefresh > 0) {
      setTimeout(() => {
        this.refreshToken().subscribe();
      }, timeUntilRefresh);
    }
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token') && !!localStorage.getItem('refresh_token');
  }
}