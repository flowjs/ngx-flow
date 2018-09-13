# NgxFlow

[![Build Status](https://travis-ci.com/MartinNuc/ng2-flow.svg?branch=master)](https://travis-ci.com/MartinNuc/ng2-flow)
[![Test Coverage](https://api.codeclimate.com/v1/badges/10258aa83c7c603456d7/test_coverage)](https://codeclimate.com/github/MartinNuc/ng2-flow/test_coverage)

The purpose of this package is to create a wrapper for Angular for fileupload using [flow.js](https://github.com/flowjs/flow.js).

## Roadmap

- ✅ upload single file
- ✅ upload multiple files
- ✅ queue management
- ✅ error handling
- ✅ pause / resume upload
- ✅ cancel upload, cancel all uploads
- ✅ upload progress
- ✅ file / directory restrictions
- ✅ drag & drop
- ✅ display uploaded image
- ✅ tests
- ✅ upload right after selecting file
- ✅ run tests using TravisCI
- ⏱ demo using Stackblitz

## Install

`npm install @flowjs/flow.js ngx-flow`

Import in your module:

```typescript
import { NgxFlowModule } from 'ngx-flow';

@NgModule({
  imports: [ NgxFlowModule ]
})
export class AppModule
```

## How to use

1. Start up server. There is a server example taken from [flow.js](https://github.com/flowjs/flow.js) here in `server` directory. In this repo you can run it using `npm run server`.

1. First you need to initialize ngx-flow directive and export it as for example `flow` variable:

   ```html
   <ng-container #flow="flow" [flowConfig]="{target: 'http://localhost:3000/upload'}"></ng-container>
   ```

1. Now you can use either directive `flowButton` for select file dialog:

   ```html
   <input type="file"
         flowButton
         [flow]="flow.flowJs"
         [flowAttributes]="{accept: 'image/*'}">
   ```

   Or `flowDrop` for drag&drop feature:

   ```html
   <div class="drop-area"
       flowDrop
       [flow]="flow.flowJs">
   </div>
   ```

   For both you have to pass `[flow]=flow.flowJs` where `flow` is template variable exported in step 1.

1. You can than subscribe to observable of transfers:

   ```html
   <div *ngFor="let transfer of (flow.transfers$ | async).transfers">
   ```

1. After adding files you can begin upload using `upload()` method:

   ```html
   <button type="button" (click)="flow.upload()" [disabled]="!(flow.somethingToUpload$ | async)">Start upload</button>
   ```

### How does `transfers$` data look like?

Observable `flow.transfers$` emits state in form:

```typescript
{
  totalProgress: 0.5,
  transfers: [
    {
      name: "somefile.txt",
      flowFile: FlowFile,
      progress: number,
      error: boolean,
      paused: boolean,
      success: boolean,
      complete: boolean,
      currentSpeed: number,
      averageSpeed: number,
      size: number,
      timeRemaining: number,
    },
    {
      name: "uploading.txt",
      flowFile: FlowFile,
      progress: 0.5,
      error: false,
      paused: false,
      success: false,
      complete: false,
      currentSpeed: number,
      averageSpeed: number,
      size: number,
      timeRemaining: number,
    },
    {
      name: "failed-to-upload.txt",
      flowFile: FlowFile,
      progress: number,
      error: true,
      paused: false,
      success: false,
      complete: true,
      currentSpeed: number,
      averageSpeed: number,
      size: number,
      timeRemaining: number,
    }
    {
      name: "uploaded.txt",
      flowFile: FlowFile,
      progress: number,
      error: false,
      paused: false,
      success: true,
      complete: true,
      currentSpeed: number,
      averageSpeed: number,
      size: number,
      timeRemaining: number,
    }
  ],
  flow: { /* flow.js instance*/ }
}
```

## FAQ

### I need access to flow.js object

You can find it under `flow` variable.

```html
<p>Is flowjs supported by the browser? {{flow.flowJs?.support}}</p>
```

### I see flickering when upload is in progress

Use `trackBy` for `ngFor`:

```html
<div *ngFor="let transfer of (flow.transfers$ | async).transfers; trackBy: trackTransfer">
```

```typescript
export class AppComponent {
  trackTransfer(transfer: Transfer) {
    return transfer.id;
  }
}
```

### I need just a single file

Add `singleFile: true` to your flow config:

```html
<ng-container #flow="flow" [flowConfig]="{target: 'http://localhost:3000/upload', singleFile: true}"></ng-container>
```

### I want to upload whole directory

Add `flowDirectoryOnly="true"` to your button:

```html
<input type="file"
       flowButton
       [flow]="flow.flowJs"
       flowDirectoryOnly="true"
       [flowAttributes]="{accept: 'image/*'}">
```

### I want to display image which is going to be uploaded

Use directive `flowSrc`:

```html
<div *ngFor="let transfer of (flow.transfers$ | async).transfers">
  <img [flowSrc]="transfer">
</div>
```

### How to trigger upload right after picking the file?

Subscribe to `events$`. NgxFlow listens for these events: `filesSubmitted`, `fileRemoved`, `fileRetry`, `fileProgress`, `fileSuccess`, `fileError` of flow.js. Event `fileSubmitted` is fired when user drops or selects a file.

```typescript
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('flow')
  flow: FlowDirective;

  autoUploadSubscription: Subscription;

  ngAfterViewInit() {
    this.autoUploadSubscription = this.flow.events$.subscribe(event => {
      if (event.type === 'filesSubmitted') {
        this.flow.upload();
      }
    });
  }

  ngOnDestroy() {
    this.autoUploadSubscription.unsubscribe();
  }
}
```
