import { NextRequest, NextResponse } from 'next/server'
import { uploadResolutionPhoto } from '@/lib/storage'

// POST /api/upload — admin uploads resolution proof photo
export async function POST(req: NextRequest) {
  const adminAuth = req.cookies.get('admin_auth')?.value
  if (adminAuth !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const reportId = formData.get('reportId') as string | null

  if (!file || !reportId) {
    return NextResponse.json(
      { error: 'file and reportId are required' },
      { status: 400 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadResolutionPhoto(buffer, file.name, reportId, file.type)

  if (!url) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  return NextResponse.json({ url })
}
