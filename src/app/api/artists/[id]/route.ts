import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { artists, songs, albums } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    const artistId = parseInt(id);

    // Fetch artist by ID
    const artistResult = await db
      .select()
      .from(artists)
      .where(eq(artists.id, artistId))
      .limit(1);

    if (artistResult.length === 0) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    const artist = artistResult[0];

    // Fetch all songs by this artist
    const artistSongs = await db
      .select()
      .from(songs)
      .where(eq(songs.artistName, artist.name));

    // Fetch all albums by this artist
    const artistAlbums = await db
      .select()
      .from(albums)
      .where(eq(albums.artistName, artist.name));

    return NextResponse.json(
      {
        artist,
        songs: artistSongs,
        albums: artistAlbums
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}