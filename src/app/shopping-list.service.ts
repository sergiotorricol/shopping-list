import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
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

  login(email: string, password: string) {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((_) => {
        firebase
          .auth()
          .currentUser?.getIdToken()
          .then((res) => {
            this.token = res;
            this.cookie.set('token', this.token);
          });
      });
  }

  getToken() {
    return this.cookie.get('token');
  }

  signUp(email: string, password: string) {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((res) => {
        res.user?.getIdToken().then((res) => {
          this.token = res;
          this.cookie.set('token', this.token);
        });
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
        (res) => {},
        (err) => {}
      );
  }

  // putList(index: number, list: any) {
    putList( list: any) {
    let token = this.getToken();
    this.httpClient
      .put(
        // `https://shopping-list-d9b5e-default-rtdb.firebaseio.com/shopping-list/${index}.json?auth=${token}`,
        `https://shopping-list-d9b5e-default-rtdb.firebaseio.com/shopping-list.json?auth=${token}`,
        list
      )
      .subscribe(
        (res) => {},
        (err) => {}
      );
  }

  deleteList(index: number) {
    let token = this.getToken();
    this.httpClient
      .delete(
        `https://shopping-list-d9b5e-default-rtdb.firebaseio.com/shopping-list/${index}.json?auth=${token}`
      )
      .subscribe(
        (res) => {},
        (err) => {}
      );
  }

  lists: any = [];
  getList() {
    let token = this.getToken();
    this.httpClient
      .get(
        `https://shopping-list-d9b5e-default-rtdb.firebaseio.com/shopping-list.json?auth=${token}`
      )
      .subscribe((res) => {
        console.log('res', res);
        this.lists = res;
        return res;
      });
  }

  getLists2() {
    return this.lists;
  }

  logout() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        this.token = '';
        this.cookie.set('token', this.token);
        window.location.reload();
      });
  }
}
