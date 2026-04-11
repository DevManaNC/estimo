/**
 * Generate PWA icons from the SVG source.
 * Run: node scripts/generate-icons.js
 *
 * For now, we use the SVG directly. To generate PNG icons, install sharp:
 *   npm install --save-dev sharp
 * Then uncomment and run this script.
 *
 * Manual alternative: use https://realfavicongenerator.net with the SVG.
 */

// const sharp = require('sharp');
// const path = require('path');
//
// const sizes = [192, 512];
// const input = path.join(__dirname, '../public/icons/icon.svg');
//
// sizes.forEach(size => {
//   sharp(input)
//     .resize(size, size)
//     .png()
//     .toFile(path.join(__dirname, `../public/icons/icon-${size}.png`))
//     .then(() => console.log(`Generated icon-${size}.png`))
//     .catch(err => console.error(err));
// });

console.log('Install sharp (npm i -D sharp) then uncomment the code above to generate PNG icons.');
console.log('Or use the SVG directly — modern browsers support SVG favicons.');
