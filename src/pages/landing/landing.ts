import { Component }                          from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { Storage }                            from '@ionic/storage';
import { Geolocation }                        from '@ionic-native/geolocation/ngx';

import { MapPage }                            from './../map/map'
import { AboutPage }                          from './../about/about';
import { EditPage }                           from './../edit/edit';
import { ReportPage }                         from './../report/report';

@Component({
  selector: 'page-landing',
  templateUrl: 'landing.html',
})

export class LandingPage
{
  userId: any;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public storage: Storage,
              public geolocation: Geolocation,
              public platform: Platform,
              )
  {
    this.platform.ready().then(() =>
    {
      this.geolocation.getCurrentPosition()
    })
  }

  ionViewDidLoad() {}

  goToPage(x: number)
  {
    switch (x)
    {
      case 1: // Report
        this.navCtrl.setRoot(ReportPage);
        break

      case 2: // Edit
        this.navCtrl.setRoot(EditPage);
        break

      case 3: // Map
        this.navCtrl.push(MapPage);
        break

      case 4: // About
        this.navCtrl.push(AboutPage);
        break
    }
  }

}
