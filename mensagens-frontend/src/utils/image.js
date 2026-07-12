// Reduz a resolução de imagens grandes no cliente ANTES de cifrar/enviar.
// Mantém a criptografia ponta-a-ponta (o servidor nunca vê o conteúdo) e corta
// drasticamente o volume que trafega no upload e em cada exibição — uma foto de
// celular de vários MB costuma virar algumas centenas de KB.
//
// Formatos que não dá para rasterizar com segurança/sem perda de sentido passam
// intactos: GIF (perderia a animação) e SVG (não é raster; é tratado como
// download no AttachmentView).

const MAX_DIM = 1600 // maior lado da imagem, em px
const OUTPUT_MIME = 'image/webp' // preserva transparência e comprime bem
const OUTPUT_QUALITY = 0.82

export async function downscaleImage(file) {
  if (!file.type?.startsWith('image/')) return file
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file // navegador não decodificou o formato: envia como está
  }

  const { width, height } = bitmap
  const longest = Math.max(width, height)
  if (longest <= MAX_DIM) {
    bitmap.close?.()
    return file // já pequena: não re-encoda (preserva qualidade e formato original)
  }

  const scale = MAX_DIM / longest
  const w = Math.round(width * scale)
  const h = Math.round(height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, OUTPUT_MIME, OUTPUT_QUALITY)
  )
  // toBlob pode falhar (null) ou, em casos raros, gerar algo maior que o
  // original — nesses casos mantém o arquivo original.
  if (!blob || blob.size >= file.size) return file

  const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
  return new File([blob], name, { type: OUTPUT_MIME, lastModified: Date.now() })
}
