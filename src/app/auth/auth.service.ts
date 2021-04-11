import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/user/'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isUserAuthenticated = false;
  private token: string;
  private userId: string;
  public authenticationStatus = new Subject<boolean>();
  tokenTimer: any;

  constructor(private http: HttpClient, private router: Router) { }

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isUserAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getAuthenticationStatus() {
    return this.authenticationStatus.asObservable();
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    const now = new Date();
    if (!authInformation) {
      return;
    }
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isUserAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000); // because expiresIn will be in milliseconds
      this.authenticationStatus.next(true);
    }
  }

  createUser(email: string, password: string) {
    const authData: AuthData = {email: email, password: password};
    this.http.post(BACKEND_URL + 'signup', authData)
    .subscribe(response => {
      this.router.navigate(['/']);
    }, error => {
      this.authenticationStatus.next(false);
    })
  }

  login(email: string, password: string) {
    const authData: AuthData = {email: email, password: password};
    this.http.post<{token: string, expiresIn: number, userId: string}>(BACKEND_URL + 'login', authData)
    .subscribe(response => {
      const token = response.token;
      this.token = token;
      if (token) {
        const expiresInDuration = response.expiresIn;
        this.setAuthTimer(expiresInDuration);
        this.userId = response.userId;
        this.isUserAuthenticated = true;
        this.authenticationStatus.next(true);
        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
        console.log(expirationDate);
        this.saveAuthData(token, expirationDate, this.userId);
        this.router.navigate(['/']);
      }
    }, error => {
      this.authenticationStatus.next(false);
    })
  }

  logout() {
    this.token = null;
    this.isUserAuthenticated = false;
    this.router.navigate(['/']);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.authenticationStatus.next(false);
  }

  private setAuthTimer(duration) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    }
  }
}
