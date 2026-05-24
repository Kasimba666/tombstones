const https = require('https');
const http = require('http');
const fs = require('fs');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const prot = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    prot.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlink(dest, () => {});
        const redirectUrl = response.headers.location.startsWith('http') ? response.headers.location : new URL(response.headers.location, url).href;
        console.log('Redirecting to: ' + redirectUrl);
        resolve(download(redirectUrl, dest));
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error('HTTP ' + response.statusCode + ' from ' + url));
        return;
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { file.close(); fs.unlink(dest, () => {}); reject(err); });
  });
}

(async () => {
  try {
    const regularUrl = 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf';
    const boldUrl = 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf';

    console.log('Downloading NotoSans-Regular.ttf...');
    await download(regularUrl, 'NotoSans-Regular.ttf');
    const size1 = fs.statSync('NotoSans-Regular.ttf').size;
    console.log('Downloaded: ' + size1 + ' bytes');

    console.log('Downloading NotoSans-Bold.ttf...');
    await download(boldUrl, 'NotoSans-Bold.ttf');
    const size2 = fs.statSync('NotoSans-Bold.ttf').size;
    console.log('Downloaded: ' + size2 + ' bytes');

    const regular = fs.readFileSync('NotoSans-Regular.ttf');
    const bold = fs.readFileSync('NotoSans-Bold.ttf');

    const content = '// Auto-generated font data for jsPDF\n' +
      'export const NotoSansRegularBase64 = ' + JSON.stringify(regular.toString('base64')) + ';\n' +
      'export const NotoSansBoldBase64 = ' + JSON.stringify(bold.toString('base64')) + ';\n';

    fs.writeFileSync('src/services/fontData.js', content);
    console.log('Created src/services/fontData.js');

    fs.unlinkSync('NotoSans-Regular.ttf');
    fs.unlinkSync('NotoSans-Bold.ttf');
    console.log('Done!');
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();