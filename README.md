# NgxFlow

The purpose of this package is to create a wrapper for Angular for fileupload using [flow.js](https://github.com/flowjs/flow.js).

## Goals

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
- 🚧 tests
- ⏱ upload right after selecting file

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

### How does `transfers$` data looks like?

Observable `flow.transfers$` emits state in form:

```typescript
{
  totalProgress: 0.5,
  transfers: [
    {
      name: "somefile.txt",
      flowFile: FlowFile,
      progress: 0
    },
    {
      name: "uploading.txt",
      flowFile: FlowFile,
      progress: 0.5
    },
    {
      name: "failed-to-upload.txt",
      flowFile: FlowFile,
      progress: 0.8
    }
    {
      name: "uploaded.txt",
      flowFile: FlowFile,
      progress: 1
    }
  ]
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

Add `signleFile: true` to your flow config:

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
