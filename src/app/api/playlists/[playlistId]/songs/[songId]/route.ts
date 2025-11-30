import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { playlistSongs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { playlistId: string; songId: string } }
) {
  try {
    const { playlistId, songId } = params;

    // Validate playlist ID
    if (!playlistId || isNaN(parseInt(playlistId))) {
      return NextResponse.json(
        {
          error: 'Valid playlist ID is required',
          code: 'INVALID_PLAYLIST_ID',
        },
        { status: 400 }
      );
    }

    // Validate song ID
    if (!songId || isNaN(parseInt(songId))) {
      return NextResponse.json(
        {
          error: 'Valid song ID is required',
          code: 'INVALID_SONG_ID',
        },
        { status: 400 }
      );
    }

    const playlistIdInt = parseInt(playlistId);
    const songIdInt = parseInt(songId);

    // Delete the song from the playlist
    const deleted = await db
      .delete(playlistSongs)
      .where(
        and(
          eq(playlistSongs.playlistId, playlistIdInt),
          eq(playlistSongs.songId, songIdInt)
        )
      )
      .returning();

    // Check if any record was deleted
    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Song not found in playlist' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Song removed from playlist successfully',
        playlistId: playlistIdInt,
        songId: songIdInt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}