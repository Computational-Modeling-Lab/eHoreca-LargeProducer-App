import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HTTP as HttpClient } from "@ionic-native/http/ngx";
import { Storage } from '@ionic/storage';
import { LoadingController } from 'ionic-angular';

import { LandingPage } from '../landing/landing';
import { RegisterPage } from '../register/register';

import { ConstantsProvider } from '../../providers/constants/constants';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  url: string;
  email: any;
  password: any;

  willLogin: boolean = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: HttpClient,
    public storage: Storage,
    public loadingctrl: LoadingController,
    public constants: ConstantsProvider
  ) {
    this.url = this.constants.getUrl();

    this.storage.get('email').then(
      email => {
        if (email) {
          this.email = email;
          this.storage.get('password').then(
            password => {
              if (password)
                this.password = password;
              if (this.email !== undefined && this.password !== undefined)
                this.login();
            }
          );
        }
      }
    );
  }

  async login() {
    const loading = this.loadingctrl.create({ content: "Logging in...<br>Please wait...", duration: 5000 });
    await loading.present();
    this.willLogin = true;
    this.http.post(
      `${this.url}/login`,
      {
        email: this.email,
        password: this.password
      },
      {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Content-Type': 'application/json'
      }
    ).then(async (data: any) => {
      console.log('data:', data);
      loading.dismiss();

      const parsed = JSON.parse(data.data)
      console.log('parsed:', parsed);
      this.storage.set("token", parsed.token);
      this.storage.set("user_id", parsed.id);
      this.storage.set('email', this.email);
      this.storage.set('password', this.password);

      this.http.get(
        `${this.url}/w_producers/from_user_id/${parsed.id}`,
        {},
        {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Content-Type': 'application/json'
        }
      ).then(async (data: any) => {
        console.log('w_prod:', data);
        this.storage.set('w_prod', data.data);
        await this.navCtrl.setRoot(LandingPage);
      }
      ).catch(err => {
        console.error(JSON.stringify(err));
      }
      )
    }
    ).catch(err => {
      loading.dismiss();
      this.willLogin = false;
      console.error(JSON.stringify(err));
    }
    );
  }

  register() {
    this.navCtrl.setRoot(RegisterPage);
  }
}
