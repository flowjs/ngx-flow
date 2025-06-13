import { Component, DebugElement, Renderer2, ViewChild } from '@angular/core';
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
  let renderer: Renderer2;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [Renderer2],
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

  it('should attach drop and dragover listeners to body', () => {
    renderer = fixture.componentRef.injector.get(Renderer2);
    const listenSpy = spyOn(renderer, 'listen').and.callThrough();
    fixture.detectChanges();

    // cannot use toHaveBeenCalledWith: https://github.com/jasmine/jasmine/issues/228
    expect(listenSpy.calls.allArgs()).toEqual([
      ['body', 'drop', jasmine.any(Function)],
      ['body', 'dragover', jasmine.any(Function)],
    ]);
  });
});
