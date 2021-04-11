import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.authService.getToken();
  /*Below code will clone the incoming request. If we do some changes directly on the incoming request
  then it may result into some errors. So it is better to clone it.
  Authorization name should be same as of what we are referring in backend. It is case-insensitive.
  set method used below will not override all header with new header. If the header is already available
  then it will override it other wise will create a new one. 'Bearer ' should be added because on backend
  we are accepting it in this format. It is optional but a good convention to do so. */

    const authRequest = request.clone({
      headers: request.headers.set('Authorization', 'Bearer ' + authToken)
    });
    return next.handle(authRequest);
  }
}
