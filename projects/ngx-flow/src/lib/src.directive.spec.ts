import { SrcDirective } from './src.directive';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, tick, fakeAsync, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  template: `<img [flowSrc]="transfer">`
})
class TestComponent {
  transfer: any;
}

describe('FlowSrcDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let imgElement: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, SrcDirective]
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    imgElement = fixture.debugElement.query(By.css('img'));
  });

  beforeEach(() => {
    window['__zone_symbol__FakeAsyncTestMacroTask'] = [
      {
        source: 'FileReader.onload'
      }
    ];
  });

  it('should add src attribute with image data', (done: DoneFn) => {
    const blob = new Blob(['data-data-data'], {type : 'application/json'});
    component.transfer = {
      flowFile: {
        file: blob
      }
    };
    fixture.detectChanges();

    // ToDo: find other way to test this. Problem is that element's attribute it not yet updated
    setTimeout(() => {
      expect(imgElement.nativeElement.getAttribute('src')).toBe('data:application/json;base64,ZGF0YS1kYXRhLWRhdGE=');
      done();
    }, 1000);
  });
});
