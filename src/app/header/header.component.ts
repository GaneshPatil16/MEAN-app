import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  userAuthenticated = false;
  authSubscription: Subscription;
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.userAuthenticated = this.authService.getIsAuth();
    this.authSubscription = this.authService.getAuthenticationStatus()
    .subscribe(authStatus => {
      this.userAuthenticated = authStatus;
    })
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

}
