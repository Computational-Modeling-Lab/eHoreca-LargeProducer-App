import { Injectable } from '@angular/core';

/*
  Generated class for the ConstantsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ConstantsProvider
{
  url: string = "https://ehoreca.cmodlab-iu.edu.gr/api";

  public getUrl()
  {
    return this.url;
  }
}
