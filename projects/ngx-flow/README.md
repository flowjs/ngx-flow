# NgxFlow

The purpose of this package is to create a wrapper for Angular for fileupload using [flow.js](https://github.com/flowjs/flow.js).

This version targets the flow.js v3 API: native `EventTarget` events, explicit `hooks`, completion-oriented `upload()`, and pass-through support for streaming and integrity options.

[![Build Status](https://travis-ci.com/flowjs/ngx-flow.svg?branch=master)](https://travis-ci.com/flowjs/ngx-flow)
[![Test Coverage](https://api.codeclimate.com/v1/badges/29153dcefffff1fe5a5c/test_coverage)](https://codeclimate.com/github/flowjs/ngx-flow/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/29153dcefffff1fe5a5c/maintainability)](https://codeclimate.com/github/flowjs/ngx-flow/maintainability)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)


## Demo

[https://stackblitz.com/edit/ngx-flow-example](https://stackblitz.com/edit/ngx-flow-example)

You can also find example source code in the `src` folder.

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
- ✅ demo using Stackblitz
- ✅ support for server side rendering

## Install

`npm install @flowjs/flow.js@^3.0.0-alpha.1 @flowjs/ngx-flow`

> flow.js v3 is not published yet. Until it is, link or install a local v3 build
> when running the demo. The ngx-flow library itself has no runtime dependency on
> flow.js; the constructor is provided through `FlowInjectionToken`.

Import in your module:

```typescript
import { NgxFlowModule, FlowInjectionToken } from '@flowjs/ngx-flow';
import Flow from '@flowjs/flow.js';

@NgModule({
  imports: [NgxFlowModule],
  providers: [
    {
      provide: FlowInjectionToken,
      useValue: Flow
    }
  ]
})
export class AppModule
```

We use dependecy injection to provide flow.js library. Provide the flow.js v3 default export for `FlowInjectionToken`.

## How to use

1. Start up server. There is a server example taken from [flow.js](https://github.com/flowjs/flow.js) here in `server` directory. In this repo you can run it using `npm run server`.

1. First you need to initialize ngx-flow directive and export it as for example `flow` variable:

   ```html
   <ng-container #flow="flow" [flowConfig]="{target: 'http://localhost:3000/upload'}"></ng-container>
   ```

1. Now you can use either directive `flowButton` for select file dialog:

   ```html
   <input type="file" flowButton [flow]="flow.flowJs" [flowAttributes]="{accept: 'image/*'}" />
   ```

   Or `flowDrop` for drag&drop feature:

   ```html
   <div class="drop-area" flowDrop [flow]="flow.flowJs"></div>
   ```

   For both you have to pass `[flow]=flow.flowJs` where `flow` is template variable exported in step 1.

1. You can than subscribe to observable of transfers:

   ```html
   <div *ngFor="let transfer of (flow.transfers$ | async).transfers"></div>
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
<p>Directory upload support: {{flow.flowJs?.supportDirectory}}</p>
```

### I see flickering when upload is in progress

Use `trackBy` for `ngFor`:

```html
<div *ngFor="let transfer of (flow.transfers$ | async).transfers; trackBy: trackTransfer"></div>
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
<input type="file" flowButton [flow]="flow.flowJs" flowDirectoryOnly="true" [flowAttributes]="{accept: 'image/*'}" />
```

### I want to display image which is going to be uploaded

Use directive `flowSrc`:

```html
<div *ngFor="let transfer of (flow.transfers$ | async).transfers">
  <img [flowSrc]="transfer" />
</div>
```

### How to trigger upload right after picking the file?

flow.js v3 runs hooks after files are queued. Use `hooks.filesSubmitted` in the `flowConfig` options to start the upload session automatically:

```typescript
readonly config: FlowOptions = {
  target: 'http://localhost:3000/upload',
  hooks: {
    filesSubmitted: () => {
      void this.flow?.upload();
    }
  }
};
```

```html
<ng-container #flow="flow" [flowConfig]="config"></ng-container>
```

Prefer the `filesSubmitted` hook over an `events$` subscription: flow.js v3 no longer dispatches an event for it.

`events$` exposes the native flow.js v3 events with their object details. NgxFlow listens for `upload-start`, `upload-resume`, `file-progress`, `progress`, `file-success`, `file-error`, `error`, `file-retry`, `file-removed` and `complete`:

```typescript
this.flow.events$.subscribe((event) => {
  if (event.type === 'file-success') {
    console.log(event.detail.file.name);
  }
});
```

`upload()` is completion-oriented in v3: it resolves when the session is complete or cancelled. You can call it without awaiting for fire-and-forget use.

### Streaming, integrity and hooks

`flowConfig` is passed directly to the flow.js v3 constructor, so the v3 options are available without an ngx-flow-specific wrapper:

```typescript
const config: FlowOptions = {
  target: '/upload',
  streaming: true,
  allowShortStream: false,
  chunkChecksum: async (chunk, payload) => {
    // return an async digest; flow.js sends it as flowChunkHash
    return computeChecksum(payload);
  },
  xhrTimeout: 30_000,
  hooks: {
    filterFile: (file) => file.size > 0,
    filesSubmitted: (files) => {
      // start the session when ready
    }
  }
};
```

With `streaming: true`, flow.js sends `flowTotalSize=-1`, `flowIsStreaming=true`, a growing `flowTotalChunks` and a final zero-byte `flowChunkIsLast` marker. The server must support that protocol. `chunkChecksum` is cached across retries and is not recomputed for a cached payload. Whole-file checksums should be computed in `initFileFn` (which may be async) and sent through `query` or `headers`.

The `Transfer` interface also exposes v3 state such as `errorMessage`, `cancelled` and `streaming`. A failed file is `complete` but not `success`; success is derived from `FlowFile.isSuccessful()`.

### Development

`npm run build` - builds the library into dist folder

After that you can publish to npm repository from `dist` folder:

```
cd dist/ngx-flow
npm publish
```
