import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, Platform } from 'ionic-angular';
import { HTTP as HttpClient } from "@ionic-native/http/ngx";
import { Storage } from '@ionic/storage';
import { LoadingController } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation/ngx';

import { LandingPage } from './../landing/landing';

import { ConstantsProvider } from '../../providers/constants/constants';


@Component({
  selector: 'page-report',
  templateUrl: 'report.html',
})
export class ReportPage {
  token: string;
  readyToSend = false;

  gotBins = false;
  userBins: any;

  reportOwnBin = true;
  closestBin: any;
  targetBin: any;
  ownBin: any;

  producer: any;
  userId: number;
  loc_lat: number;
  loc_lng: number;
  loc_acc: number;
  issue: any;
  comment: string = "";

  url: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: HttpClient,
    public storage: Storage,
    public geolocation: Geolocation,
    public alertController: AlertController,
    public platform: Platform,
    public loadingctrl: LoadingController,
    public constants: ConstantsProvider
  ) {
    this.url = this.constants.getUrl();
    this.init();
  }

  async init() {
    this.storage.get("user_id").then(res => { this.userId = res; })
    this.storage.get('token').then(token => {
      this.token = token;
    })
    this.storage.get('w_prod').then(
      async w_prod => {
        this.producer = JSON.parse(w_prod);
        const loading = this.loadingctrl.create({ content: "Getting bins...<br>Please wait...", duration: 5000 });
        await loading.present();
        await this.getBins(loading);
      }
    );

    this.platform.ready().then(() => {
      this.geolocation.getCurrentPosition().then(async (resp) => {
        const loading = this.loadingctrl.create({ content: "Getting closest bin...<br>Please wait...", duration: 5000 });
        await loading.present();

        if (resp && resp.coords) {
          this.loc_lat = await resp.coords.latitude
          this.loc_lng = await resp.coords.longitude
          this.loc_acc = await resp.coords.accuracy
          await this.getClosestBin(loading);
        }
        else console.error("No geolocation")
      })
    })
  }

  async getBins (loading): Promise<void> {
    try {
      const data = await this.http.get(
        `${this.url}/bins/w_producer/${this.producer.id}`,
        {},
        {
          Authorization: `Bearer ${this.token}`,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Content-Type': 'application/json'
        }
      )
      const parsed = JSON.parse(data.data);
      this.userBins = parsed;
      if (this.userBins.length > 0)
      this.gotBins = true;
      if (loading) loading.dismiss();
    } catch (error) {
      console.log('getBins error:', error);
      if (loading) loading.dismiss();
    }
  }

  async getClosestBin(loading): Promise<void> {
    try {
      const object = {
        lat: this.loc_lat,
        lng: this.loc_lng,
        isDriver: false
      }
      console.log('object:', object);
      this.http.setDataSerializer("json");
      const data = await this.http.post(
        `${this.url}/bins/closest`,
        object,
        {
          Authorization: `Bearer ${this.token}`,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Content-Type': 'application/json'
        }
      )
      console.log('closest bin data:', data);
      this.closestBin = JSON.parse(data.data);
      this.targetBin = JSON.parse(data.data);
      if (loading) loading.dismiss();
    } catch (error) {
      console.log('getClosestBin error:', error);
      if (loading) loading.dismiss();
    }
  }

  changeTarget(reportOwnBin) {
    if (reportOwnBin) {
      this.targetBin = null
      this.targetBin = this.ownBin
    }
    else {
      this.targetBin = null
      this.targetBin = this.closestBin
    }
  }

  async sendReport() {
    const loading = this.loadingctrl.create({ content: "Uploading report...<br>Please wait..." });
    await loading.present();
    this.http.setDataSerializer("json");
    this.http.post(
      `${this.url}/reports`,
      {
        lat: this.loc_lat,
        lng: this.loc_lng,
        bin_id: this.targetBin.id,
        user_id: this.userId,
        location_accuracy: this.loc_acc,
        issue: this.issue,
      },
      {
        Authorization: `Bearer ${this.token}`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Content-Type': 'application/json'
      }
    ).then(data => {
      console.log('Report data:', data);
      loading.dismiss();
      this.success();
    }
    ).catch(err => {
      loading.dismiss();
      this.failure();
      console.error(JSON.stringify(err));
    }
    )
  }

  async success() {
    const myAlert = await this.alertController.create(
      {
        title: "Thank you!",
        message: 'Thank you for your report.',
        buttons: [{ text: 'Continue', role: 'continue', handler: () => { this.back(); } }]
      });

    await myAlert.present();
  }

  async failure() {
    const myAlert = await this.alertController.create(
      {
        title: "Error",
        message: 'Something went wrong. Please try again later.',
        buttons: ["Return"]
      });

    await myAlert.present();
  }

  back() {
    this.navCtrl.setRoot(LandingPage);
  }
}
