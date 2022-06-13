import { Component, ViewChild, ElementRef } from '@angular/core';
import { LoadingController } from "ionic-angular";
import { HTTP as HttpClient } from "@ionic-native/http/ngx";

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';

import { ConstantsProvider } from './../../providers/constants/constants';

declare var google;

@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {
  @ViewChild('map') mapElement: ElementRef;
  map: any;

  url: string;

  bins: any;
  iconLocation: string = "../../assets/images/markers/";
  activeInfoWindow: any;
  showMixed: boolean = false;
  showRecycle: boolean = false;
  showCompost: boolean = false;

  constructor(
    public geolocation: Geolocation,
    public nativeGeocoder: NativeGeocoder,
    public loadingctrl: LoadingController,
    public constants: ConstantsProvider,
    public http: HttpClient,
  ) {
    this.url = this.constants.getUrl();
  }

  async ionViewDidLoad() {
    try {
      const data = await this.http.get(
        `${this.url}/bins`,
        {},
        {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Content-Type': 'application/json'
        }
      );
      if (data.data) this.bins = JSON.parse(data.data);
    } catch (error) {
      console.error(JSON.stringify(error));
    }
    this.loadMap();
  }

  async loadMap() {
    const loading = this.loadingctrl.create({ content: "Loading map...", duration: 5000 });
    try {
      await loading.present();
      const resp = await this.geolocation.getCurrentPosition();
      const latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      const mapOptions =
      {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_LEFT,
        },
        streetViewControl: false,
        fullscreenControl: false,
        rotateControl: false,
        scaleControl: false,
      }
  
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  
      new google.maps.Marker(
        {
          position: latLng,
          map: this.map,
          title: "You are here!"
        });
  
      if (this.bins) {
        console.log(JSON.stringify(this.bins));
  
        this.bins.forEach(bin => {
          const binLocation = new google.maps.LatLng(bin.location.lat, bin.location.lng);
  
          let icon = this.iconLocation;
          switch (bin.type) {
            case 'compost':
              icon += "waste_container_yellow.vsmall.png";
              break;
            case 'glass':
              icon += "waste_container_blue.vsmall.png";
              break;
            case 'recyclable':
              icon += "waste_container_blue.vsmall.png";
              break;
            case 'mixed':
              icon += "waste_container_green.vsmall.png";
              break;
            case 'metal':
              icon += "waste_container_blue.vsmall.png";
              break;
            case 'paper':
              icon += "waste_container_yellow.vsmall.png";
              break;
            case 'plastic':
              icon += "waste_container_blue.vsmall.png";
              break;
          }
  
          const contentString =
            `<h3>Bin #${bin.id}</h3>` +
            "<p>" +
            `<b>Type:</b> ${bin.type}<br>` +
            `<b>Capacity:</b> ${bin.capacity}${bin.capacity_unit}` +
            "</p>";
  
          const infowindow = new google.maps.InfoWindow({
            content: contentString,
          });
  
          const marker = new google.maps.Marker(
            {
              position: binLocation,
              icon: icon,
              map: this.map,
              title: "Bin"
            })
  
          marker.addListener("click", () => {
            if (this.activeInfoWindow) this.activeInfoWindow.close();
            infowindow.open(this.map, marker);
            this.activeInfoWindow = infowindow;
          });
        });
      }
      loading.dismiss();
    } catch (error) {
      console.log('error:', error);
      loading.dismiss();
    }
  }
}
