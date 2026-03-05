import { supabaseAdmin } from './supabase'

// ============================================================
// Image Upload Helper
// Uploads image buffer to Supabase Storage
// Returns public URL
// ============================================================

export async function uploadImage(
  buffer: Buffer,
  filename: string,
  contentType: string = 'image/jpeg'
): Promise<string | null> {
  const bucket = 'report-images'
  const path = `reports/${Date.now()}-${filename}`

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType,
      upsert: false,
    })

  if (error) {
    console.error('[Storage] Upload error:', error.message)
    return null
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadResolutionPhoto(
  buffer: Buffer,
  filename: string,
  reportId: string,
  contentType: string = 'image/jpeg'
): Promise<string | null> {
  const bucket = 'report-images'
  const path = `resolutions/${reportId}/${Date.now()}-${filename}`

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, buffer, { contentType, upsert: false })

  if (error) {
    console.error('[Storage] Resolution upload error:', error.message)
    return null
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
