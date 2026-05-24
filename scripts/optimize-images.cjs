const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

async function run() {
  const distDir = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distDir)) {
    console.error('dist directory does not exist. Run npm run build first.');
    process.exit(1);
  }

  console.log('Scanning build files in dist/ for images to optimize...');
  const allFiles = walk(distDir);
  
  const imagesToConvert = allFiles.filter(f => {
    const ext = path.extname(f).toLowerCase();
    const base = path.basename(f).toLowerCase();
    return (ext === '.png' || ext === '.jpg' || ext === '.jpeg') && !base.includes('favicon');
  });

  if (imagesToConvert.length === 0) {
    console.log('No images found to convert.');
    return;
  }

  console.log(`Found ${imagesToConvert.length} images. Starting WebP conversion...`);
  const replacements = [];

  for (const imgPath of imagesToConvert) {
    const ext = path.extname(imgPath);
    const dir = path.dirname(imgPath);
    const baseName = path.basename(imgPath, ext);
    const webpPath = path.join(dir, `${baseName}.webp`);

    try {
      await sharp(imgPath)
        .webp({ quality: 80 })
        .toFile(webpPath);
      
      // Delete the original file
      fs.unlinkSync(imgPath);

      const originalFileName = `${baseName}${ext}`;
      const webpFileName = `${baseName}.webp`;

      replacements.push({
        original: originalFileName,
        replacement: webpFileName
      });

      // Handle URL-encoded space and characters
      const encodedOriginal = encodeURIComponent(originalFileName);
      const encodedWebp = encodeURIComponent(webpFileName);
      if (encodedOriginal !== originalFileName) {
        replacements.push({
          original: encodedOriginal,
          replacement: encodedWebp
        });
      }
      
      console.log(`✓ Converted: ${path.relative(distDir, imgPath)} -> ${baseName}.webp`);
    } catch (err) {
      console.error(`✗ Failed to convert ${imgPath}:`, err);
    }
  }

  console.log('Updating file references in HTML, CSS, and JS files...');
  const textFiles = allFiles.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ext === '.html' || ext === '.css' || ext === '.js';
  });

  let updatedCount = 0;
  for (const tf of textFiles) {
    let content = fs.readFileSync(tf, 'utf8');
    let modified = false;

    for (const r of replacements) {
      if (content.includes(r.original)) {
        content = content.split(r.original).join(r.replacement);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(tf, content, 'utf8');
      console.log(`✓ Updated references in: ${path.relative(distDir, tf)}`);
      updatedCount++;
    }
  }

  console.log(`Image optimization complete. Converted ${imagesToConvert.length} images and updated ${updatedCount} files.`);
}

run().catch(err => {
  console.error('Fatal error in image optimization script:', err);
  process.exit(1);
});
