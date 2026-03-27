/**
 * Transforms a raw Cloudinary URL to include delivery-time optimizations.
 *
 * Raw:  https://res.cloudinary.com/xxx/image/upload/v123/folder/img.jpg
 * Out:  https://res.cloudinary.com/xxx/image/upload/f_auto,q_auto,w_400/v123/folder/img.jpg
 */
export function useCloudinaryUrl() {
  function optimizedUrl(url, { width, height, crop = 'fill', quality = 'auto' } = {}) {
    if (!url || !url.includes('res.cloudinary.com')) return url

    // Skip if URL already has transforms applied
    if (/\/upload\/[a-z]_/.test(url)) return url

    const transforms = [`f_auto`, `q_${quality}`]
    if (width) transforms.push(`w_${width}`)
    if (height) transforms.push(`h_${height}`)
    if ((width || height) && crop) transforms.push(`c_${crop}`)

    const segment = transforms.join(',')

    // Insert transforms after /upload/
    return url.replace('/upload/', `/upload/${segment}/`)
  }

  return { optimizedUrl }
}
