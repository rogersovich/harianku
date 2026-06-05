import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary credentials are not configured' }, { status: 500 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Math.round(new Date().getTime() / 1000)
    
    // Generate signature
    const signature = crypto
      .createHash('sha1')
      .update(`timestamp=${timestamp}${apiSecret}`)
      .digest('hex')

    const uploadFormData = new FormData()
    
    // We convert buffer to blob to match fetch requirements
    const fileBlob = new Blob([buffer], { type: file.type })
    uploadFormData.append('file', fileBlob, file.name)
    uploadFormData.append('timestamp', String(timestamp))
    uploadFormData.append('api_key', apiKey)
    uploadFormData.append('signature', signature)

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    )

    const cloudinaryData = await cloudinaryRes.json()
    if (cloudinaryData.error) {
      return NextResponse.json({ error: cloudinaryData.error.message }, { status: 400 })
    }

    return NextResponse.json({ url: cloudinaryData.secure_url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
