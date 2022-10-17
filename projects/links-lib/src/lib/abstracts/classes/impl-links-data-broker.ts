import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ImplUIListDataBroker,PROGRESS_DIALOG_OPTIONS,TOAST_OPTIONS } from "app-base-lib";
import {IonListDataBroker} from "vicky-ionic-ng-lib";
import { Link } from "../interfaces/link.interface";
import { LinksDataBroker } from "../interfaces/links-data-broker";
import { LinksDataBrokerConfig, URL_META_RAPID_API_CONFIG } from '../interfaces/links-data-broker-config.interface';
import { LinksDataBrokerEvent } from "../interfaces/links-data-broker-event.interface";
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { LoadingController, ToastController, Platform } from '@ionic/angular';
import { map } from "rxjs/operators";
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { LinksDataBrokerSearchConstraint } from "../interfaces/links-data-broker-search-constraint.interface";

export abstract class ImplLinksDataBroker extends IonListDataBroker<Link, Link,LinksDataBrokerSearchConstraint, LinksDataBrokerEvent> implements LinksDataBroker {

  //Cors
  private proxyUrl = 'https://cors-anywhere.herokuapp.com/';

  constructor(private platform: Platform, private clipboard: Clipboard, private http:HttpClient , private iab: InAppBrowser,toastCtrl: ToastController,
    loadingCtrl: LoadingController ,paginationOptions: {
    perPage: number;
    append?: boolean;
  }, fetchOneResultAsLatest: boolean=true){
    super(toastCtrl,loadingCtrl,paginationOptions,'id',fetchOneResultAsLatest);
  }

/**
 * This method is called to get a link meta information from Rapid-Api or Apilayer
 * @param url is the link address that that needs to be fetched
 * @returns checks the API Provider that was selected and calls the right function
 */
  async getLinkByURL(url: string): Promise<Link>{
    const preferredService = (this.getConfig()).thirdParty.api.urlMeta.service;
    return preferredService == 'rapid-api' ? this.getLinkInfoFromRapidApi(url) :
    this.getLinkInfoFromApiLayer(url);
  }


  //This method is called if the preffered service is Rapid-Api
  private getLinkInfoFromRapidApi( url:string ) : Promise<Link> {

    if(!/^[a-z0-9]+:\/\//.test(url)){
      url = `http://${url}`;
    }

    const config = this.getConfig();

    const rapidApiHttpOptions: any = {
      headers: new HttpHeaders({
        'X-RapidAPI-Host': (config.thirdParty.api.urlMeta as URL_META_RAPID_API_CONFIG).apiHost ,
        'X-RapidAPI-Key': config.thirdParty.api.urlMeta.key,
        'Access-Control-Allow-Origin': '*'
    })
  }

    const apiUrl = config.thirdParty.api.urlMeta.url || '';
    return this.http.get(`${this.proxyUrl}${apiUrl}?url=${url}`, rapidApiHttpOptions).pipe(map((result:any)=>{

      let faviconUrl = result.link?.icon as string;

      if(faviconUrl && !/^[a-z0-9]+:\/\//.test(faviconUrl)){
        faviconUrl = faviconUrl.trim();
        const Url = new URL(url);
        const urlPrefix = `${Url.protocol}//${Url.host}`;
        faviconUrl = `${urlPrefix}/${( faviconUrl.startsWith('/') ? faviconUrl.slice(1) : faviconUrl )}`;
      }

      const link:Link = {
        id: null!,
        url,
        title:result.title,
        description: '',
        favicon:{
          url:faviconUrl
        },
        lastReconcileTime:null!
      };

      return link;
    })).toPromise() as Promise<Link>
  }

 //This method is called if the preffered service is Rapid-Api
  private getLinkInfoFromApiLayer( url:string ) : Promise<Link> {

    const config =  this.getConfig();

    const apiLayerHttpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'X-Requested-With': 'XMLHttpRequest',
        'method': 'GET',
        'redirect': 'follow',
        'apikey':config.thirdParty.api.urlMeta.key,

      })
    }

    const apiUrl = config.thirdParty.api.urlMeta.url||'';
    return this.http.get(`${this.proxyUrl}${apiUrl}?url=${url}`, apiLayerHttpOptions).pipe(map((result:any)=>{

      const link: Link = {
        id:null!,
        url,
        title: result.title,
        description: '',
        favicon: {
          url:result.favicon
        },
        lastReconcileTime:null!
      };

      return link;
    })).toPromise() as Promise<Link>;
  }

  /**
   *
   * @param link is the url the user wants to see, when the a url is clicked, this method is called and the link open in apply or via the system browser
   */
  async onExplore(link: Link): Promise<void> {
    const target = ( this.getConfig()).ui.general.broswer?.target;
    const browser = this.iab.create(link.url, target == 'system' ? '_system' : '_blank', {location: 'no'});

    browser.on('loadstart').subscribe(event => {});
    browser.on('exit').subscribe(event => {
      browser.close();
    });
  }

  async showLinkInfo(link:Link){
    const title = 'Link Info';

    // this.alertCtrl.show({
    //   title,
    //   message:link.description,
    // });
  }

  abstract override getConfig():LinksDataBrokerConfig;

  copyLinkToClipboard(link: Link) {
    if (this.platform.is('hybrid')) {
      return this.clipboard.copy(link.url);
    }
    return navigator.clipboard.writeText(link.url);
  }
}
