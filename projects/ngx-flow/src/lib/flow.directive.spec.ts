import { Component, PLATFORM_ID, ViewChild } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { first, skip } from 'rxjs/operators';
import type {
  FlowChangeEvent,
  FlowEventName,
  FlowOptions,
} from './flow-js';
import { FlowInjectionToken } from './flow-injection-token';
import { FlowConfig, NgxFlowEvent } from './flow.directive';
import { flowFileMockFactory } from './helpers/tests/flow-file-mock-factory';
import { FlowMock } from './helpers/tests/flow-mock';
import { trasnferMockFactory } from './helpers/tests/transfer-mock-factory';

@Component({
  template: `<ng-container #flow="flow" [flowConfig]="config"></ng-container>`,
  imports: [FlowConfig],
})
class TestComponent {
  @ViewChild('flow', { static: true })
  flow!: FlowConfig;

  config: FlowOptions = { target: 'http://localhost:3000/upload' };
}

describe('Flow', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        {
          provide: FlowInjectionToken,
          useValue: FlowMock,
        },
      ],
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('should initialize flowjs and export flow directive as template reference variable', () => {
    fixture.detectChanges();
    expect(component.flow instanceof FlowConfig).toBeTruthy();
    expect(component.flow.flowJs).toBeDefined();
    expect(component.flow.flowJs.opts.target).toBe(
      'http://localhost:3000/upload'
    );
  });

  it('should pass v3 options and hooks to the flow constructor', () => {
    const hooks = {
      filesSubmitted: jasmine.createSpy('filesSubmitted'),
    };

    component.config = {
      target: 'http://localhost:3000/upload',
      hooks,
    };
    fixture.detectChanges();

    expect(component.flow.flowJs.opts.hooks).toBe(hooks);
  });

  it('should emit new flowjs instance when new config is provided', fakeAsync(() => {
    component.flow.transfers$
      .pipe(first())
      .subscribe((transfers) =>
        expect(transfers.flow.opts.target).toBe(
          'http://localhost:3000/upload'
        )
      );
    fixture.detectChanges();
    tick();
    component.config = { target: 'http://localhost:4000/upload' };
    fixture.detectChanges();
    component.flow.transfers$
      .pipe(first())
      .subscribe((transfers) =>
        expect(transfers.flow.opts.target).toBe(
          'http://localhost:4000/upload'
        )
      );
  }));

  it('should listen to v3 kebab-case events', () => {
    fixture.detectChanges();
    const subscription = component.flow.events$.subscribe();
    const flowMock = component.flow.flowJs as unknown as FlowMock;

    expect(Object.keys(flowMock.flowJsEventEmitters)).toEqual(
      jasmine.arrayContaining([
        'upload-start',
        'upload-resume',
        'file-progress',
        'progress',
        'file-success',
        'file-error',
        'error',
        'file-retry',
        'file-removed',
        'complete',
      ])
    );
    expect(Object.keys(flowMock.flowJsEventEmitters)).not.toContain(
      'fileSuccess'
    );
    subscription.unsubscribe();
  });

  it('should emit transfer when file is added', (done: DoneFn) => {
    fixture.detectChanges();
    const flowMock = component.flow.flowJs as unknown as FlowMock;
    flowMock.files = [flowFileMockFactory('file.txt')];
    component.flow.transfers$
      .pipe(
        skip(1), // skip initial emit with empty array
        first()
      )
      .subscribe((transfers) => {
        expect(transfers.transfers.length).toBe(1);
        expect(transfers.transfers[0].name).toBe('file.txt');
        done();
      });

    flowMock.emit('file-progress', {
      file: flowMock.files[0],
      chunk: flowMock.files[0].chunks[0],
      progress: 0,
    });
  });

  it('should emit transfers on pause/resume', (done: DoneFn) => {
    fixture.detectChanges();
    component.flow.flowJs.files = [];
    component.flow.transfers$
      .pipe(
        skip(1), // skip initial emit with empty array
        first()
      )
      .subscribe((transfers) => {
        expect(transfers.transfers.length).toBe(0);
        done();
      });

    const transferMock = trasnferMockFactory('file.txt');
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
    const fileMock = trasnferMockFactory('file.txt');
    component.flow.cancelFile(fileMock);
    expect(fileMock.flowFile.cancel).toHaveBeenCalled();
  });

  it('should pause file and emit event', async () => {
    fixture.detectChanges();
    const fileMock = trasnferMockFactory('file.txt');
    const eventEmitted = new Promise<void>((resolve) => {
      component.flow.pauseOrResumeEvent$.pipe(first()).subscribe(() => {
        resolve();
      });
    });

    await component.flow.pauseFile(fileMock);
    await eventEmitted;
    expect(fileMock.flowFile.pause).toHaveBeenCalled();
  });

  it('should resume file and emit event', (done) => {
    fixture.detectChanges();
    const fileMock = trasnferMockFactory('file.txt');
    component.flow.pauseOrResumeEvent$.pipe(first()).subscribe(() => {
      done();
    });

    component.flow.resumeFile(fileMock);
    expect(fileMock.flowFile.resume).toHaveBeenCalled();
  });

  it('should tell us if there is something to upload', (done) => {
    fixture.detectChanges();
    const flowMock = component.flow.flowJs as unknown as FlowMock;
    flowMock.files = [
      flowFileMockFactory('file.txt', {
        isSuccessful() {
          return false;
        },
      }),
    ];
    component.flow.somethingToUpload$
      .pipe(
        skip(1), // skip initial emit with empty array
        first()
      )
      .subscribe((somethingToUpload) => {
        expect(somethingToUpload).toBeTruthy();
        done();
      });

    flowMock.emit('file-progress', {
      file: flowMock.files[0],
      chunk: flowMock.files[0].chunks[0],
      progress: 0,
    });
  });

  it('should tell us if there is nothing to upload after everything was uploaded', (done) => {
    fixture.detectChanges();
    component.flow.flowJs.files = [
      flowFileMockFactory('file.txt', {
        isSuccessful() {
          return true;
        },
      }),
    ];
    component.flow.somethingToUpload$.pipe(first()).subscribe((somethingToUpload) => {
      expect(somethingToUpload).toBeFalsy();
      done();
    });
  });

  it('should emit event detail object when file is successfully uploaded', (done) => {
    fixture.detectChanges();
    function isFileSuccessEvent(
      event: FlowChangeEvent<FlowEventName> | NgxFlowEvent
    ): event is FlowChangeEvent<'file-success'> {
      return event.type === 'file-success';
    }

    component.flow.events$.subscribe((event) => {
      if (!isFileSuccessEvent(event)) {
        return;
      }
      expect(event.type).toBe('file-success');
      expect(event.detail.file.name).toBe('file.txt');
      expect(event.event.detail.file.name).toBe('file.txt');
      done();
    });

    const file = flowFileMockFactory('file.txt');
    (component.flow.flowJs as unknown as FlowMock).emit('file-success', {
      file,
      message: '',
      chunk: file.chunks[0],
    });
  });
});

describe('Flow (SSR)', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent, FlowConfig],
      providers: [
        {
          provide: FlowInjectionToken,
          useValue: FlowMock,
        },
        {
          provide: PLATFORM_ID,
          useValue: 'server',
        },
      ],
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('should not initialize flowjs when running on the server', () => {
    fixture.detectChanges();
    expect(component.flow.flowJs).toBeUndefined();
  });
});
