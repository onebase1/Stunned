const fs = require('fs');
const path = require('path');

// Create a simple favicon.ico placeholder
const faviconIcoContent = Buffer.from([
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10, 0x00, 0x00, 0x01, 0x00, 0x20, 0x00, 0x68, 0x04,
  0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x28, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x20, 0x00,
  0x00, 0x00, 0x01, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
]);

// Create basic PNG header for a 16x16 blue square with "H"
const createSimplePNG = (size) => {
  // This is a simplified approach - in production, you'd use a proper image library
  const canvas = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${Math.floor(size/8)}" fill="#0ea5e9"/>
    <text x="${size/2}" y="${size/2 + size/8}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${Math.floor(size/2)}" font-weight="bold">H</text>
  </svg>`;
  return canvas;
};

// Ensure public directory exists
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

try {
  // Create favicon.ico
  fs.writeFileSync('public/favicon.ico', faviconIcoContent);
  console.log('✅ Created favicon.ico');

  // Create apple-touch-icon.png (as SVG for now)
  const appleTouchIcon = createSimplePNG(180);
  fs.writeFileSync('public/apple-touch-icon.svg', appleTouchIcon);
  console.log('✅ Created apple-touch-icon.svg');

  // Create icon-192.png (as SVG for now)
  const icon192 = createSimplePNG(192);
  fs.writeFileSync('public/icon-192.svg', icon192);
  console.log('✅ Created icon-192.svg');

  // Create icon-512.png (as SVG for now)
  const icon512 = createSimplePNG(512);
  fs.writeFileSync('public/icon-512.svg', icon512);
  console.log('✅ Created icon-512.svg');

  console.log('\n🎉 All icon files created successfully!');
  console.log('\n📝 Note: For production, consider using proper PNG files instead of SVG for better compatibility.');
  console.log('You can use tools like https://realfavicongenerator.net/ to generate proper icons.');

} catch (error) {
  console.error('❌ Error creating icon files:', error);
}
