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
    //     Move the getRedirectResult() call out of your loginGoogle() function. getRedirectResult() should be called on page load. An example of this in action can be found here:

    // https://github.com/firebase/quickstart-js/blob/master/auth/google-redirect.html
    firebase.auth().signInWithRedirect(provider);
    setTimeout(() => {
      // firebase
      //   .auth()
      //   .getRedirectResult()
      //   .then((result: any) => {
      //     console.log('AAAAAAAAAAAAAAAAAAAAAAAAA');
      //     if (result.credential) {
      //     }
      //     var user = result.user;
      //   });
    }, 5000);

    // .then((res: any) => {
    //   console.log('res', res);
    //   localStorage.removeItem('upbUser');
    //   localStorage.setItem('upbUser', res.user.multiFactor.user.email);
    //   localStorage.removeItem('upbToken');
    //   localStorage.setItem('upbToken', res.user.multiFactor.user.accessToken);
    //   this.token = res.user.multiFactor.user.accessToken;
    //   this.cookie.set('token', this.token);
    //   console.log(res.user.multiFactor.user.accessToken);

    //   this.getGoogle();
    // });
  }

  initApp() {
    return firebase
      .auth()
      .getRedirectResult()
      .then((result: any) => {
        console.log('yyyy', result);
        if (result.credential) {
          // this.token = result.credential.accessToken;
          // this.token = result.credential.idToken;
          this.token = result.user.multiFactor.user.accessToken;
          this.cookie.set('token', this.token);
          localStorage.removeItem('upbUser');
          localStorage.setItem(
            'upbUser',
            result.additionalUserInfo.profile.email
          );
        }
      });
  }

  getGoogle() {
    firebase
      .auth()
      .getRedirectResult()
      .then((res: any) => {
        console.log('res2');

        window.location.reload();
        if (res.credential) {
          /** @type {firebase.auth.OAuthCredential} */
          var credential = res.credential;
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = credential.accessToken;
          // ...
        }
        // The signed-in user info.
        var user = res.user;
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
    console.log('LIST TOKEN', token);

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
