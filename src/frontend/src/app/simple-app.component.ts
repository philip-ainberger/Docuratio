import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div>
      <h1>Docuratio Frontend</h1>
      <p>Angular application is working!</p>
    </div>
  `,
  styles: [`
    div {
      padding: 20px;
      text-align: center;
    }
    h1 {
      color: #2563eb;
      font-size: 2rem;
    }
  `]
})
export class SimpleAppComponent {
  
}