import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinksItemComponent } from './links-item.component';

describe('LinksItemComponent', () => {
  let component: LinksItemComponent;
  let fixture: ComponentFixture<LinksItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinksItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinksItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
