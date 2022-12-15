import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class ShoppingListService {
  error: string = '';
  lists: any = [];
  token: string = '';

  constructor(private httpClient: HttpClient, private cookie: CookieService) {}

  googleAuthentication() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((res: any) => {
        this.getGoogle();
      });
  }

  getGoogle() {
    firebase
      .auth()
      .getRedirectResult()
      .then((res: any) => {
        localStorage.setItem('resGoogle', res);
        if (res.credential) {
          /** @type {firebase.auth.OAuthCredential} */
          var credential = res.credential;
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = credential.accessToken;
          // ...
        }
        // The signed-in user info.
        var user = res.user;
      })
      .catch((error) => {
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
            this.error = err;
            this.token = '';
            this.cookie.set('token', this.token);
          });
      })
      .catch((err: any) => {
        this.error = err;
        this.token = '';
        this.cookie.set('token', this.token);
      });
  }

  getToken() {
    return this.cookie.get('token');
  }

  signUp(email: string, password: string) {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((res: any) => {
        res.user?.getIdToken().then((token: any) => {
          this.token = token;
          this.cookie.set('token', this.token);
        });
      })
      .catch((err: any) => {
        this.error = err;
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

  putList(list: any) {
    let token = this.getToken();
    this.httpClient
      .put(
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
      });
  }
}
