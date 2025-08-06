import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log('LoginGuard: canActivate called');
    return this.authService.isAuthenticated$.pipe(
      map(isAuthenticated => {
        console.log('LoginGuard: isAuthenticated =', isAuthenticated);
        if (isAuthenticated) {
          // User is already authenticated, redirect to dashboard
          console.log('LoginGuard: Redirecting to /dashboard');
          return this.router.createUrlTree(['/app/dashboard']);
        } else {
          // User is not authenticated, allow access to login page
          console.log('LoginGuard: Allowing access to login');
          return true;
        }
      })
    );
  }
}