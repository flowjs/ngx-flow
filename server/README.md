# Chunked Upload Server (Flow.js) — server/app.js

This document describes the minimal Express server implemented in `server/app.js`.

## Purpose

A small Node/Express server to receive chunked file uploads (for example from Flow.js), assemble the final file, and provide a download endpoint.

## Endpoints
- `OPTIONS /upload` — Returns 200 for CORS preflight requests.
- `GET /upload` — Check whether a specific chunk already exists. Expects query parameters `flowChunkNumber` and `flowIdentifier`. Returns 200 if the chunk exists, 204 otherwise.
- `POST /upload` — Accepts a chunk (multipart/form-data, file field named `file`) and the following form fields: `flowChunkNumber`, `flowTotalChunks`, `flowIdentifier`, `flowFilename`. Saves the chunk; if all chunks are present, concatenates them into the final file inside the temporary folder.
- `GET /download/:filename` — Downloads the reassembled file if it exists.

## How it works

- Temporary directory: `server/tmp` (created automatically if missing).
- Uploaded chunks are stored as `flow-<flowIdentifier>.<chunkNumber>` in the temp dir.
- When the server detects that all expected chunks are present (based on `flowTotalChunks`), it concatenates them in numeric order into a single file named `flowFilename` in the temp directory and removes the chunk files.
- Basic CORS headers (`Access-Control-Allow-Origin: *`) are set to simplify local testing from a browser client.

## Running the server

```sh
npm run server
```

The server listens by default on port `3000`. To change the port, edit the `PORT` constant in `app.js` or modify the code to read an environment variable.
