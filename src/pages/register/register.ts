import { Component, ViewChild, ElementRef }   from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { HTTP as HttpClient }                 from "@ionic-native/http/ngx";
import { Storage }                            from '@ionic/storage';
import { Geolocation }                        from '@ionic-native/geolocation/ngx';
import { UniqueDeviceID }                     from '@ionic-native/unique-device-id/ngx';
import { LoadingController }                  from 'ionic-angular';

import { LandingPage }                        from './../landing/landing';
import { LoginPage }                          from './../login/login';

import { ConstantsProvider } from '../../providers/constants/constants';

declare var google;

@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage
{
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  marker: any;

  isProblematic: boolean = false;
  isMissing: boolean = false;
  error: boolean = false;

  companies: any;
  targetCompany: any;
  companyName: string = "";
  phone: number = 0;
  description: string = "";
  loc_lat: number;
  loc_lng: number;

  name: string = "";
  surname: string = "";
  userName: any = "";
	email: string = "";
  password: string = "";
  role: string = "";
  pin: number;

  userID: any;

  url: string;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public http: HttpClient,
              public geolocation: Geolocation,
              public platform: Platform,
              public storage: Storage,
              public UDID: UniqueDeviceID,
              public loadingctrl: LoadingController,
              public constants: ConstantsProvider)
  {
    this.url = this.constants.getUrl();

    this.platform.ready().then(() =>
    {
      this.geolocation.getCurrentPosition().then(res =>
      {
        this.loc_lat = res.coords.latitude
        this.loc_lng = res.coords.longitude
      })
    });

    const loading = this.loadingctrl.create({content: "Loading data...<br>Please wait..."});
    loading.present();

    this.http.get(
      `${this.url}/w_producers`,
      {},
      {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Content-Type': 'application/json'
      }
    ).then((data: any) =>
      {
        loading.dismiss();

        data = JSON.parse(data.data);

        this.companies = data.results;
    }
    ).catch(err =>
      {
        loading.dismiss();
        console.error(JSON.stringify(err));
      }
    );
  }

  roleSelected()
  {
    if (this.role === "w_producer")
    setTimeout(
      () =>
      {
        const latLng = new google.maps.LatLng(this.loc_lat, this.loc_lng);

        const mapOptions =
        {
          center: latLng,
          zoom: 14,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false
        }

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

        this.marker = new google.maps.Marker(
        {
          position: latLng,
          title: "Company Location!"
        })
        this.marker.setMap(this.map)
        this.map.addListener('click', (event) => { this.placeMarker(event.latLng); })
      }, 500
    );
  }

  placeMarker(location)
  {
    this.marker.setMap(null);

    this.marker = new google.maps.Marker(
    {
      position: location,
      title: "Bin Location!"
    })
    this.marker.setMap(this.map);

    this.loc_lat = location.lat()
    this.loc_lng = location.lng()
  }

  async register()
  {
    if (!this.name || !this.surname || !this.email || !this.password)
    {
      this.isMissing = true;
      return;
    }

    if (!this.userName)
    {
      // if (this.UDID.get())
      //   this.UDID.get().then((udid: any) => { this.userName = Md5.hashStr(udid.toString()) })
      // else
        this.userName = `${this.name} ${this.surname}`;
    }

    const loading = this.loadingctrl.create({content: "Registering...<br>Please wait..."});
    await loading.present();

    if (this.role === "w_producer") // employer
    {
      if (!this.companyName || !this.phone || !this.description || !this.pin || !this.loc_lat || !this.loc_lng)
      {
        loading.dismiss();
        this.isMissing = true;
        console.log(JSON.stringify([this.companyName, this.phone, this.description, this.pin, this.loc_lat, this.loc_lng]));
        return;
      }

      this.http.post(
        `${this.url}/w_producers/employer`,
        {
          name: this.name,
          surname: this.surname,
          email: this.email,
          password: this.password,
          username: this.userName,
          title: this.companyName,
          contact_telephone: this.phone,
          description: this.description,
          join_pin: this.pin,
          lat: this.loc_lat,
          lng: this.loc_lng,
        },
        {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Content-Type': 'application/json'
        }
      ).then(data =>
        {
          this.login(loading);
        }
      ).catch(err =>
        {
          loading.dismiss();
          this.isProblematic = true;
          console.error(JSON.stringify(err));
        }
      );
    }
    else  // employee
    {
      if (!this.targetCompany)
      {
        this.isMissing = true;
        return;
      }

      const companyId = this.targetCompany;

      this.http.post(
        `${this.url}/w_producers/employee/${companyId}`,
        {
          name: this.name,
          surname: this.surname,
          email: this.email,
          password: this.password,
          username: this.userName,
          join_pin: this.pin,
        },
        {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Content-Type': 'application/json'
        }
      ).then(data =>
        {
          this.login(loading);
        }
      ).catch(err =>
        {
          loading.dismiss();
          this.error = true;
          console.error(JSON.stringify(err));
        }
      );
    }
  }

  login(loading)
  {
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
    ).then((data: any) =>
      {
        loading.dismiss();

        data = JSON.parse(data.data);

        this.storage.set('token', data.token);
        this.storage.set('user_id', data.id);
        this.storage.set('email', this.email);
        this.storage.set('password', this.password);

        this.http.get(
          `${this.url}/w_producers/from_user_id/${data.id}`,
          {},
          {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Content-Type': 'application/json'
          }
        ).then((data: any) =>
          {
            data = JSON.parse(data.data);

            this.storage.set('w_prod', JSON.stringify(data.data[0]));
            this.navCtrl.setRoot(LandingPage);
          }
        ).catch(err =>
          {
            this.error = true;
            console.error(JSON.stringify(err));
          }
        )
      }
    ).catch(err =>
      {
        loading.dismiss();
        this.error = true;
        console.error(JSON.stringify(err));
      }
    );
  }

  back() { this.navCtrl.setRoot(LoginPage); }
}
