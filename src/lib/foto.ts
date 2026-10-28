// Foto de comprovação (C11): uma foto de até 10 MB, reduzida no celular para ~1600 px antes do envio.
import { env } from './env'
import { supabase } from './supabase'

export const TAMANHO_MAXIMO = 10 * 1024 * 1024
const LADO_MAXIMO = 1600
const QUALIDADE = 0.8

export class ErroFoto extends Error {}

/** Reduz a imagem e devolve JPEG. Respeita a orientação da câmera. */
export async function prepararFoto(arquivo: File): Promise<{ blob: Blob; largura: number; altura: number }> {
  if (!arquivo.type.startsWith('image/') && !/\.(heic|heif)$/i.test(arquivo.name)) {
    throw new ErroFoto('Escolha uma imagem (JPG, PNG ou HEIC).')
  }
  if (arquivo.size > TAMANHO_MAXIMO) throw new ErroFoto('A foto passa de 10 MB. Escolha outra ou tire uma nova.')
  let imagem: ImageBitmap
  try {
    imagem = await createImageBitmap(arquivo, { imageOrientation: 'from-image' })
  } catch {
    throw new ErroFoto('Este aparelho não conseguiu abrir a imagem. Tente tirar a foto pela câmera do app.')
  }
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagem.width, imagem.height))
  const largura = Math.round(imagem.width * escala)
  const altura = Math.round(imagem.height * escala)
  const canvas = document.createElement('canvas')
  canvas.width = largura
  canvas.height = altura
  canvas.getContext('2d')!.drawImage(imagem, 0, 0, largura, altura)
  imagem.close()
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', QUALIDADE))
  if (!blob) throw new ErroFoto('Não foi possível preparar a foto. Tente outra.')
  return { blob, largura, altura }
}

export const tamanhoLegivel = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB` : `${Math.round(bytes / 1024)} KB`

/**
 * Envia ao bucket privado com progresso e possibilidade de cancelar (XHR).
 * O caminho começa pelo id da pessoa: a política do Storage só aceita a própria pasta.
 */
export function enviarFoto(caminho: string, blob: Blob, aoProgredir: (pct: number) => void) {
  const xhr = new XMLHttpRequest()
  const promessa = (async () => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) throw new ErroFoto('Sua sessão terminou. Entre de novo para enviar.')
    await new Promise<void>((ok, falhou) => {
      xhr.open('POST', `${env.supabaseUrl}/storage/v1/object/comprovantes/${caminho}`)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.setRequestHeader('apikey', env.supabasePublishableKey)
      xhr.setRequestHeader('Content-Type', 'image/jpeg')
      xhr.setRequestHeader('x-upsert', 'false')
      xhr.upload.onprogress = (e) => e.lengthComputable && aoProgredir(Math.round((e.loaded / e.total) * 100))
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300 ? ok() : falhou(new ErroFoto('O servidor recusou a foto.'))
      xhr.onerror = () => falhou(new ErroFoto('A conexão caiu durante o envio.'))
      xhr.onabort = () => falhou(new ErroFoto('cancelado'))
      xhr.send(blob)
    })
  })()
  return { promessa, cancelar: () => xhr.abort() }
}
