import sharp from 'sharp';

async function generateOgImage() {
  const width = 1200;
  const height = 630;
  const burgundy = { r: 116, g: 22, b: 23, alpha: 1 }; // #741617
  const cream = { r: 254, g: 252, b: 240, alpha: 1 }; // #FEFCF0

  // Create burgundy background
  const background = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: burgundy,
    }
  });

  // Resize logo and extract its alpha channel
  const resizedLogo = sharp('./public/images/logo.png')
    .resize(350, null, { fit: 'inside' });

  const resizedLogoBuffer = await resizedLogo.toBuffer();
  const resizedMeta = await sharp(resizedLogoBuffer).metadata();

  // Extract alpha channel from logo to use as mask
  const alphaChannel = await sharp(resizedLogoBuffer)
    .extractChannel(3)
    .toBuffer();

  // Create cream-colored logo using the alpha as mask
  const logo = await sharp({
    create: {
      width: resizedMeta.width,
      height: resizedMeta.height,
      channels: 3,
      background: { r: cream.r, g: cream.g, b: cream.b },
    }
  })
    .joinChannel(alphaChannel)
    .png()
    .toBuffer();

  // Center the logo
  const left = Math.round((width - resizedMeta.width) / 2);
  const top = Math.round((height - resizedMeta.height) / 2);

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
