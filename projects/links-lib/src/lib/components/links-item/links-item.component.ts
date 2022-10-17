import { EventEmitter } from '@angular/core';
import { Component, OnInit, Input, Output } from '@angular/core';
import { Link } from '../../abstracts/interfaces/link.interface';

@Component({
  selector: 'links-ui-links-item',
  templateUrl: './links-item.component.html',
  styleUrls: ['./links-item.component.scss'],
})
export class LinksItemComponent implements OnInit {
  @Input()
  link!: Link;
  //Property to confirm if the user has access to delete
  @Input() deletable!: boolean;
  @Output() onShowInfo = new EventEmitter<any>();
  @Output() onExplore = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onCopy = new EventEmitter<any>();

  defaultFavicon = '/assets/favicons/favicon.png';

  constructor() {}

  ngOnInit() {

  }

  onClick(){
    // show action sheet
  }

  onExploreFunc(ev:Event){
    this.onExplore.emit();
  }

  onDeleteFunc(ev:Event){
    ev.stopPropagation();
    this.onDelete.emit();
  }

  onCopyFunc(ev:Event){
    ev.stopPropagation();
    this.onCopy.emit();
  }
}
