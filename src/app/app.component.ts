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
  formLogin: FormGroup;
  itemsCompare: any = [];
  lists: any = [];
  logged: boolean = false;
  modalidades: any[] = [
    { value: '1', viewValue: 'Normal' },
    { value: '2', viewValue: 'Precios' },
  ];
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
    firebase.initializeApp({
      apiKey: 'AIzaSyBHQVuQM353vYWb3w7_ZQLBagrfJJ9TqgQ',
      authDomain: 'shopping-list-d9b5e.firebaseapp.com',
    });
    // if (this.token != '') {
    //   this.getList();
    // }

    this.getToken();
    if (this.token != '' && this.token != null && this.currentUser != null) {
      this.logged = true;
      this.getList();
    }
    setTimeout(() => {
      if (this.lists.length > 0) {
        this.empty = false;
        this.currentIndex = 0;
        this.currentList = this.lists[this.currentIndex];
      }
    }, 2000);
  }

  getToken() {
    this.currentUser = localStorage.getItem('upbUser')!;
    this.token = localStorage.getItem('token')!;
    console.log('asd', this.token);
  }
  login() {
    if (this.formLogin.valid) {
      this._shoppingListService.login(
        this.formLogin.controls['email'].value,
        this.formLogin.controls['password'].value
      );
      setTimeout(() => {
        this.token = this._shoppingListService.getToken();
        console.log(this.token);
        if (this.token != '') {
          this.logged = true;
          this.equivocado = false;
          this.currentUser = this.formLogin.controls['email'].value;
          this.getList();
          localStorage.setItem('upbUser', this.currentUser);
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

  existente: boolean = false;
  equivocado: boolean = false;
  signup() {
    if (this.formLogin.valid) {
      this._shoppingListService.signUp(
        this.formLogin.controls['email'].value,
        this.formLogin.controls['password'].value
      );
      setTimeout(() => {
        this.token = this._shoppingListService.getToken();
        console.log(this.token);
        if (this.token != '') {
          this.logged = true;
          this.existente = false;
          this.currentUser = this.formLogin.controls['email'].value;
          localStorage.setItem('upbToken', this.token);
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
    // localStorage.setItem('upbToken', this.token);
    // this.logged = false;
    // this.token = '';
    // this.logout();
  }

  othersLists: any = [];

  getList() {
    this._shoppingListService.getList().subscribe((res: any) => {
      if (res.length > 0) {
        res.forEach((list: any) => {
          list.users.forEach((user: any) => {
            if (user == this.currentUser) {
              this.lists.push(list);
            } else {
              this.othersLists.push(list);
            }
          });
        });
        if (this.lists.length > 0) {
          this.empty = false;
          console.log('das', this.lists);
          this.currentList = 0;
          this.currentId = this.lists[0].id;
          this.currentList = this.lists[0];
        }
        // console.log('xsa',this.currentList);
      } else {
        this.lists = res;
      }
    });
  }

  loginGoogle() {
    this._shoppingListService.googleAuthentication();
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
    let concatList = this.lists.concat(this.othersLists);
    this._shoppingListService.putList(concatList);
  }

  print() {
    console.log('PRINT');
    console.log('USER', this.currentUser);
    console.log('LIST', this.lists);
  }

  undo() {
    // let x = new Date();
    // if (this.undoList.length > 0) {
    //   this.lists[this.currentIndex].items.push(this.undoList[0]);
    //   this.undoList.splice(0, 1);
    // }
    // this.lists[this.currentIndex].items.forEach((item: any, index: number) => {
    //   if (item.checked) {
    //     this.lists[this.currentIndex].items.splice(index, 1);
    //     this.lists[this.currentIndex].items.push(item);
    //   }
    // });
  }

  change() {
    if (this.selected == '1') {
      this.prices = false;
    } else if (this.selected == '2') {
      this.prices = true;
    }
  }

  deleteList(index: number) {
    // let index;
    // for (let i = 0; i < this.lists.length; i++) {
    //   if (this.lists[i].id == id) {
    //     index = i;
    //     break;
    //   }
    // }
    this.lists.splice(index, 1);
    let concatList = this.lists.concat(this.othersLists);
    this._shoppingListService.putList(concatList);
    if (this.lists.length <= 0) {
      this.empty = true;
    }
  }

  openModal(type: string, index: number = 0) {
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

      data = {
        type: type,
        name: this.currentList.items[index].name,
        compare: new Set(this.itemsCompare),
      };
    } else if (type == 'NEW_LIST') {
      data = { type: type };
    } else if (type == 'EDIT_LIST') {
      // let index: number;
      // for (let i = 0; i < this.lists.length; i++) {
      //   if (this.lists[i].id == id) {
      //     index = i;
      //     break;
      //   }
      // }
      // console.log(index!);
      data = {
        market: this.lists[index].market,
        name: this.lists[index].name,
        type: type,
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

          // this.currentIndex = this.lists.length - 1;
        }
      } else if (type == 'EDIT_LIST') {
        if (result != undefined && result != false) {
          // let index: number;
          // for (let i = 0; i < this.lists.length; i++) {
          //   if (this.lists[i].id == id) {
          //     index = i;
          //     break;
          //   }
          // }
          this.lists[index].name = result.name;
          this.lists[index].market = result.market;
          let concatList = this.lists.concat(this.othersLists);
          this._shoppingListService.putList(concatList);
          this.drawer.close();
        }
      } else if (type == 'DELETE_LIST') {
        if (result) {
          // if (this.currentIndex == index) {
          //   this.empty = true;
          // }
          // this._shoppingListService.deleteList(index);
          this._shoppingListService.postList(this.lists);
        }
        if (this.lists.length <= 0) {
          this.empty = true;
        }
      } else if (type == 'NEW_ITEM') {
        if (result != undefined && result != false) {
          this.lists[this.currentIndex].items.push({
            name: result.name,
            price: result.price,
            checked: false,
            date: new Date(),
          });
          if (this.lists[this.currentIndex].items[0] == '') {
            this.lists[this.currentIndex].items.splice(0, 1);
          }
          this.lists[this.currentIndex].items.forEach(
            (item: any, index: number) => {
              if (item.checked) {
                this.lists[this.currentIndex].items.splice(index, 1);
                this.lists[this.currentIndex].items.push(item);
              }
            }
          );
          let concatList = this.lists.concat(this.othersLists);
          this._shoppingListService.putList(concatList);
        }
      } else if (type == 'EDIT_ITEM') {
        if (result != undefined && result != false) {
          this.lists[this.currentIndex].items[index].name = result.name;
          this.lists[this.currentIndex].items[index].price = result.price;
          let concatList = this.lists.concat(this.othersLists);
          this._shoppingListService.putList(concatList);
        }
      } else if (type == 'DELETE_ITEM') {
        if (result) {
          // this.lists[this.currentIndex].items.splice(index, 1);
        }
      }
    });
    this.listsList.closeSlidingItems();
  }

  deleteItem(index: number) {
    // this.undoList.push(this.lists[this.currentIndex].items[index]);
    this.lists[this.currentIndex].items.splice(index, 1);
    let concatList = this.lists.concat(this.othersLists);
    this._shoppingListService.putList(concatList);
  }

  share() {
    console.log('SHARE');
  }

  logout() {
    console.log('logout');

    this.logged = false;
    this.currentUser = '';
    localStorage.removeItem('upbToken');
    localStorage.removeItem('upbUser');
    this.formLogin.reset();
    this._shoppingListService.logout();
  }

  selectList(index: number) {
    this.empty = false;
    // let index: number;
    // for (let i = 0; i < this.lists.length; i++) {
    //   if (this.lists[i].id == id) {
    //     index = i;
    //     break;
    //   }
    // }
    this.currentIndex = index;
    this.currentId = this.lists[index].id;
    this.currentList = this.lists[index];
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
