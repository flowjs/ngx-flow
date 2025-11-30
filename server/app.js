const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const TMP_DIR = path.resolve(__dirname, 'tmp');
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

const app = express();
const upload = multer({ dest: TMP_DIR });

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// OPTIONS /upload
app.options('/upload', (req, res) => {
  res.sendStatus(200);
});

// GET /upload : check if chunk exists
app.get('/upload', (req, res) => {
  const { flowChunkNumber, flowIdentifier } = req.query;
  if (!flowChunkNumber || !flowIdentifier) {
    return res.sendStatus(400);
  }
  const chunkPath = path.join(TMP_DIR, `flow-${flowIdentifier}.${flowChunkNumber}`);
  fs.access(chunkPath, fs.constants.F_OK, (err) => {
    res.sendStatus(err ? 204 : 200);
  });
});

// POST /upload : receive chunk
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const {
      flowChunkNumber,
      flowTotalChunks,
      flowIdentifier,
      flowFilename
    } = req.body;
    if (!req.file || !flowChunkNumber || !flowTotalChunks || !flowIdentifier || !flowFilename) {
      return res.sendStatus(400);
    }
    const chunkPath = path.join(TMP_DIR, `flow-${flowIdentifier}.${flowChunkNumber}`);
    // Move uploaded chunk to correct name
    await fs.promises.rename(req.file.path, chunkPath);

    // Check if all chunks are present
    let allChunks = true;
    for (let i = 1; i <= Number(flowTotalChunks); i++) {
      if (!fs.existsSync(path.join(TMP_DIR, `flow-${flowIdentifier}.${i}`))) {
        allChunks = false;
        break;
      }
    }
    if (allChunks) {
      // Rebuild file
      const finalPath = path.join(TMP_DIR, flowFilename);
      const writeStream = fs.createWriteStream(finalPath);
      for (let i = 1; i <= Number(flowTotalChunks); i++) {
        const chunkFile = path.join(TMP_DIR, `flow-${flowIdentifier}.${i}`);
        await new Promise((resolve, reject) => {
          const readStream = fs.createReadStream(chunkFile);
          readStream.on('end', resolve);
          readStream.on('error', reject);
          readStream.pipe(writeStream, { end: false });
        });
        await fs.promises.unlink(chunkFile);
      }
      writeStream.end();
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// GET /download/:filename : download the reassembled file
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(TMP_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.sendStatus(404);
  }
  res.download(filePath);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});
