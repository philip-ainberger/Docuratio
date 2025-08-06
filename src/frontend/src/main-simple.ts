import { bootstrapApplication } from '@angular/platform-browser';
import { SimpleAppComponent } from './app/simple-app.component';

bootstrapApplication(SimpleAppComponent, {
  providers: []
}).catch(err => console.error(err));