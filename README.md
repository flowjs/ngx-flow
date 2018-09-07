# NgxFlow

The purpose of this package is to create a wrapper for Angular for fileupload using [flow.js](https://github.com/flowjs/flow.js). This is at very early stage and basically just proof of concept. I am open for API suggestions.

## Goals

- ✅ upload single file
- ✅ upload multiple files
- ✅ queue management
- ✅ error handling
- ✅ pause / resume upload
- ✅ cancel upload, cancel all uploads
- ✅ upload progress
- ✅ file / directory restrictions
- ⏱ drag & drop
- ⏱ display uploaded image

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

## API

Use `flowButton` directive on the file input and save it to the template variable:

```html
<input type="file" flowButton [flowConfig]="flowConfig" #flow="flowButton">
```

You will have to provide `flowConfig` in your component:

```typescript
export class AppComponent {
  flowConfig = {
    target: 'http://localhost:3000/upload'
  };
}
```

You can than subscribe to observable of transfers:

```html
<div *ngFor="let file of (flow.transfers$ | async).transfers">
```

After adding files you can begin upload using `upload()` method:

```html
<button type="button" (click)="flow.upload()" [disabled]="!(flow.somethingToUpload$ | async)">Start upload</button>
```

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

When you need access to flow.js itself you can find it under `flow` variable.

```html
<input type="file" flowButton [flowConfig]="flowConfig" #flow="flowButton">
<p>Is flowjs supported by the browser? {{flow.flow?.support}}</p>
```
