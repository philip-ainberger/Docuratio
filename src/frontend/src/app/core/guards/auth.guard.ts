import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log('AuthGuard: canActivate called');
    return this.authService.isAuthenticated$.pipe(
      map(isAuthenticated => {
        console.log('AuthGuard: isAuthenticated =', isAuthenticated);
        if (isAuthenticated) {
          return true;
        } else {
          console.log('AuthGuard: Redirecting to /login');
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}