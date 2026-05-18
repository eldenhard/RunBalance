import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '..', 'public')

mkdirSync(resolve(publicDir, 'icons'), { recursive: true })

function buildPng(size, options) {
  const { background = [11, 11, 12], glyph = [255, 255, 255] } = options ?? {}
  const channels = 4
  const stride = size * channels
  const rowLength = 1 + stride
  const raw = Buffer.alloc(size * rowLength)

  for (let y = 0; y < size; y += 1) {
    raw[y * rowLength] = 0
    const row = raw.subarray(y * rowLength + 1)
    for (let x = 0; x < size; x += 1) {
      const offset = x * channels
      row[offset] = background[0]
      row[offset + 1] = background[1]
      row[offset + 2] = background[2]
      row[offset + 3] = 255
    }
  }

  const cx = size / 2
  const cy = size / 2
  const outerRadius = size * 0.36
  const innerRadius = size * 0.28
  const accentRadius = size * 0.07

  for (let y = 0; y < size; y += 1) {
    const row = raw.subarray(y * rowLength + 1)
    for (let x = 0; x < size; x += 1) {
      const dx = x - cx
      const dy = y - cy
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= outerRadius && distance >= innerRadius) {
        writePixel(row, x, glyph, 255)
      }

      const accentDx = x - (cx + outerRadius * Math.cos(-Math.PI / 4))
      const accentDy = y - (cy + outerRadius * Math.sin(-Math.PI / 4))
      const accentDistance = Math.sqrt(accentDx * accentDx + accentDy * accentDy)
      if (accentDistance <= accentRadius) {
        writePixel(row, x, [255, 90, 0], 255)
      }
    }
  }

  return wrapPng(raw, size)
}

function writePixel(row, x, color, alpha) {
  const offset = x * 4
  row[offset] = color[0]
  row[offset + 1] = color[1]
  row[offset + 2] = color[2]
  row[offset + 3] = alpha
}

function wrapPng(raw, size) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = buildIhdr(size, size)
  const idat = buildIdat(raw)
  const iend = buildChunk('IEND', Buffer.alloc(0))
  return Buffer.concat([signature, ihdr, idat, iend])
}

function buildIhdr(width, height) {
  const data = Buffer.alloc(13)
  data.writeUInt32BE(width, 0)
  data.writeUInt32BE(height, 4)
  data[8] = 8
  data[9] = 6
  data[10] = 0
  data[11] = 0
  data[12] = 0
  return buildChunk('IHDR', data)
}

function buildIdat(raw) {
  const compressed = zlib.deflateSync(raw)
  return buildChunk('IDAT', compressed)
}

function buildChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const typeBuffer = Buffer.from(type, 'ascii')
  const crc = crc32(Buffer.concat([typeBuffer, data]))
  const crcBuffer = Buffer.alloc(4)
  crcBuffer.writeUInt32BE(crc >>> 0, 0)
  return Buffer.concat([length, typeBuffer, data, crcBuffer])
}

function crc32(buffer) {
  let crc = ~0
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i]
    for (let j = 0; j < 8; j += 1) {
      crc = crc >>> 1 ^ (0xedb88320 & -(crc & 1))
    }
  }
  return ~crc
}

const targets = [
  { size: 180, file: 'icons/apple-touch-icon.png' },
  { size: 192, file: 'icons/icon-192.png' },
  { size: 512, file: 'icons/icon-512.png' }
]

for (const target of targets) {
  const png = buildPng(target.size)
  const path = resolve(publicDir, target.file)
  writeFileSync(path, png)
  console.log(`wrote ${target.file}: ${png.length} bytes`)
}
