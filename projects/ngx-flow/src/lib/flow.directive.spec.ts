import { FlowDirective } from './flow.directive';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FlowInjectionToken } from './flow-injection-token';
import { FlowOptions } from './flow/flow-options';
import { first, skip } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { FlowFile } from './flow/flow-file';
import { FileSuccess } from './flow/flow-events';

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
  flowJsEventEmitters: any;
  addEventListener = jasmine.createSpy().and.callFake((eventName: string, cb: () => void) => {
    this.flowJsEventEmitters[eventName] = cb;
  });
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
    fixture.detectChanges();
    component.flow.flow$.pipe(first()).subscribe(flow => expect(flow.opts.target).toBe('http://localhost:3000/upload'));
    tick();
    component.config = { target: 'http://localhost:4000/upload' };
    fixture.detectChanges();
    component.flow.flow$.pipe(first()).subscribe(flow => expect(flow.opts.target).toBe('http://localhost:4000/upload'));
  }));

  it('should emit transfer when file is added', (done: DoneFn) => {
    const flowJsEventEmitter = new Subject<void>();
    spyOn(component.flow, 'flowEvents').and.returnValue(flowJsEventEmitter);
    fixture.detectChanges();
    component.flow.flowJs.progress = jasmine.createSpy('progress').and.returnValue(0);
    component.flow.flowJs.files = [{
      name: 'file.txt',
      progress() { return 0; },
      isComplete() { return false; },
      timeRemaining() { return 0; }
    } as FlowFile];
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

    flowJsEventEmitter.next();
  });

  it('should emit transfers on pause/resume', (done: DoneFn) => {
    const pauseOrResume$ = new Subject<void>();
    spyOn(component.flow, 'flowEvents').and.returnValue([]);
    spyOn(component.flow, 'ngxFlowEvents').and.returnValue(pauseOrResume$);
    fixture.detectChanges();
    component.flow.flowJs.files = [];
    component.flow.flowJs.progress = jasmine.createSpy('progress').and.returnValue(0);
    component.flow.transfers$
      .pipe(
        skip(1), // skip initial emit with empty array
        first()
      )
      .subscribe(transfers => {
        expect(transfers.transfers.length).toBe(0);
        done();
      });

    pauseOrResume$.next();
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
    const fileMock = {
      flowFile: {
        cancel: jasmine.createSpy()
      }
    };
    component.flow.cancelFile(fileMock as any);
    expect(fileMock.flowFile.cancel).toHaveBeenCalled();
  });

  it('should pause file and emit event', (done) => {
    fixture.detectChanges();
    const fileMock = {
      flowFile: {
        pause: jasmine.createSpy()
      }
    };
    component.flow.pauseOrResumeEvent$.pipe(first()).subscribe(() => {
      done();
    });

    component.flow.pauseFile(fileMock as any);
    expect(fileMock.flowFile.pause).toHaveBeenCalled();
  });

  it('should resume file and emit event', (done) => {
    fixture.detectChanges();
    const fileMock = {
      flowFile: {
        resume: jasmine.createSpy()
      }
    };
    component.flow.pauseOrResumeEvent$.pipe(first()).subscribe(() => {
      done();
    });

    component.flow.resumeFile(fileMock as any);
    expect(fileMock.flowFile.resume).toHaveBeenCalled();
  });

  it('should tell us if there is something to upload', (done) => {
    const flowJsEventEmitter = new Subject<void>();
    spyOn(component.flow, 'flowEvents').and.returnValue(flowJsEventEmitter);
    fixture.detectChanges();
    component.flow.flowJs.progress = jasmine.createSpy('progress').and.returnValue(0);
    component.flow.flowJs.files = [{
      name: 'file.txt',
      progress() { return 0; },
      isComplete() { return false; },
      timeRemaining() { return 0; }
    } as FlowFile];
    component.flow.somethingToUpload$
      .pipe(
        skip(1), // skip initial emit with empty array
        first()
      )
      .subscribe(somethingToUpload => {
        expect(somethingToUpload).toBeTruthy();
        done();
      });

    flowJsEventEmitter.next();
  });

  it('should tell us if there is nothing to upload', (done) => {
    const flowJsEventEmitter = new Subject<void>();
    spyOn(component.flow, 'flowEvents').and.returnValue(flowJsEventEmitter);
    fixture.detectChanges();
    component.flow.flowJs.progress = jasmine.createSpy('progress').and.returnValue(0);
    component.flow.flowJs.files = [{
      name: 'file.txt',
      progress() { return 1; },
      isComplete() { return true; },
      timeRemaining() { return 0; }
    } as FlowFile];
    component.flow.somethingToUpload$
      .pipe(
        skip(1), // skip initial emit with empty array
        first()
      )
      .subscribe(somethingToUpload => {
        expect(somethingToUpload).toBeFalsy();
        done();
      });

    flowJsEventEmitter.next();
  });


  it('should emit events', (done) => {
    const flowJsEventEmitter = new Subject<FileSuccess>();
    spyOn(component.flow, 'flowEvents').and.returnValue(flowJsEventEmitter);
    fixture.detectChanges();
    component.flow.events$
      .pipe(
        first()
      )
      .subscribe(event => {
        expect(event[0].name).toBe('file.txt');
        expect(event[1]).toBe('fileSuccess');
        done();
      });

    flowJsEventEmitter.next([{name: 'file.txt'} as any, 'fileSuccess', null]);
  });
});
