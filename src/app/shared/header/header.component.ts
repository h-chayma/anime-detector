import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  logoSrc: string = 'assets/img/logo.png';

  constructor() {
    this.updateLogo();
  }

  ngOnInit() {
    this.updateLogo();
  }

  updateLogo() {
    const theme = document.documentElement.getAttribute('data-theme-version');
    if (theme === 'dark') {
      this.logoSrc = 'assets/img/logo-dark.png';
    } else {
      this.logoSrc = 'assets/img/logo.png';
    }
  }
}
