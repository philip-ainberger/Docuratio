import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService as GeneratedAuthService, MicrosoftTokenRequest, RefreshTokenRequest, OpenAPI } from '../../generated/api';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocuratioApiService {
  constructor(private generatedAuthService: GeneratedAuthService) {}

  // Set the authorization token for API requests
  setAuthToken(token: string): void {
    OpenAPI.TOKEN = token;
  }

  // Auth endpoints using generated client
  authenticateWithMicrosoft(request: MicrosoftTokenRequest): Observable<AuthResponse> {
    return this.generatedAuthService.postApiAuthMicrosoft(request).pipe(
      map(response => response as AuthResponse)
    );
  }

  refreshToken(request: RefreshTokenRequest): Observable<AuthResponse> {
    return this.generatedAuthService.postApiAuthRefresh(request).pipe(
      map(response => response as AuthResponse)
    );
  }

  logout(): Observable<any> {
    return this.generatedAuthService.postApiAuthLogout();
  }

  getCurrentUser(): Observable<UserInfo> {
    return this.generatedAuthService.getApiAuthMe().pipe(
      map(response => response as UserInfo)
    );
  }
}