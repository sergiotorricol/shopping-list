import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ShoppingListService } from './shopping-list.service';
import firebase from 'firebase/compat/app';
import 'hammerjs';
import { IonList } from '@ionic/angular';
import { MatDrawer } from '@angular/material/sidenav';
import * as uuid from 'uuid';

export interface ShoppingList {
  name: string;
  items: any[];
  users: any[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer: MatDrawer;
  @ViewChild('listsList') listsList: IonList;

  currentId: string;
  currentIndex: number = 0;
  currentList: any;
  currentUser: string = '';
  empty: boolean = true;
  equivocado: boolean = false;
  existente: boolean = false;
  formLogin: FormGroup;
  itemsCompare: any = [];
  lists: any = [];
  logged: boolean = false;
  modalidades: any[] = [
    { value: '1', viewValue: 'Normal' },
    { value: '2', viewValue: 'Precios' },
  ];
  othersLists: any = [];
  prices = false;
  selected = '';
  token: string = '';
  undoList: any = [];

  constructor(
    private _fb: FormBuilder,
    public dialog: MatDialog,
    private _shoppingListService: ShoppingListService
  ) {
    this.formLogin = this._fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    console.log('INIT');
    firebase.initializeApp({
      apiKey: 'AIzaSyBHQVuQM353vYWb3w7_ZQLBagrfJJ9TqgQ',
      authDomain: 'shopping-list-d9b5e.firebaseapp.com',
    });
    window.onload = (_: any) => {
      this._shoppingListService.initApp().then((res: any) => {
        console.log('res', res);

        this.currentUser = localStorage.getItem('upbUser')!;
        this.token = this._shoppingListService.getToken();
        console.log('x', this.currentUser, this.token);
        if (
          this.token != '' &&
          this.token != null &&
          this.currentUser != null
        ) {
          console.log('asd');

          this.logged = true;
          setTimeout(() => {
            this.getList();
          }, 2000);
        }
      });
    };
    this.empty = true;
    setTimeout(() => {
      if (this.lists.length > 0) {
        this.empty = true;
        this.currentIndex = 0;
        this.currentId = this.lists[0].uid;
        this.currentList = this.lists[0];
      }
    }, 2000);
  }

  getToken() {
    this.currentUser = localStorage.getItem('upbUser')!;
    this.token = localStorage.getItem('upbToken')!;
    console.log('token', this.token);
  }

  login() {
    if (this.formLogin.valid) {
      this._shoppingListService.login(
        this.formLogin.controls['email'].value,
        this.formLogin.controls['password'].value
      );
      setTimeout(() => {
        this.token = this._shoppingListService.getToken();
        if (this.token != '') {
          this.logged = true;
          this.equivocado = false;
          this.currentUser = this.formLogin.controls['email'].value;
          this.getList();
          localStorage.removeItem('upbUser');
          localStorage.setItem('upbUser', this.currentUser);
          localStorage.removeItem('upbToken');
          localStorage.setItem('upbToken', this.token);
        } else {
          this.equivocado = true;
          this.formLogin.markAllAsTouched();
        }
      }, 2000);
    } else {
      this.formLogin.markAllAsTouched();
    }
  }

  signup() {
    this.empty = true;
    localStorage.removeItem('upbToken');
    localStorage.removeItem('upbUser');
    this.currentUser = '';
    this.token = '';
    this.lists = [];
    this.othersLists = [];
    if (this.formLogin.valid) {
      this._shoppingListService.signUp(
        this.formLogin.controls['email'].value,
        this.formLogin.controls['password'].value
      );
      setTimeout(() => {
        this.token = this._shoppingListService.getToken();
        if (this.token != '') {
          this.logged = true;
          this.existente = false;
          this.currentUser = this.formLogin.controls['email'].value;
          localStorage.removeItem('upbToken');
          localStorage.setItem('upbToken', this.token);
          localStorage.removeItem('upbUser');
          localStorage.setItem('upbUser', this.currentUser);
        } else {
          this.existente = true;
          this.formLogin.markAllAsTouched();
        }
      }, 2000);
    } else {
      this.formLogin.markAllAsTouched();
    }
  }

  ngOnDestroy() {
    console.log('destroy');
    this._shoppingListService.putList(this.lists);
  }

  getList() {
    console.log('TOKEN', this.token);
    this._shoppingListService.getList().subscribe((res: any) => {
      console.log(this.currentUser, res);

      this.lists = [];
      this.othersLists = [];
      if (res != null) {
        if (res.length > 0) {
          this.lists = res;
          // res.forEach((list: any) => {
          //   list.users.forEach((user: any) => {
          //     if (user == this.currentUser) {
          //       this.lists.push(list);
          //     } else {
          //       this.othersLists.push(list);
          //     }
          //   });
          // });
          if (this.lists.length > 0) {
            this.empty = true;
            this.currentList = 0;
            this.currentId = this.lists[0].uid;
            this.currentList = this.lists[0];
          }
        } else {
          this.lists = res;
        }
      } else {
        this.lists = [];
        this.othersLists = [];
      }
    });
    this.empty = true;
  }

  loginGoogle() {
    this._shoppingListService.googleAuthentication();
    // setTimeout(() => {

    // }, 500);
  }

  check(index: number) {
    if (
      !this.lists[this.lists.indexOf(this.currentList)].items[
        this.currentList.items.indexOf(index)
      ].checked
    ) {
      setTimeout(() => {
        let checked =
          this.lists[this.lists.indexOf(this.currentList)].items[
            this.currentList.items.indexOf(index)
          ];
        this.lists[this.lists.indexOf(this.currentList)].items.splice(
          this.currentList.items.indexOf(index),
          1
        );
        checked.checked = true;
        this.lists[this.lists.indexOf(this.currentList)].items.push(checked);
      }, 2000);
    }
    // let concatList = this.lists.concat(this.othersLists);
    this._shoppingListService.putList(this.lists);
  }

  print() {
    console.log('PRINT');
    console.log('USER', this.currentUser);
    console.log('LIST', this.lists);
  }

  undo() {
    if (this.undoList.length > 0) {
      this.lists[this.lists.indexOf(this.currentList)].items.push(
        this.undoList[0]
      );
      this.undoList.splice(0, 1);
      // let concatList = this.lists.concat(this.othersLists);
      this._shoppingListService.putList(this.lists);
    }
    this.lists[this.lists.indexOf(this.currentList)].items.forEach(
      (item: any, index: number) => {
        if (item.checked) {
          this.lists[this.lists.indexOf(this.currentList)].items.splice(
            index,
            1
          );
          this.lists[this.lists.indexOf(this.currentList)].items.push(item);
        }
      }
    );
    // let concatList = this.lists.concat(this.othersLists);
    this._shoppingListService.putList(this.lists);
  }

  change() {
    if (this.selected == '1') {
      this.prices = false;
    } else if (this.selected == '2') {
      this.prices = true;
    }
  }

  deleteList(index: any) {
    this.lists.splice(this.lists.indexOf(index), 1);
    // let concatList = this.lists.concat(this.othersLists);
    this._shoppingListService.putList(this.lists);

    this.empty = true;
  }

  openModal(type: string, index: any = '') {
    console.log('llklk');

    let data = {};
    if (type == 'LOG_OUT') {
      data = { type: type };
    } else if (type == 'COMPARE') {
      this.itemsCompare = [];
      this.lists.forEach((list: any) => {
        list.items.forEach((item: any) => {
          item.market = list.market ? list.market : 'N/A';
          item.price = item.price ? parseFloat(item.price) : 'N/A';
          this.itemsCompare.push(item);
        });
      });
      this.itemsCompare = this.itemsCompare.sort((a: any, b: any) => {
        if (a.market > b.market) return 1;
        if (a.market < b.market) return -1;
        return 0;
      });
      this.itemsCompare = this.itemsCompare.sort((a: any, b: any) => {
        if (a.date > b.date) return 1;
        if (a.date < b.date) return -1;
        return 0;
      });
      this.itemsCompare = this.itemsCompare.reverse();
      let itemsTemp: any = [this.itemsCompare[0]];
      let marketTemp = this.itemsCompare[0].market;
      this.itemsCompare.forEach((item: any) => {
        if (item.market != marketTemp) {
          itemsTemp.push(item);
          marketTemp = item.market;
        }
      });
      this.itemsCompare = itemsTemp.sort((a: any, b: any) => {
        if (a.price > b.price) return 1;
        if (a.price < b.price) return -1;
        return 0;
      });
      console.log('ii', index);

      data = {
        type: type,
        name: this.lists[this.lists.indexOf(this.currentList)].items[
          this.currentList.items.indexOf(index)
        ].name,
        // this.currentList.items[
        //   this.currentList.items.indexOf(this.currentList)
        // ].name,
        compare: new Set(this.itemsCompare),
      };
    } else if (type == 'NEW_LIST') {
      data = { type: type };
    } else if (type == 'SHARE') {
      data = { type: type };
    } else if (type == 'EDIT_LIST') {
      console.log(index, this.lists.indexOf(index));

      data = {
        name: this.lists[this.lists.indexOf(index)].name,
        market: this.lists[this.lists.indexOf(index)].market,
        type: type,
      };
    } else if (type == 'DELETE_LIST') {
      data = { type: type };
    } else if (type == 'NEW_ITEM') {
      data = { type: type, price: this.prices };
    } else if (type == 'EDIT_ITEM') {
      data = {
        name: this.lists[this.lists.indexOf(this.currentList)].items[
          this.currentList.items.indexOf(index)
        ].name,
        price:
          this.lists[this.lists.indexOf(this.currentList)].items[
            this.currentList.items.indexOf(index)
          ].price,
        type: type,
      };
    } else if (type == 'DELETE_ITEM') {
      data = { type: type };
    }
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '300px',
      data: data,
      position: type == 'COMPARE' ? { top: '15%' } : { top: '35%' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (type == 'LOG_OUT') {
        if (result) {
          this.logged = false;
          this._shoppingListService.logout();
        }
      } else if (type == 'NEW_LIST') {
        this.drawer.close();
        if (result != undefined && result != false) {
          this.lists.push({
            uid: uuid.v4(),
            name: result.name,
            market: result.market,
            items: [''],
            users: [this.currentUser],
          });
          let concatList = this.lists.concat(this.othersLists);
          if (concatList.length < 1) {
            this._shoppingListService.postList(
              concatList[concatList.length - 1]
            );
          } else {
            this._shoppingListService.putList(concatList);
          }
        }
        if (this.lists.length > 0) {
          this.empty = false;
          this.currentList = this.lists[this.lists.length - 1];
        }
      } else if (type == 'EDIT_LIST') {
        if (result != undefined && result != false) {
          this.lists[this.lists.indexOf(index)].name = result.name;
          this.lists[this.lists.indexOf(index)].market = result.market;
          // let concatList = this.lists.concat(this.othersLists);
          this._shoppingListService.putList(this.lists);
          this.drawer.close();
        }
      } else if (type == 'SHARE') {
        console.log(
          this.currentId,
          this.lists.indexOf(this.currentId),
          this.lists[this.lists.indexOf(index)]
        );

        if (result) {
          this.lists[this.lists.indexOf(index)].users.push(result.email);

          // let concatList = this.lists.concat(this.othersLists);

          this._shoppingListService.putList(this.lists);
        }
      } else if (type == 'DELETE_LIST') {
        if (result) {
          this._shoppingListService.postList(this.lists);
        }
      } else if (type == 'NEW_ITEM') {
        if (result != undefined && result != false) {
          this.lists[this.lists.indexOf(this.currentList)].items.push({
            name: result.name,
            price: result.price,
            uid: uuid.v4(),
            checked: false,
            date: new Date(),
          });
          if (this.lists[this.lists.indexOf(this.currentList)].items[0] == '') {
            this.lists[this.lists.indexOf(this.currentList)].items.splice(0, 1);
          }
          this.lists[this.lists.indexOf(this.currentList)].items.forEach(
            (item: any, index: number) => {
              if (item.checked) {
                this.lists[this.lists.indexOf(this.currentList)].items.splice(
                  index,
                  1
                );
                this.lists[this.lists.indexOf(this.currentList)].items.push(
                  item
                );
              }
            }
          );
          // let concatList = this.lists.concat(this.othersLists);
          this._shoppingListService.putList(this.lists);
        }
      } else if (type == 'EDIT_ITEM') {
        if (result != undefined && result != false) {
          this.lists[this.lists.indexOf(this.currentList)].items[
            this.currentList.items.indexOf(index)
          ].name = result.name;
          this.lists[this.lists.indexOf(this.currentList)].items[
            this.currentList.items.indexOf(index)
          ].price = result.price;
          // let concatList = this.lists.concat(this.othersLists);
          this._shoppingListService.putList(this.lists);
        }
      } else if (type == 'DELETE_ITEM') {
        if (result) {
        }
      }
    });
    this.listsList.closeSlidingItems();
  }

