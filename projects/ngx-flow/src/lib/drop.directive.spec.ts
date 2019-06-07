import { DropDirective } from './drop.directive';
import { Component, DebugElement, ViewChild, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  template: `<div flowDrop [flow]="flowJs" #flowDrop="flowDrop">`
})
class TestComponent {
  flowJs: any;

  @ViewChild('flowDrop', { static: false })
  flowDrop: DropDirective;
}
describe('Directive: Drop', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let dropAreElement: DebugElement;
  let renderer: Renderer2;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, DropDirective],
      providers: [Renderer2]
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

  it('should attach drop and dragover listeners to body', () => {
    renderer = fixture.componentRef.injector.get(Renderer2);
    spyOn(renderer, 'listen').and.callThrough();
    fixture.detectChanges();
    // cannot use toHaveBeenCalledWith: https://github.com/jasmine/jasmine/issues/228
    expect((renderer.listen as any).calls.allArgs()).toEqual([
      ['body', 'drop', jasmine.any(Function)],
      ['body', 'dragover', jasmine.any(Function)]
    ]);
  });
});
