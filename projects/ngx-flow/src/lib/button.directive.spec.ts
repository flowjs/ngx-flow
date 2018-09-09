import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonDirective } from './button.directive';

@Component({
  template: `<input type="file"
                    flowButton
                    [flow]="flowJs"
                    [flowAttributes]="flowAttributes">`
})
class TestComponent {
  flowJs: any;
  flowAttributes: any;
}

describe('Directive: Button', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let inputElement: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, ButtonDirective]
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    inputElement = fixture.debugElement.query(By.css('input[type=file]'));
  });

  it('should call assignBrowse when flow config changes', () => {
    component.flowJs = {
      opts: {
        singleFile: true
      },
      assignBrowse: jasmine.createSpy()
    };

    fixture.detectChanges();
    expect(component.flowJs.assignBrowse).toHaveBeenCalledWith(inputElement.nativeElement, false, true, undefined);

    component.flowAttributes = {
      accept: 'images/*'
    };
    fixture.detectChanges();
    expect(component.flowJs.assignBrowse).toHaveBeenCalledWith(inputElement.nativeElement, false, true, {
      accept: 'images/*'
    });
  });
});
