import { Component, Inject, OnInit, ViewChild } from '@angular/core';
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
export class AppComponent implements OnInit {
  @ViewChild('drawer') drawer: MatDrawer;
  @ViewChild('listsList') listsList: IonList;

  currentIndex = 0;
  currentList: any;
  currentUser: string = '';
  empty: boolean = true;
  formLogin: FormGroup;
  itemsCompare: any = [];
  lists: any = [];
  logged: boolean = false;
  modalidades: any[] = [
    { value: '1', viewValue: 'Normal' },
    { value: '2', viewValue: 'Precios' },
  ];
  prices = true;
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
    firebase.initializeApp({
      apiKey: 'AIzaSyBHQVuQM353vYWb3w7_ZQLBagrfJJ9TqgQ',
      authDomain: 'shopping-list-d9b5e.firebaseapp.com',
    });
    if (this.token != '') {
      this.getList();
    }
    setTimeout(() => {
      if (this.lists.length > 0) {
        this.empty = false;
        this.currentIndex = 0;
        this.currentList = this.lists[this.currentIndex];
      }
    }, 1500);
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
          this.currentUser = this.formLogin.controls['email'].value;
          this.getList();
          localStorage.setItem('upbToken', this.token);
        } else {
          this.formLogin.markAllAsTouched();
        }
      }, 1500);
    } else {
      this.formLogin.markAllAsTouched();
    }
  }

  signup() {
    if (this.formLogin.valid) {
      this._shoppingListService.signUp(
        this.formLogin.controls['email'].value,
        this.formLogin.controls['password'].value
      );
      setTimeout(() => {
        this.token = this._shoppingListService.getToken();
        if (this.token != '') {
          this.logged = true;
          this.currentUser = this.formLogin.controls['email'].value;

          localStorage.setItem('upbToken', this.token);
        } else {
          this.formLogin.markAllAsTouched();
        }
      }, 1500);
    } else {
      this.formLogin.markAllAsTouched();
    }
  }

  // POP
  getList() {
    this._shoppingListService.getList();
    setTimeout(() => {
      let x: any = this._shoppingListService.getLists2();
      // for (const [key, value] of x.entries(x)) {
      //   console.log(`${key}: ${value}`);
      // }
      console.log(x);

      this.lists = x != null ? x[0] : [];
    }, 1500);
  }

  loginGoogle() {
    console.log('Google');
  }

  check(index: number) {
    if (!this.lists[this.currentIndex].items[index].checked) {
      setTimeout(() => {
        let checked = this.lists[this.currentIndex].items[index];
        this.lists[this.currentIndex].items.splice(index, 1);
        checked.checked = true;
        this.lists[this.currentIndex].items.push(checked);
      }, 2000);
    }
  }

  print() {
    console.log('PRINT', this.lists);
  }

  undo() {
    let x = new Date();
    if (this.undoList.length > 0) {
      this.lists[this.currentIndex].items.push(this.undoList[0]);
      this.undoList.splice(0, 1);
    }
    this.lists[this.currentIndex].items.forEach((item: any, index: number) => {
      if (item.checked) {
        this.lists[this.currentIndex].items.splice(index, 1);
        this.lists[this.currentIndex].items.push(item);
      }
    });
  }

  change() {
    if (this.selected == '1') {
      this.prices = false;
    } else if (this.selected == '2') {
      this.prices = true;
    }
  }

  deleteList(index: number) {
    this.lists.splice(index, 1);

    // if (this.lists.length <= 0) {
    this.empty = true;
    // }
  }

  openModal(type: string, index: number = 0) {
    let data = {};
    if (type == 'LOG_OUT') {
      data = { type: type };
    } else if (type == 'COMPARE') {
      this.itemsCompare = [];
      this.lists.forEach((list: any) => {
        list.items.forEach((item: any) => {
          item.market = list.market;
          item.price = parseFloat(item.price);
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

      data = {
        type: type,
        name: this.currentList.items[index].name,
        compare: new Set(this.itemsCompare),
      };
    } else if (type == 'NEW_LIST') {
      data = { type: type };
    } else if (type == 'EDIT_LIST') {
      data = {
        name: this.lists[index!].name,
        type: type,
        market: this.lists[index!].market,
      };
    } else if (type == 'DELETE_LIST') {
      data = { type: type };
    } else if (type == 'NEW_ITEM') {
      data = { type: type, price: this.prices };
    } else if (type == 'EDIT_ITEM') {
      data = {
        name: this.lists[this.currentIndex].items[index].name,
        price: this.lists[this.currentIndex].items[index].price,
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
      // if (type == 'NEW_LIST') {
      //   if (this.lists.length > 0) {
      //     console.log('mayor a 0');
      //     type = 'EDIT_LIST';
      //   }
      // }
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
            items: [],
            users: [this.currentUser],
          });
          if (this.lists.length < 1) {
            this._shoppingListService.postList(
              this.lists[this.lists.length - 1]
            );
          } else {
            this._shoppingListService.putList(this.lists);
          }
        }
        if (this.lists.length > 0) {
          this.empty = false;
          this.currentList = this.lists[this.lists.length - 1];

          this.currentIndex = this.lists.length - 1;
        }
      } else if (type == 'EDIT_LIST') {
        if (result != undefined && result != false) {
          this.lists[index].name = result.name;
          this.lists[index].market = result.market;
          this._shoppingListService.putList(this.lists);
        }
      } else if (type == 'DELETE_LIST') {
        if (result) {
          if (this.currentIndex == index) {
            this.empty = true;
          }
          this._shoppingListService.deleteList(index);
          this._shoppingListService.postList(this.lists);
        }
        if (this.lists.length <= 0) {
          this.empty = true;
        }
      } else if (type == 'NEW_ITEM') {
        let id: number;
        if (this.lists[this.currentIndex].items.length <= 0) {
          id = 1;
        } else {
          id = this.lists[this.currentIndex].items.length + 1;
        }
        if (result != undefined && result != false) {
          this.lists[this.currentIndex].items.push({
            name: result.name,
            id: id,
            price: result.price,
            checked: false,
            date: new Date(),
          });

          this.lists[this.currentIndex].items.forEach(
            (item: any, index: number) => {
              if (item.checked) {
                let checked = item;
                // checked.push(item);
                this.lists[this.currentIndex].items.splice(index, 1);
                this.lists[this.currentIndex].items.push(item);
              }
            }
          );
          // if (checked.length > 0) {
          //   this.lists[this.currentIndex].items =
          //     this.lists[this.currentIndex].items.concat(checked);
          // }
        }
      } else if (type == 'EDIT_ITEM') {
        if (result != undefined && result != false) {
          this.lists[this.currentIndex].items[index].name = result.name;
          this.lists[this.currentIndex].items[index].price = result.price;
          this.lists[this.currentIndex].items[index].market = result.market;
        }
      } else if (type == 'DELETE_ITEM') {
        if (result) {
          this.lists[this.currentIndex].items.splice(index, 1);
        }
      }
    });
    this.listsList.closeSlidingItems();
  }

  deleteItem(index: number) {
    this.undoList.push(this.lists[this.currentIndex].items[index]);
    this.lists[this.currentIndex].items.splice(index, 1);
  }

  share() {
    console.log('SHARE');
  }

  logout() {
    this.logged = false;
    this._shoppingListService.logout();
    this.currentUser = '';
    localStorage.removeItem('upbToken');
    this.formLogin.reset();
  }

  selectList(index: number) {
    this.empty = false;
    this.drawer.close();
    this.currentIndex = index;
    this.currentList = this.lists[index];
    this.undoList = [];
  }
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'modal.html',
})
export class DialogOverviewExampleDialog {
  formItem: FormGroup;
  formList: FormGroup;
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
    this.formItem.controls['name'].setValue('a');
    this.formItem.controls['price'].setValue(10);
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
}