  deleteItem(index: number) {
    this.undoList.push(
      this.lists[this.lists.indexOf(this.currentList)].items[
        this.currentList.items.indexOf(index)
      ]
    );
    this.lists[this.lists.indexOf(this.currentList)].items.splice(
      this.currentList.items.indexOf(index),
      1
    );
    // let concatList = this.lists.concat(this.othersLists);
    this._shoppingListService.putList(this.lists);
  }

  share() {}

  logout() {
    this.lists = [];
    this.othersLists = [];
    this.logged = false;
    this.existente = false;
    this.equivocado = false;
    this.currentUser = '';
    this.token = '';
    localStorage.removeItem('upbToken');
    localStorage.removeItem('upbUser');
    this.formLogin.reset();
    this._shoppingListService.logout();
    console.log('TOKEN', this.token);
  }

  selectList(index: any) {
    this.empty = false;
    // this.currentIndex = index;
    this.currentId = this.lists[this.lists.indexOf(index)].uid;
    this.currentList = this.lists[this.lists.indexOf(index)];
    this.undoList = [];
    this.drawer.close();
  }
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'modal.html',
})
export class DialogOverviewExampleDialog {
  formItem: FormGroup;
  formList: FormGroup;
  formShare: FormGroup;
  market: boolean = false;
  price: boolean = false;

