import { EventEmitter, Inject, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Link } from '../../abstracts/interfaces/link.interface';


@Component({
  selector: 'links-ui-list',
  templateUrl: './links-list.component.html',
  styleUrls: ['./links-list.component.scss']
})
export class LinksListComponent implements OnInit {
  //Property to confirm if the user has access to delete
  @Input()
  deletable!:boolean;

  @Input()
  links!: Link[];

  @Output() onExplore = new EventEmitter<Link>();
  @Output() onDelete = new EventEmitter<Link>();
  @Output() onCopy = new EventEmitter<Link>();
  @Output() onShowInfo = new EventEmitter<Link>();


  constructor() { }

  ngOnInit() {
  }

  onShowInfoFunc(link:Link){
    this.onShowInfo.emit(link);
  }

  onExploreFunc(link: Link) {
    this.onExplore.emit(link);
  }

  onDeleteFunc(link:Link){
    this.onDelete.emit(link);
  }

  onCopyFunc(link:Link){
    this.onCopy.emit(link);
  }


}
