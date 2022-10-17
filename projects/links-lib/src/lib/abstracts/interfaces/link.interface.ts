import {ID} from "app-base-lib";
//Library Interface
export interface  Link  {
  id:ID,
  favicon: {
    url:string,
  },
  url: string,
  title: string,
  description:string,
  lastReconcileTime: Date
};
