import { Component, Inject, OnInit } from '@angular/core';
import { AlertController, InfiniteScrollCustomEvent, IonInfiniteScroll, IonRefresher, LoadingController, ModalController, RefresherCustomEvent, SpinnerTypes } from '@ionic/angular';
import { LinksDetailsEditorPage } from '../links-details-editor/links-details-editor.page';
import { LinksDataBrokerConfig, LinksDataBrokerServiceToken } from '../../abstracts/interfaces/links-data-broker-config.interface';
import { CRUD, RESULT, PaginatedDataManager} from 'app-base-lib';
import { LinksDataBroker } from '../../abstracts/interfaces/links-data-broker';
import { Link } from '../../abstracts/interfaces/link.interface';
import { AfterViewInit } from '@angular/core';
import { LOADER_STATE, ListDataBrokerLoadUIManager, LoaderComponent} from 'vicky-ionic-ng-lib';
import { from, Observable, Subject } from 'rxjs';
import { LinksDataBrokerEvent } from '../../abstracts/interfaces/links-data-broker-event.interface';
import { ViewChild } from '@angular/core';
import { LinksDataBrokerSearchConstraint } from '../../abstracts/interfaces/links-data-broker-search-constraint.interface';

@Component({
  selector: 'links-ui-links-page',
  templateUrl: './links.page.html',
  styleUrls: ['./links.page.scss'],
})
export class LinksPage implements OnInit {

  @ViewChild(LoaderComponent,{static:true})
  private loaderComponent!:LoaderComponent;

  public spinnerType !: SpinnerTypes;

  private config !: LinksDataBrokerConfig;

  public showAddBtn!:boolean;
  public pageTitle!:string;
  public showTitle!:boolean;

  public refreshEnabled!:boolean;
  public infiniteScrollEnabled!:boolean;

  public canDelete!: boolean;

  private listDataBrokerLoadUIManager!:ListDataBrokerLoadUIManager<Link,Link,LinksDataBrokerSearchConstraint,LinksDataBrokerEvent>;
  private paginatedDataManager!:PaginatedDataManager<Link>;

  public get links():Link[]{
    return this.paginatedDataManager.data;
  }

  constructor(@Inject(LinksDataBrokerServiceToken)
   private linksDataBroker:LinksDataBroker,
    public modalCtlr: ModalController, public alertController: AlertController) {

    this.config = this.linksDataBroker.getConfig();

    const thiz = this;
    this.listDataBrokerLoadUIManager = new class extends ListDataBrokerLoadUIManager<Link,Link,LinksDataBrokerSearchConstraint,LinksDataBrokerEvent>{
      protected getLoaderComponent(): LoaderComponent {
        return thiz.loaderComponent;
      }
      constructor(){
        super({append:true},thiz.linksDataBroker);
      }
    };

    this.paginatedDataManager = this.listDataBrokerLoadUIManager.getPaginatedDataManager();
  }
 async copy(link: Link) {
  console.log('LinksPage.copy() :',link);

   try{
    await this.linksDataBroker.copyLinkToClipboard(link);

    this.linksDataBroker.showToast({
      message: this.config.ui.pages.links.crud?.create?.messages?.failure || 'Copied',
    });
   }catch(e){
     console.log('Error:', e);

     this.linksDataBroker.showToast(
      {
        message: this.config.ui.pages.links.crud?.create?.messages?.failure || 'Oops couldn\'t copy the url to clipboard, pls try again'
    });
   }

 }
  async ngOnInit(): Promise<void> {

    this.spinnerType = this.config.ui.general.spinner.type || 'bubbles';

    this.showAddBtn = await this.linksDataBroker.canCRUD(CRUD.CREATE);

    this.canDelete = await this.linksDataBroker.canCRUD(CRUD.DELETE);

    const config = this.config;
    this.pageTitle = config.ui.pages.links.title.label;
    this.showTitle = !config.ui.pages.links.title.invisible;
  }

