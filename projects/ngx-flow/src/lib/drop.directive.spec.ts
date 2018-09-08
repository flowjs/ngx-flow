import { DropDirective } from './drop.directive';
import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  template: `<div flowDrop [flow]="flowJs" #flowDrop="flowDrop">`
})
class TestComponent {
  flowJs: any;

  @ViewChild('flowDrop')
  flowDrop: DropDirective;
}
describe('FlowDropDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let dropAreElement: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, DropDirective]
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    dropAreElement = fixture.debugElement.query(By.css('div'));
  });

  it('should call assignDrop after setting up flow', () => {
    component.flowJs = {
      assignDrop: jasmine.createSpy(),
      unAssignDrop: jasmine.createSpy()
    };

    expect(component.flowJs.assignDrop).toHaveBeenCalledTimes(0);
    fixture.detectChanges();
    expect(component.flowJs.assignDrop).toHaveBeenCalledWith(dropAreElement.nativeElement);
  });

  it('should call assignDrop after enable/disable', () => {
    component.flowJs = {
      assignDrop: jasmine.createSpy(),
      unAssignDrop: jasmine.createSpy()
    };
    fixture.detectChanges();

    component.flowDrop.disable();
    fixture.detectChanges();
    expect(component.flowJs.unAssignDrop).toHaveBeenCalledWith(dropAreElement.nativeElement);

    component.flowDrop.enable();
    fixture.detectChanges();
    expect(component.flowJs.assignDrop).toHaveBeenCalledWith(dropAreElement.nativeElement);
  });
});

