import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { albums, songs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    // Fetch album by ID
    const album = await db
      .select()
      .from(albums)
      .where(eq(albums.id, parseInt(id)))
      .limit(1);

    if (album.length === 0) {
      return NextResponse.json(
        {
          error: 'Album not found',
        },
        { status: 404 }
      );
    }

    // Fetch associated songs where albumName matches album title
    const albumData = album[0];
    const associatedSongs = await db
      .select()
      .from(songs)
      .where(eq(songs.albumName, albumData.title));

    // Return album with associated songs
    return NextResponse.json(
      {
        album: albumData,
        songs: associatedSongs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}