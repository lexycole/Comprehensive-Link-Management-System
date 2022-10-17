import { Input} from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { RESULT } from 'app-base-lib';
import { Link } from '../../abstracts/interfaces/link.interface';
import { LinksDataBrokerConfig, LinksDataBrokerServiceToken } from '../../abstracts/interfaces/links-data-broker-config.interface';
import { LinksDataBroker } from '../../abstracts/interfaces/links-data-broker';
import { Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { PAGE_SECTION_POSITION } from 'vicky-ionic-ng-lib';

@Component({
  selector: 'links-ui-links-details-editor',
  templateUrl: './links-details-editor.page.html',
  styleUrls: ['./links-details-editor.page.scss'],
})
export class LinksDetailsEditorPage implements OnInit {

  /**
   *  Accessing the configuration of the library
   */
  private config!: LinksDataBrokerConfig;

  /**
   * Properties decorated with @Input are to be passed by the users detailed documentation can be find in the @config file
   */

  // btnPosition property sets where the main button would be placed
  @Input() btnPosition!: PAGE_SECTION_POSITION;
  @Input() nextBtnText!: string;
  @Input() backBtnText!: string;
  @Input() confirmBtnText!: string;
  @Input() pageTitle!: string;
  @Input() showTitle!: boolean;
  @Input() validationMsg1!: string;
  @Input() validationMsg2!: string;

  linkForm!: FormGroup;
  result!:Link;

  stage:0|1 = 0;

// getting the availble position for the button. It can either be in the footer or the main page
  position = PAGE_SECTION_POSITION

  /**
   *A default favicon shown if the API doesn't return a link's favicon
   */
  defaultFavicon = "/assets/favicons/favicon.png";

  constructor(@Inject(LinksDataBrokerServiceToken) private linksDataBroker:LinksDataBroker,public modalCtlr: ModalController,
  private loadingCtrl: LoadingController,
  private formBuilder: FormBuilder) {
  }

   ngOnInit() {
     //getting the config on page load
     this.config = this.linksDataBroker.getConfig();

    /**
     * The following properties would used the fallbacks if they are not set
     */
    this.pageTitle = this.config.ui.pages.linksDetailEditor.title.label;
    this.nextBtnText = this.config.ui.pages.linksDetailEditor.buttons.main.nextLabel || 'next';
    this.backBtnText = this.config.ui.pages.linksDetailEditor.buttons.main.backLabel || 'back';
    this.confirmBtnText = this.config.ui.pages.linksDetailEditor.buttons.main.confirmLabel || 'confirm';
    this.showTitle = !this.config.ui.pages.linksDetailEditor.title.invisible;

    this.btnPosition = this.config.ui.general.buttons?.core.sectionPosition || this.position.IN_CONTENT ;
    this.validationMsg1 = this.config.ui.pages.linksDetailEditor.behavior.urlInfo.requiredValidationMsg || 'Field cannot be empty, please enter url';
    this.validationMsg2 = this.config.ui.pages.linksDetailEditor.behavior.urlInfo.patternValidationMsg || 'Invalid URL format! Pls enter a valid url';


    this.linkForm = this.formBuilder.group({
      //Validating if url format is valid
      url: ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]]});

  }
  get msg(){
    return this.linkForm.controls;
  }

  //This method performs a progress action when a user add a new url
  async next(){

    const linksConfig = this.config.ui.pages.links;

    /**
     * The url is stored in a vaiable and would be passed a parameter when a request is made to the API
     */
    const url = this.linkForm.value.url;

    if(!url) return;

    const loading = await this.loadingCtrl.create({
      message: 'Loading url Info..',
      spinner: 'bubbles',
    });

    // Progress loader is shown while result is being fetched
    await loading.present();

    this.linksDataBroker.getLinkByURL( url ).then(async (link)=>{

      // progress loader is hidden when a response is returned
      await loading.dismiss();

      // The state is changed to track the progress of the user
      this.stage = 1;

      // update UI
      this.result = link;
    }).catch( async ()=>{
      // The progress loader is hidden when there is an error
      await loading.dismiss();
      // The error message is shown via a toast
      this.linksDataBroker.showToast({
          message: linksConfig.crud?.create?.messages?.failure || 'Oops couldn\'t fetch the url info, pls try again'
      });
    }).then();
    };



  //This method is called when the user need to go back after entering a url
  async back(){
    this.stage = 0;
    this.result = null!;
  }

  // This method is called when a user affirm that the info returned is correct
  async confirm(){
    if(this.stage == 1 ){

      const link:Link = this.result;

      if(link){
        await this.modalCtlr.dismiss({
          reason:'success',
          data:link,
        } as RESULT<Link,any>);
      }
    }
  }

  // Method to close the links editor
  async close(){
    await this.modalCtlr.dismiss({
      reason:'close'
    } as RESULT<Link,any>);
  }
}
