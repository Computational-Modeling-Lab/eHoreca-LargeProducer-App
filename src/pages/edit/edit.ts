import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HTTP as HttpClient } from "@ionic-native/http/ngx";
import { LoadingController, Loading } from 'ionic-angular';

import { LandingPage } from './../landing/landing';

import { ConstantsProvider } from '../../providers/constants/constants';


@Component({
  selector: 'page-edit',
  templateUrl: 'edit.html',
})
export class EditPage {
  token: string;
  producer: any;
  gotBins: boolean = false;
  userBins: Array<any>;

  loc_lat: number;
  loc_lng: any;
  capacity: number = 0;
  capacity_unit: string;
  type: string;
  description: string;
  quantity: number = 0;

  url: string;
  modalData: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: HttpClient,
    public storage: Storage,
    public alertController: AlertController,
    public modalController: ModalController,
    public loadingctrl: LoadingController,
    public constants: ConstantsProvider
  ) {
    this.url = this.constants.getUrl();
    this.storage.get('token').then(token => {
      this.token = token;
    }
    );
    this.getBins();
  }

  getBins() {
    this.storage.get('w_prod').then(
      w_prod => {
        this.producer = JSON.parse(w_prod);

        this.http.get(
          `${this.url}/bins/w_producer/${this.producer.id}`,
          {},
          {
            Authorization: `Bearer ${this.token}`,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Content-Type': 'application/json'
          }
        ).then((data: any) => {
          console.log('bins data:', data);
          const parsed = JSON.parse(data.data);

          this.userBins = parsed;
          if (this.userBins.length > 0)
            this.gotBins = true;
        }
        ).catch(err => {
          console.error(JSON.stringify(err));
        }
        )
      }
    );
  }

  async addNew() {
    const modal = await this.modalController.create('BinAddEditPage', { data: { caller: "Add New" } })
    await modal.present();

    await modal.onDidDismiss(async data => {
      if (data) {
        this.loc_lat = data.loc_lat
        this.loc_lng = data.loc_lng
        this.capacity = data.capacity
        this.capacity_unit = data.capacity_unit
        this.type = data.type
        this.description = data.description
        this.quantity = data.quantity

        const object = {
          w_producer_id: this.producer.id.toString(),
          bin : {
            lat: this.loc_lat,
            lng: this.loc_lng,
            capacity: this.capacity,
            capacity_unit: this.capacity_unit,
            type: this.type,
            description: this.description,
            quantity: this.quantity,
          }
        }

        console.log('object', object,)

        if(this.loc_lat && this.loc_lng && this.capacity && this.capacity_unit && this.type && this.description && this.quantity){
          const loading = this.loadingctrl.create({ content: "Uploading changes...<br>Please wait..." });
          await loading.present();
          this.http.setDataSerializer("json");
          this.http.post(
            `${this.url}/w_producers/new_bin`,
            object,
            {
              Authorization: `Bearer ${this.token}`,
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
              'Content-Type': 'application/json'
            }
          ).then(data => {
            console.log('New bin data:', data);
            this.getBins();
            this.successAlert(loading);
          }
          ).catch(err => {
            this.failureAlert(loading);
            console.error(err);
          }
          )

        }
        else this.missingAlert();
      }
    })
  }

  async edit(bin) {
    const modal = await this.modalController.create('BinAddEditPage', { data: { caller: "Edit", bin: bin } })
    await modal.present()

    modal.onDidDismiss(async data => {
      if (data) {
        this.loc_lat = data.loc_lat
        this.loc_lng = data.loc_lng
        this.capacity = data.capacity
        this.capacity_unit = data.capacity_unit
        this.type = data.type
        this.description = data.description
        this.quantity = data.quantity

        const loading = this.loadingctrl.create({ content: "Updating bin...<br>Please wait..." });
        await loading.present();

        const object = {
          lat: this.loc_lat,
          lng: this.loc_lng,
          capacity: this.capacity,
          capacity_unit: this.capacity_unit,
          type: this.type,
          description: this.description,
          quantity: this.quantity,
        }
        console.log('object:', object);
        this.http.setDataSerializer("json");
        this.http.put(
          `${this.url}/bins/${bin.id}`,
          object,
          {
            Authorization: `Bearer ${this.token}`,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Content-Type': 'application/json'
          }
        ).then(data => {
          console.log('data:', data);
          this.getBins();
          this.successAlert(loading);
        }
        ).catch(err => {
          this.failureAlert(loading);
          console.error(JSON.stringify(err));
        }
        );
      }
    })
  }

  async trash(id) {
    // first ask the user if he is sure about this action
    const alert = await this.alertController.create(
      {
        title: 'Warning!',
        subTitle: 'Non-Revertable Action!',
        message: 'Are you realy sure you want to perform this action? You cannot revert it!',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Confirm',
            role: 'confirm',
            handler: () => {
              const loading = this.loadingctrl.create({ content: "Deleting bin...<br>Please wait..." });
              loading.present();

              this.http.delete(
                `${this.url}/w_producers/${this.producer.id}/bins?bin_id=${id}`,
                {},
                {
                  Authorization: `Bearer ${this.token}`,
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                  'Content-Type': 'application/json'
                }
              ).then(data => {
                this.successAlert(loading);
                this.navCtrl.setRoot(EditPage);
              }
              ).catch(err => {
                this.failureAlert(loading);
                console.error(err);
              }
              )
            }
          }]
      })

    await alert.present();
  }

  async successAlert(loading: Loading) {
    loading.dismiss();

    const alert = await this.alertController.create(
      {
        title: 'Success',
        message: 'The action has been completed successfully!',
        buttons: ['OK']
      })
    this.clearVars();
    await alert.present();
  }

  async failureAlert(loading: Loading) {
    loading.dismiss();

    const alert = await this.alertController.create(
      {
        title: 'Failure',
        message: 'Something went wrong! Please try again!',
        buttons: ['OK']
      })

    await alert.present();
  }

  async missingAlert() {
    const alert = await this.alertController.create(
      {
        title: 'Missing Data',
        message: 'You are missing data. Please fill all the requested fields!',
        buttons: ['OK']
      })

    await alert.present();
  }

  clearVars() {
    this.loc_lat = undefined;
    this.loc_lng = undefined;
    this.capacity = 0
    this.capacity_unit = undefined;
    this.type = undefined;
    this.description = undefined;
    this.quantity = 0
  }

  back() {
    this.navCtrl.setRoot(LandingPage);
  }
}
