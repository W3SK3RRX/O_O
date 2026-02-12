export function arrayBufferToBase64(buffer) {
  return btoa(
    String.fromCharCode(...new Uint8Array(buffer))
  )
}

export function base64ToArrayBuffer(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes.buffer
}
