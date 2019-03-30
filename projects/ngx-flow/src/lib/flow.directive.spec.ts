import { Component, ViewChild, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { first, skip } from 'rxjs/operators';
import { FlowInjectionToken } from './flow-injection-token';
import { FlowDirective, FlowChangeEvent } from './flow.directive';
import { FileSuccess } from './flow/flow-events';
import { FlowFile } from './flow/flow-file';
import { FlowOptions } from './flow/flow-options';
import { trasnferMockFactory } from './helpers/tests/file-mock';

@Component({
  template: `<ng-container #flow="flow" [flowConfig]="config"></ng-container>`
})
class TestComponent {
  @ViewChild('flow')
  flow: FlowDirective;

  config = { target: 'http://localhost:3000/upload' };
}

class FlowMock {
  constructor(public opts: Partial<FlowOptions>) {}
  flowJsEventEmitters = {};
  addEventListener = jasmine.createSpy().and.callFake((eventName: string, cb: () => void) => {
    this.flowJsEventEmitters[eventName] = cb;
  });
  removeEventListener = jasmine.createSpy().and.callFake((eventName: string) => {
    delete this.flowJsEventEmitters[eventName];
  });
  progress() {
    return 0;
  }
}

describe('Directive: Flow integration tests', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, FlowDirective],
      providers: [
        {
          provide: FlowInjectionToken,
          useValue: FlowMock
        }
      ]
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('should initialize flowjs and export flow directive as template reference variable', () => {
    fixture.detectChanges();
    expect(component.flow instanceof FlowDirective).toBeTruthy();
    expect(component.flow.flowJs.opts.target).toBe('http://localhost:3000/upload');
  });

  it('should emit new flowjs instance when new config is provided', fakeAsync(() => {
    component.flow.transfers$
      .pipe(first())
      .subscribe(transfers => expect(transfers.flow.opts.target).toBe('http://localhost:3000/upload'));
    fixture.detectChanges();
    tick();
    component.config = { target: 'http://localhost:4000/upload' };
    fixture.detectChanges();
    component.flow.transfers$
      .pipe(first())
      .subscribe(transfers => expect(transfers.flow.opts.target).toBe('http://localhost:4000/upload'));
  }));

  it('should emit transfer when file is added', (done: DoneFn) => {
    fixture.detectChanges();
    component.flow.flowJs.files = [
      {
        name: 'file.txt',
        progress() {
          return 0;
        },
        isComplete() {
          return false;
        },
        timeRemaining() {
          return 0;
        }
      } as FlowFile
    ];
    component.flow.transfers$
      .pipe(
        skip(1), // skip initial emit with empty array
        first()
      )
      .subscribe(transfers => {
        expect(transfers.transfers.length).toBe(1);
        expect(transfers.transfers[0].name).toBe('file.txt');
        done();
      });
    (component.flow.flowJs as any).flowJsEventEmitters['filesSubmitted']();
  });

  it('should emit transfers on pause/resume', (done: DoneFn) => {
    fixture.detectChanges();
    component.flow.flowJs.files = [];
    component.flow.transfers$
      .pipe(
        skip(1), // skip initial emit with empty array
        first()
      )
      .subscribe(transfers => {
        expect(transfers.transfers.length).toBe(0);
        done();
      });

    const transferMock = trasnferMockFactory();
    component.flow.pauseFile(transferMock);
  });

  it('should trigger flowJs upload on upload', () => {
    fixture.detectChanges();
    component.flow.flowJs.upload = jasmine.createSpy();
    component.flow.upload();
    expect(component.flow.flowJs.upload).toHaveBeenCalled();
  });

  it('should trigger flowJs cancel on cancel', () => {
    fixture.detectChanges();
    component.flow.flowJs.cancel = jasmine.createSpy();
    component.flow.cancel();
    expect(component.flow.flowJs.cancel).toHaveBeenCalled();
  });

  it('should remove the file', () => {
    fixture.detectChanges();
    const fileMock = trasnferMockFactory();
    component.flow.cancelFile(fileMock);
    expect(fileMock.flowFile.cancel).toHaveBeenCalled();
  });

  it('should pause file and emit event', done => {
    fixture.detectChanges();
    const fileMock = trasnferMockFactory();
    component.flow.pauseOrResumeEvent$.pipe(first()).subscribe(() => {
      done();
    });

    component.flow.pauseFile(fileMock);
    expect(fileMock.flowFile.pause).toHaveBeenCalled();
  });

  it('should resume file and emit event', done => {
    fixture.detectChanges();
    const fileMock = trasnferMockFactory();
    component.flow.pauseOrResumeEvent$.pipe(first()).subscribe(() => {
      done();
    });

    component.flow.resumeFile(fileMock);
    expect(fileMock.flowFile.resume).toHaveBeenCalled();
  });

  it('should tell us if there is something to upload', done => {
    fixture.detectChanges();
    component.flow.flowJs.files = [
      {
        name: 'file.txt',
        progress() {
          return 0;
        },
        isComplete() {
          return false;
        },
        timeRemaining() {
          return 0;
        }
      } as FlowFile
    ];
    component.flow.somethingToUpload$
      .pipe(
        skip(1), // skip initial emit with empty array
        first()
      )
      .subscribe(somethingToUpload => {
        expect(somethingToUpload).toBeTruthy();
        done();
      });

    (component.flow.flowJs as any).flowJsEventEmitters['filesSubmitted']();
  });

  it('should tell us if there is nothing to upload after everything was uploaded', done => {
    fixture.detectChanges();
    component.flow.flowJs.files = [
      {
        name: 'file.txt',
        progress() {
          return 1;
        },
        isComplete() {
          return true;
        },
        timeRemaining() {
          return 0;
        }
      } as FlowFile
    ];
    component.flow.somethingToUpload$.pipe(first()).subscribe(somethingToUpload => {
      expect(somethingToUpload).toBeFalsy();
      done();
    });
  });

  it('should emit event when file is succesfully uploaded', done => {
    fixture.detectChanges();
    component.flow.events$
      .pipe(
        skip(1), // skip new flowjs instance event
        first()
      )
      .subscribe((event: FlowChangeEvent<'fileSuccess'>) => {
        expect(event.event[0].name).toBe('file.txt');
        expect(event.type).toBe('fileSuccess');
        done();
      });
    const fileSuccessEvent: FileSuccess = [
      {
        name: 'file.txt'
      } as FlowFile,
      '',
      null
    ];
    (component.flow.flowJs as any).flowJsEventEmitters['fileSuccess'](fileSuccessEvent);
  });
});

describe('Directive: Flow SSR tests', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, FlowDirective],
      providers: [
        {
          provide: FlowInjectionToken,
          useValue: FlowMock
        },
        {
          provide: PLATFORM_ID,
          useValue: 'server'
        }
      ]
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;

    it('should not initialize flowjs when running on the server', () => {
      fixture.detectChanges();
      expect(component.flow).toBeUndefined();
    });
  });
});