  constructor(
    private _fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.formList = this._fb.group({
      name: ['', [Validators.required]],
      market: ['', []],
      id: ['', []],
    });
    this.formItem = this._fb.group({
      name: ['', [Validators.required]],
      price: ['', []],
      id: ['', []],
    });
    this.formShare = this._fb.group({
      email: [
        '',
        [
          Validators.pattern(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
    });
    if (data.type == 'EDIT_LIST') {
      this.formList.controls['name'].setValue(data.name);
      this.formList.controls['market'].setValue(data.market);
    }
    if (data.type == 'EDIT_ITEM') {
      this.formItem.controls['name'].setValue(data.name);
      this.formItem.controls['price'].setValue(data.price);
    }
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    if (this.data.type == 'LOG_OUT') {
      this.dialogRef.close(true);
    } else if (this.data.type == 'NEW_LIST') {
      if (this.formList.valid) {
        let list = {
          name: this.formList.controls['name'].value,
          market: this.formList.controls['market'].value,
        };
        this.dialogRef.close(list);
      } else {
        this.formList.markAllAsTouched();
      }
    } else if (this.data.type == 'SHARE') {
      if (this.formShare.valid) {
        let share = {
          email: this.formShare.controls['email'].value,
        };
        this.dialogRef.close(share);
      } else {
        this.formShare.markAllAsTouched;
      }
    } else if (this.data.type == 'EDIT_LIST') {
      let list = {
        name: this.formList.controls['name'].value,
        market: this.formList.controls['market'].value,
      };
      this.dialogRef.close(list);
    } else if (this.data.type == 'DELETE_LIST') {
      this.dialogRef.close(true);
    } else if (this.data.type == 'NEW_ITEM') {
      if (this.formItem.valid) {
        let item = {
          name: this.formItem.controls['name'].value,
          price: this.formItem.controls['price'].value,
        };
        this.dialogRef.close(item);
      } else {
        this.formItem.markAllAsTouched();
      }
    } else if (this.data.type == 'EDIT_ITEM') {
      let item = {
        name: this.formItem.controls['name'].value,
        price: this.formItem.controls['price'].value,
      };
      this.dialogRef.close(item);
    } else if (this.data.type == 'DELETE_ITEM') {
      this.dialogRef.close(true);
    }
  }

  newListEnter(event: any) {
    if (event.code == 'Enter') {
      this.onYesClick();
    }
  }

  shareEnter(event: any) {
    if (event.code == 'Enter') {
      this.onYesClick();
    }
  }
}
