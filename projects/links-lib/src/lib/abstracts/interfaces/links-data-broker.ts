import { ListDataBroker,UIDataBroker } from "app-base-lib";
import { LinksDataBrokerEvent } from './links-data-broker-event.interface';
import { Link } from './link.interface';
import { LinksDataBrokerConfig } from "./links-data-broker-config.interface";
import { DISPLAY_TOAST_OPTIONS } from '../types/common';
import { LinksDataBrokerSearchConstraint } from "./links-data-broker-search-constraint.interface";

//
export interface LinksDataBroker extends ListDataBroker<Link,Link,LinksDataBrokerSearchConstraint,LinksDataBrokerEvent> , UIDataBroker<Link,Link,LinksDataBrokerSearchConstraint, LinksDataBrokerEvent> {

  getConfig(): LinksDataBrokerConfig;

  getLinkByURL( url:string ): Promise<Link> ;

  onExplore( link:Link ) : Promise<void>;

  showLinkInfo(link:Link):Promise<void>;

  copyLinkToClipboard(link: Link) :Promise<void>;
}

