import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { playlists, playlistSongs, songs } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = params.id;

    // Validate playlist ID
    if (!playlistId || isNaN(parseInt(playlistId))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const parsedPlaylistId = parseInt(playlistId);

    // Parse request body
    const body = await request.json();
    const { songId, position } = body;

    // Validate songId is provided
    if (!songId) {
      return NextResponse.json(
        { error: 'Song ID is required', code: 'MISSING_SONG_ID' },
        { status: 400 }
      );
    }

    // Validate songId is a valid integer
    if (isNaN(parseInt(songId.toString()))) {
      return NextResponse.json(
        { error: 'Valid song ID is required', code: 'INVALID_SONG_ID' },
        { status: 400 }
      );
    }

    const parsedSongId = parseInt(songId.toString());

    // Check if playlist exists
    const playlist = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, parsedPlaylistId))
      .limit(1);

    if (playlist.length === 0) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    // Check if song exists
    const song = await db
      .select()
      .from(songs)
      .where(eq(songs.id, parsedSongId))
      .limit(1);

    if (song.length === 0) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Check if song is already in the playlist
    const existingSong = await db
      .select()
      .from(playlistSongs)
      .where(
        and(
          eq(playlistSongs.playlistId, parsedPlaylistId),
          eq(playlistSongs.songId, parsedSongId)
        )
      )
      .limit(1);

    if (existingSong.length > 0) {
      return NextResponse.json(
        { error: 'Song already in playlist', code: 'DUPLICATE_SONG' },
        { status: 400 }
      );
    }

    // Calculate position if not provided
    let finalPosition = position !== undefined ? parseInt(position.toString()) : null;

    if (finalPosition === null) {
      // Get the maximum position for this playlist
      const maxPositionResult = await db
        .select()
        .from(playlistSongs)
        .where(eq(playlistSongs.playlistId, parsedPlaylistId))
        .orderBy(desc(playlistSongs.position))
        .limit(1);

      if (maxPositionResult.length > 0) {
        finalPosition = maxPositionResult[0].position + 1;
      } else {
        finalPosition = 0;
      }
    }

    // Insert into playlistSongs table
    const newPlaylistSong = await db
      .insert(playlistSongs)
      .values({
        playlistId: parsedPlaylistId,
        songId: parsedSongId,
        position: finalPosition,
        addedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newPlaylistSong[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}