import fs from 'fs';
import path from 'path';

// Let's create an RGBA buffer for 32x32 and 128x128 PNG / ICO
// We can construct simple valid PNGs with zlib
import zlib from 'zlib';

function createPNG(width, height) {
  // Simple uncompressed or raw PNG generator
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT raw scanlines (1 filter byte 0 + RGBA per pixel)
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // filter 0 (none)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // Dark background #0e0e11 with cyan circle border
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const radius = width * 0.4;
      
      if (Math.abs(dist - radius) < (width * 0.08)) {
        // Cyan border
        rawData[pxOffset] = 0x00;     // R
        rawData[pxOffset + 1] = 0xf0; // G
        rawData[pxOffset + 2] = 0xff; // B
        rawData[pxOffset + 3] = 0xff; // A
      } else {
        // Dark background
        rawData[pxOffset] = 0x0e;     // R
        rawData[pxOffset + 1] = 0x0e; // G
        rawData[pxOffset + 2] = 0x11; // B
        rawData[pxOffset + 3] = 0xff; // A
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([len, typeAndData, crcBuf]);
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    crc = crc ^ byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

function createICO(pngBuffer) {
  // Minimal standard ICO header with 1 embedded PNG image
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(1, 4); // 1 image

  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(128, 0); // width 128
  dirEntry.writeUInt8(128, 1); // height 128
  dirEntry.writeUInt8(0, 2); // 0 colors in palette
  dirEntry.writeUInt8(0, 3); // reserved
  dirEntry.writeUInt16LE(1, 4); // color planes
  dirEntry.writeUInt16LE(32, 6); // bits per pixel
  dirEntry.writeUInt32LE(pngBuffer.length, 8); // image size
  dirEntry.writeUInt32LE(22, 12); // image offset (6 + 16 = 22)

  return Buffer.concat([header, dirEntry, pngBuffer]);
}

const iconsDir = path.resolve('D:/projects/open-cap/src-tauri/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const png32 = createPNG(32, 32);
const png128 = createPNG(128, 128);
const ico = createICO(png128);

fs.writeFileSync(path.join(iconsDir, '32x32.png'), png32);
fs.writeFileSync(path.join(iconsDir, '128x128.png'), png128);
fs.writeFileSync(path.join(iconsDir, '128x128@2x.png'), png128);
fs.writeFileSync(path.join(iconsDir, 'icon.png'), png128);
fs.writeFileSync(path.join(iconsDir, 'icon.ico'), ico);
fs.writeFileSync(path.join(iconsDir, 'icon.icns'), png128);

console.log('Icons generated successfully in', iconsDir);
