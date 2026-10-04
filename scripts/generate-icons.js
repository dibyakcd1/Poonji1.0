import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const publicDir = path.resolve('./public')
const iconsDir = path.resolve('./public/icons')

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true })

// Base SVG definition with Poonji violet background, sleek rounded badge, and Indian Rupee / Capital motif
function getSvg(size, isMaskable = false) {
  // If maskable, icon safe zone requires content within center 80%
  const scale = isMaskable ? 0.75 : 0.85
  const center = size / 2

  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#7C68EE" />
        <stop offset="100%" stop-color="#5544CE" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFD43B" />
        <stop offset="100%" stop-color="#FFA94D" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.25" />
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${size}" height="${size}" fill="url(#bgGrad)" ${isMaskable ? '' : `rx="${size * 0.22}"`} />

    <!-- Subtle inner glowing ring -->
    <circle cx="${center}" cy="${center}" r="${(size * scale) / 2}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="${size * 0.015}" />

    <!-- Centered ₹ (Rupee) & Capital Growth glyph -->
    <g transform="translate(${center}, ${center}) scale(${scale})" filter="url(#shadow)">
      <!-- Top Bar 1 -->
      <rect x="-${size * 0.22}" y="-${size * 0.28}" width="${size * 0.44}" height="${size * 0.06}" rx="${size * 0.03}" fill="#FFFFFF" />
      
      <!-- Top Bar 2 -->
      <rect x="-${size * 0.22}" y="-${size * 0.17}" width="${size * 0.44}" height="${size * 0.06}" rx="${size * 0.03}" fill="#FFFFFF" />
      
      <!-- Vertical Stem -->
      <rect x="-${size * 0.22}" y="-${size * 0.28}" width="${size * 0.07}" height="${size * 0.32}" rx="${size * 0.03}" fill="#FFFFFF" />
      
      <!-- Upper Semi-circle loop -->
      <path d="M -${size * 0.15} -${size * 0.28} L 0 -${size * 0.28} A ${size * 0.16} ${size * 0.16} 0 0 1 0 ${size * 0.04} L -${size * 0.15} ${size * 0.04}" 
            fill="none" stroke="#FFFFFF" stroke-width="${size * 0.06}" stroke-linecap="round" />
      
      <!-- Dynamic Growth Arrow Slant -->
      <path d="M -${size * 0.12} -${size * 0.01} L ${size * 0.18} ${size * 0.30}" 
            stroke="url(#goldGrad)" stroke-width="${size * 0.075}" stroke-linecap="round" />
      <polygon points="${size * 0.10},${size * 0.30} ${size * 0.25},${size * 0.30} ${size * 0.25},${size * 0.15}" fill="#FFD43B" />
    </g>
  </svg>
  `
}

async function generate() {
  console.log('Generating PWA icons...')

  // 1. apple-touch-icon.png (180x180)
  const svg180 = getSvg(180, false)
  await sharp(Buffer.from(svg180)).png().toFile(path.join(publicDir, 'apple-touch-icon.png'))
  await sharp(Buffer.from(svg180)).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'))

  // 2. pwa-192x192.png (192x192)
  const svg192 = getSvg(192, false)
  await sharp(Buffer.from(svg192)).png().toFile(path.join(publicDir, 'pwa-192x192.png'))
  await sharp(Buffer.from(svg192)).png().toFile(path.join(iconsDir, 'icon-192.png'))

  // 3. pwa-512x512.png (512x512)
  const svg512 = getSvg(512, false)
  await sharp(Buffer.from(svg512)).png().toFile(path.join(publicDir, 'pwa-512x512.png'))
  await sharp(Buffer.from(svg512)).png().toFile(path.join(iconsDir, 'icon-512.png'))

  // 4. pwa-maskable-512x512.png (512x512 maskable with safe padding)
  const svgMaskable = getSvg(512, true)
  await sharp(Buffer.from(svgMaskable)).png().toFile(path.join(publicDir, 'pwa-maskable-512x512.png'))

  // 5. favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), getSvg(128, false))

  console.log('All icons generated successfully in public/ and public/icons/')
}

generate().catch(err => {
  console.error('Error generating icons:', err)
  process.exit(1)
})
