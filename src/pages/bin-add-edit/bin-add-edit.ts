import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavParams, ViewController, Platform, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { ConstantsProvider } from '../../providers/constants/constants';

declare var google;

@IonicPage()
@Component({
  selector: 'page-bin-add-edit',
  templateUrl: 'bin-add-edit.html',
})
export class BinAddEditPage {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  marker: any;

  url: string;

  data: object;
  caller: string;

  loc_lat: number ;
  loc_lng: any;
  capacity: number;
  capacity_unit: string;
  type: string;
  description: string;
  quantity: number;

  cur_loc_lat: number;
  cur_loc_lng: any;
  cur_capacity: number;
  cur_capacity_unit: string;
  cur_type: string;
  cur_description: string;
  cur_quantity: number;

  constructor(
    public navParams: NavParams,
    public viewController: ViewController,
    public geolocation: Geolocation,
    public platform: Platform,
    public constants: ConstantsProvider,
    public loadingctrl: LoadingController,
  ) {
    this.url = this.constants.getUrl();

    this.platform.ready().then(async () => {
      const data = this.navParams.get('data');
      console.log('data bin:', data);
      this.caller = data.caller;

      if (this.caller === "Edit" && data.bin) {
        this.cur_loc_lat = data.bin.location.lat;
        this.cur_loc_lng = data.bin.location.lng;
        this.cur_capacity = data.bin.capacity;
        this.cur_capacity_unit = data.bin.capacity_unit;
        this.cur_type = data.bin.type;
        this.cur_description = data.bin.description;
        this.quantity = data.bin.quantity;

        let latLng = new google.maps.LatLng(this.cur_loc_lat, this.cur_loc_lng);

        let mapOptions =
        {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

        this.marker = new google.maps.Marker(
          {
            position: latLng,
            title: "Bin Location!"
          })
        this.marker.setMap(this.map);

        this.map.addListener('click', (event) => { this.placeMarker(event.latLng); })
      }
      else {
        await this.getUserLocation();
        const latLng = new google.maps.LatLng(this.cur_loc_lat, this.cur_loc_lng);
        this.loc_lat = this.cur_loc_lat
        this.loc_lng = this.cur_loc_lng

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
            title: "Bin Location!"
          })
        this.marker.setMap(this.map);

        this.map.addListener('click', (event) => { this.placeMarker(event.latLng); })
      }
    })
  }

  async getUserLocation (): Promise<void> {
    const loading = this.loadingctrl.create({ content: "Retrieving your location..." });
    await loading.present();
    try {
      const geolocationOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
      };
      const res = await this.geolocation.getCurrentPosition(geolocationOptions);
      this.cur_loc_lat = res.coords.latitude;
      this.cur_loc_lng = res.coords.longitude;
      loading.dismiss();
    } catch (error) {
      console.log('error getting location:', error);
      loading.dismiss();
    }
    // Set default location at corfu
    if (!this.cur_loc_lat || !this.cur_loc_lng) {
      this.cur_loc_lat = 39.621099;
      this.cur_loc_lng = 19.917693;
    }
  }

  placeMarker(location) {
    console.log('location:', location);
    console.log('this.marker:', this.marker);
    this.marker.setMap(null);
    this.marker = new google.maps.Marker(
      {
        position: location,
        title: "Bin Location!"
      })
    this.marker.setMap(this.map);

    this.cur_loc_lat = location.lat()
    this.cur_loc_lng = location.lng()
    this.loc_lat = location.lat()
    this.loc_lng = location.lng()
  }

  dismissModal() {
    this.data = {};

    if (this.description === "")
      this.description = "No description available."

    Object.assign(this.data,
      {
        loc_lat: this.loc_lat,
        loc_lng: this.loc_lng,
        capacity: this.capacity,
        capacity_unit: this.capacity_unit,
        type: this.type,
        description: this.description,
        quantity: this.quantity
      })

    this.viewController.dismiss(this.data)
  }

  checkExist(value, field) {
    if (value)
      return value
    else
      switch (field) {
        case "capacity":
          return "0";
        case "capacity_unit":
          return "Litre"
        case "type":
          return "Mixed"
        case "description":
          return "My Bin Description"
        case "quantity":
          return "Quantity"
      }
  }

  cancel() { this.viewController.dismiss(null); }
}
