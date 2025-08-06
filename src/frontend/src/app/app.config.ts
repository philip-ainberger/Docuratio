import { ApplicationConfig, provideZoneChangeDetection, isDevMode, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { MsalModule, MsalService, MSAL_INSTANCE } from '@azure/msal-angular';
import { PublicClientApplication, IPublicClientApplication } from '@azure/msal-browser';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { OpenAPI } from './generated/api';
import { APP_CONFIG } from './core/config/app.config';

function initializeOpenAPI() {
  return () => {
    OpenAPI.BASE = APP_CONFIG.apiBaseUrl;
    OpenAPI.WITH_CREDENTIALS = false;
    OpenAPI.CREDENTIALS = 'include';
  };
}

function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: APP_CONFIG.msalConfig.clientId,
      authority: APP_CONFIG.msalConfig.authority,
      redirectUri: APP_CONFIG.msalConfig.redirectUri,
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    }
  });
}



export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeOpenAPI,
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    MsalService,
    MessageService
  ]
};
