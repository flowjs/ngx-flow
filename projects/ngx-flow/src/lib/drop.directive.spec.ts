import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FlowDrop } from './drop.directive';

@Component({
  template: `<div flowDrop [flow]="flowJs" #flowDrop="flowDrop"></div>`,
  imports: [FlowDrop]
})
class TestComponent {
  flowJs?: Partial<flowjs.Flow>;

  @ViewChild('flowDrop', { static: false })
  flowDrop!: FlowDrop;
}

describe('FlowDrop', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let dropAreElement: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    dropAreElement = fixture.debugElement.query(By.css('div'));
  });

  it('should call assignDrop after setting up flow', () => {
    component.flowJs = {
      assignDrop: jasmine.createSpy(),
      unAssignDrop: jasmine.createSpy(),
    };

    expect(component.flowJs.assignDrop).toHaveBeenCalledTimes(0);
    fixture.detectChanges();
    expect(component.flowJs.assignDrop).toHaveBeenCalledWith(
      dropAreElement.nativeElement
    );
  });

  it('should call assignDrop after enable/disable', () => {
    component.flowJs = {
      assignDrop: jasmine.createSpy(),
      unAssignDrop: jasmine.createSpy(),
    };
    fixture.detectChanges();

    component.flowDrop.disable();
    fixture.detectChanges();
    expect(component.flowJs.unAssignDrop).toHaveBeenCalledWith(
      dropAreElement.nativeElement
    );

    component.flowDrop.enable();
    fixture.detectChanges();
    expect(component.flowJs.assignDrop).toHaveBeenCalledWith(
      dropAreElement.nativeElement
    );
  });

  it('should prevent default behavior on drop and dragover events', () => {
    component.flowJs = {
      assignDrop: jasmine.createSpy(),
      unAssignDrop: jasmine.createSpy(),
    };
    fixture.detectChanges();

    const dropEvent = new DragEvent('drop', { cancelable: true });
    const dragoverEvent = new DragEvent('dragover', { cancelable: true });

    spyOn(dropEvent, 'preventDefault');
    spyOn(dragoverEvent, 'preventDefault');

    dropAreElement.nativeElement.dispatchEvent(dropEvent);
    dropAreElement.nativeElement.dispatchEvent(dragoverEvent);
    fixture.detectChanges();

    expect(dropEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(dragoverEvent.preventDefault).toHaveBeenCalledTimes(1);
  });
});
