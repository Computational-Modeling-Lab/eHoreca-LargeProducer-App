import { Component }                from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HTTP as HttpClient }       from "@ionic-native/http/ngx";
import { Storage }                  from '@ionic/storage';
import { LoadingController }        from 'ionic-angular';

import { LandingPage }              from '../landing/landing';
import { RegisterPage }             from '../register/register';

import { ConstantsProvider }        from '../../providers/constants/constants';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage
{
  url: string;
  email: any;
  password: any;

  willLogin: boolean = true;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public http: HttpClient,
              public storage: Storage,
              public loadingctrl: LoadingController,
              public constants: ConstantsProvider)
  {
    this.url = this.constants.getUrl();

    this.storage.get('email').then(
      email =>
      {
        if (email)
        {
          this.email = email;
          this.storage.get('password').then(
            password =>
            {
              if (password)
                this.password = password;
            }
          );
        }
      }
    );

    if (this.email !== undefined && this.password !== undefined)
      this.login();
  }

  async login()
  {
    const loading = this.loadingctrl.create({content: "Logging in...<br>Please wait..."});
    await loading.present();

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
    ).then(async (data: any) =>
      {
        loading.dismiss();

        data = JSON.parse(data.data);

        await this.storage.set('token', data.token);
        await this.storage.set('user_id', data.id);
        await this.storage.set('email', this.email);
        await this.storage.set('password', this.password);
        await this.navCtrl.setRoot(LandingPage);
      },
      (error: any) => {
        console.error(JSON.stringify(error));
      }
    ).catch(err =>
      {
        loading.dismiss();
        this.willLogin = false;
        console.error(JSON.stringify(err));
      }
    );
  }

  register()
  {
    this.navCtrl.setRoot(RegisterPage);
  }
}
