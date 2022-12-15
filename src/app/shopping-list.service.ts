import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable, tap } from 'rxjs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class ShoppingListService {
  constructor(
    private httpClient: HttpClient,
    private router: Router, // private afAuth: Angularfi,
    private cookie: CookieService
  ) {}
  token: string = '';

  googleAuthentication() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((res: any) => {
        console.log('resABCDEF', res.additionalUserInfo.profile.email);
        console.log('resABCDEF', res.additionalUserInfo.profile);
        this.getGoogle();
      });
  }

  getGoogle() {
    firebase
      .auth()
      .getRedirectResult()
      .then((res: any) => {
        console.log('resAB', res);
        localStorage.setItem('resGoogle', res);
        if (res.credential) {
          /** @type {firebase.auth.OAuthCredential} */
          var credential = res.credential;
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = credential.accessToken;
          // ...
          console.log('credential', credential);
          console.log('token', token);
        }
        // The signed-in user info.
        var user = res.user;
      })
      .catch((error) => {
        console.log('error', error);
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
  }

  login(email: string, password: string) {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((res: any) => {
        firebase
          .auth()
          .currentUser?.getIdToken()
          .then((res: any) => {
            this.token = res;
            this.cookie.set('token', this.token);
          })
          .catch((err: any) => {
            console.log('erer', err);

            this.error = err;
            console.log('err', this.error);
            this.token = '';
            this.cookie.set('token', this.token);
          });
      })
      .catch((err: any) => {
        console.log('erer', err);
        this.error = err;
        console.log('err', this.error);
        this.token = '';
        this.cookie.set('token', this.token);
        // this.error = err;
        // console.log('err', this.error);
        // this.token = '';
        // this.cookie.set('token', this.token);
      });
  }

  getToken() {
    return this.cookie.get('token');
  }

  error: string = '';
  signUp(email: string, password: string) {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((res: any) => {
        console.log('res ENTER');
        res.user?.getIdToken().then((token: any) => {
          this.token = token;
          this.cookie.set('token', this.token);
        });
      })
      .catch((err: any) => {
        this.error = err;
        console.log('err', this.error);
        this.token = '';
        this.cookie.set('token', this.token);
      });
  }

  postList(list: any) {
    let token = this.getToken();
    this.httpClient
      .post(
        `https://shopping-list-d9b5e-default-rtdb.firebaseio.com/shopping-list.json?auth=${token}`,
        list
      )
      .subscribe(
        (res: any) => {},
        (err: any) => {}
      );
  }

  // putList(index: number, list: any) {
  putList(list: any) {
    let token = this.getToken();
    this.httpClient
      .put(
        // `https://shopping-list-d9b5e-default-rtdb.firebaseio.com/shopping-list/${index}.json?auth=${token}`,
        `https://shopping-list-d9b5e-default-rtdb.firebaseio.com/shopping-list.json?auth=${token}`,
        list
      )
      .subscribe(
        (res: any) => {},
        (err: any) => {}
      );
  }

  deleteList(index: number) {
    let token = this.getToken();
    this.httpClient
      .delete(
        `https://shopping-list-d9b5e-default-rtdb.firebaseio.com/shopping-list/${index}.json?auth=${token}`
      )
      .subscribe(
        (res: any) => {},
        (err: any) => {}
      );
  }

  lists: any = [];
  getList(): Observable<any> {
    let token = this.getToken();
    return this.httpClient
      .get(
        `https://shopping-list-d9b5e-default-rtdb.firebaseio.com/shopping-list.json?auth=${token}`
      )
      .pipe(
        tap((res: any) => {
          this.lists = res;
          return this.lists;
        })
      );
  }

  getLists() {
    return this.lists;
  }

  getLists2() {
    return this.lists;
  }

  logout() {
    firebase
      .auth()
      .signOut()
      .then((res: any) => {
        this.token = '';
        this.cookie.set('token', this.token);
        localStorage.removeItem('upbToken');
        // window.location.reload();
      });
  }
}