  explore(link: Link) {
    console.log('LinksPage.explore() :',link);
    this.linksDataBroker.onExplore(link);
  }
  async addNewLink() {

    const afterCreateSubject = new Subject<Link>();

    afterCreateSubject.subscribe({
      next:(link:Link)=>{
        this.listDataBrokerLoadUIManager.reflectDataIntoPaginatedDataManager( 'create' , link );
      }
    });

    const linksConfig = this.config.ui.pages.links;

    this.linksDataBroker.runCreateUIFlow({
      input:{
        get:async ()=>{

          return new Promise<RESULT<Link,any>>((resolve,reject)=>{

            this.modalCtlr.create({
              component: LinksDetailsEditorPage
            }).then((modal)=>{
              modal.onDidDismiss().then(async (resp)=>{

                const result = resp.data as RESULT<Link,any>;

                resolve(result);
              });
              modal.present().then();
            });
          });
        },
        messages:{
          failure: linksConfig.crud?.create?.messages?.failure || 'Oops something went wrong, pls try again'
        },
      },
      crudEvent:{
        before:{
          progress:{
            title: 'Please wait...',
            // spinner: this.config.spinner.type || 'bubbles',
            message: this.config.ui.pages.linksDetailEditor.behavior.urlInfo.progressMsg ||'Creating your link',
          },
        },
        after:{
          subject: afterCreateSubject,
          messages:{
            success:linksConfig.crud?.create?.messages?.success || 'Link meta info added successfully',
            failure: linksConfig.crud?.create?.messages?.failure || 'Oops something went wrong, pls try again',
          }
        }
      }
    });
  }


//Deleting Link
  async delete(link:Link){
    console.log('LinksPage.delete() :',link);

    await this.presentAlertConfirm();

    const linksConfig = this.config.ui.pages.links;
    const afterDeleteSubject = new Subject<Link>();

    afterDeleteSubject.subscribe({
      next:(link:Link)=>{
      },
      error:(err:any)=>{
        this.listDataBrokerLoadUIManager.reflectDataIntoPaginatedDataManager( 'create' , link );
      }
    });

    this.linksDataBroker.runDeleteUIFlow({
      data:link,
      crudEvent:{
        before:{
          callback:async ()=>{
            this.listDataBrokerLoadUIManager.reflectDataIntoPaginatedDataManager( 'delete' , link );
          }
        },
        after:{
          subject: afterDeleteSubject,
          messages:{
            failure: linksConfig.crud?.delete?.messages?.failure || 'Sorry, could not delete link'
          }
        }
      }
    });
  }

  onLoaderStateChange(s: any){
      const state = s as unknown as LOADER_STATE;
      console.log(s + ' as ' + state)
    if( state == LOADER_STATE.LOADING ){
      this.loadInitial();
    }
  }

  private async loadInitial(){
    this.listDataBrokerLoadUIManager.handleLoader(this.loaderComponent).subscribe((links:Link[])=>{
      console.log('linksDetailEditorPage.loadInitial() success :',links);
      this.reconcile(links).then();
    },(err)=>{
      console.log('linksDetailEditorPage.loadInitial() error :',err);
    });
  }

  public paginate(ev: Event): void{
    const event = ev as InfiniteScrollCustomEvent ;
    this.listDataBrokerLoadUIManager.handleInfiniteScroll( event.target as unknown as IonInfiniteScroll ).subscribe((links:Link[])=>{
      console.log('linksDetailEditorPage.paginate() success :',links);
      this.reconcile(links).then();
    },
    err => {
      console.log('linksDetailEditorPage.paginate() error :',err);
    });
  }

  // Refreshing
  refresh(ev: Event) {
    const event = ev as RefresherCustomEvent;
    console.log(ev);

    this.listDataBrokerLoadUIManager.handleSwipeRefresh( event.target as unknown as IonRefresher ).subscribe((links:Link[])=>{
      console.log('linksDetailEditorPage.refresh() success :',links);
      this.reconcile(links).then();
    },
    err => {
      console.log('linksDetailEditorPage.refresh() error :',err);
    });
  }

  /**
   * @warning the system time on which this component runs might be changed by the OS arbitrarily or by the user and that can cause
   * miscalculations. The best will be to move the reconcile logic to a time stable environment i.e. the server.
   *
   * @param links
   */
  async reconcile( links:Link[] ) {

    const reconcileIntervalSecs:number = this.config.ui.pages.links.reconciliation.intervalSecs;

    const currentTimeMillis = Date.now();

    const recentLinks:Link[] = await Promise.all( links

      // get the links that needs reconciliation
      .filter( link => link.lastReconcileTime == undefined || currentTimeMillis > link.lastReconcileTime.getTime() + ( reconcileIntervalSecs * 1000 ) )

      // map to the recent copy
      .map( link => this.linksDataBroker.getLinkByURL( link.url ) )
    );

    for(let i = 0; i < recentLinks.length ; i++ ){

      const recentLink = recentLinks[i];

      // emit update event, passing the new link object
      this.linksDataBroker.emitCRUDEvent( CRUD.UPDATE, recentLink).then((link:Link)=>{
        this.listDataBrokerLoadUIManager.reflectDataIntoPaginatedDataManager('update' , link);
      });
    }
  }

  //Alert
  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      message: 'Are you sure you want to delete this link?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          id: 'cancel-button'
        }, {
          text: 'Okay',
          id: 'confirm-button'
        }
      ]
    });

    await alert.present();
  }
}
