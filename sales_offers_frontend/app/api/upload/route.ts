import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    // Handle FormData (for messaging system)
    if (!filename) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const timestamp = Date.now();
      const safeFilename = `messages/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const blob = await put(safeFilename, file, {
        access: 'public',
      });

      return NextResponse.json(blob);
    }

    // Handle direct body upload (for blog system)
    if (!request.body) {
      return NextResponse.json({ error: 'No file data provided' }, { status: 400 });
    }

    const blob = await put(filename, request.body, {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}