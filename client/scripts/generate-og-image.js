import sharp from 'sharp';

async function generateOgImage() {
  const width = 1200;
  const height = 630;
  const burgundy = { r: 116, g: 22, b: 23, alpha: 1 }; // #741617

  // Create burgundy background
  const background = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: burgundy,
    }
  });

  // Resize logo to fit nicely (around 350px wide)
  // Using negate to invert the burgundy logo to cream
  const logo = await sharp('./public/images/logo.png')
    .negate({ alpha: false })
    .resize(350, null, { fit: 'inside' })
    .toBuffer();

  const logoMetadata = await sharp(logo).metadata();

  // Center the logo
  const left = Math.round((width - logoMetadata.width) / 2);
  const top = Math.round((height - logoMetadata.height) / 2);

  // Composite logo onto background
  await background
    .composite([
      {
        input: logo,
        left,
        top,
      }
    ])
    .jpeg({ quality: 90 })
    .toFile('./public/images/og-image.jpg');

  console.log('OG image generated: public/images/og-image.jpg (1200x630)');
}

generateOgImage();
