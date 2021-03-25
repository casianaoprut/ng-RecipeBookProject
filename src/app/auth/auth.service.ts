import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

import {AuthResponseData} from './auth-response-data.model';
import {User} from './user.model';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  tokenExpirationTimer: any;

  user = new BehaviorSubject<User>(null);

  constructor(private http: HttpClient,
              private router: Router) { }

  signUp(email: string, password: string): Observable<AuthResponseData>{
     return this.http.post<AuthResponseData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
      {
        email,
        password,
        returnSecureToken: true
      }).pipe(catchError(this.handleErrors), tap( respData => {
       this.handleUsers(
         respData.email,
         respData.localId,
         respData.idToken,
         respData.expiresIn
       );
     } ));
  }

  logIn(email: string, password: string): Observable<AuthResponseData> {
    return this.http
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
        {
          email,
          password,
          returnSecureToken: true,
        })
        .pipe(catchError(this.handleErrors),
          tap( respData => {
            this.handleUsers(
              respData.email,
              respData.localId,
              respData.idToken,
              respData.expiresIn
            );
          }));
  }

  autoLogIn(): void {
    const userData: {
      email: string,
      id: string;
      refreshToken: string,
      tokenExpirationDate: Date;
    } = JSON.parse(localStorage.getItem('userData'));

    if (!userData){
      return;
    }
    const loadedUser = new User(
      userData.email,
      userData.id,
      userData.refreshToken,
      userData.tokenExpirationDate
    );
    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationTimer =
        new Date(userData.tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogOut( expirationTimer );
    }
  }

  logout(): void {
    this.user.next(null);
    this.router.navigate(['/auth']).then(() => {} );
    localStorage.removeItem('userData');
    if ( this.tokenExpirationTimer){
      clearTimeout( this.tokenExpirationTimer );
    }
    this.tokenExpirationTimer = null;
  }

  autoLogOut(expirationTimer: number): void{
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationTimer);
  }

  private handleUsers(email: string, userId: string, token: string, expiresIn: string): void{
    const tokenExpirationDate = new Date( new Date().getTime() + (+expiresIn) * 1000);
    const user = new User(
      email,
      userId,
      token,
      tokenExpirationDate);
    this.user.next(user);
    this.autoLogOut( +expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleErrors(errorResp: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (!errorResp.error || !errorResp.error.error){
      return throwError(errorResp.message);
    }
    switch (errorResp.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email already been used!';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'The password is incorrect!';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'The email does not exist!';
        break;
    }
    return throwError(errorMessage);
  }
}


