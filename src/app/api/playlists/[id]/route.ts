import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { playlists, playlistSongs, songs } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const playlistId = parseInt(id);

    // Fetch playlist by ID
    const playlistResult = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, playlistId))
      .limit(1);

    if (playlistResult.length === 0) {
      return NextResponse.json(
        {
          error: 'Playlist not found',
        },
        { status: 404 }
      );
    }

    const playlist = playlistResult[0];

    // Fetch playlist songs with joined song data
    const playlistSongsResult = await db
      .select({
        id: songs.id,
        title: songs.title,
        artistName: songs.artistName,
        albumName: songs.albumName,
        durationSeconds: songs.durationSeconds,
        coverImageUrl: songs.coverImageUrl,
        audioUrl: songs.audioUrl,
        playCount: songs.playCount,
        createdAt: songs.createdAt,
        position: playlistSongs.position,
        addedAt: playlistSongs.addedAt,
      })
      .from(playlistSongs)
      .innerJoin(songs, eq(playlistSongs.songId, songs.id))
      .where(eq(playlistSongs.playlistId, playlistId))
      .orderBy(asc(playlistSongs.position));

    // Return playlist with songs
    return NextResponse.json(
      {
        playlist: {
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          coverImageUrl: playlist.coverImageUrl,
          isPublic: playlist.isPublic,
          createdAt: playlist.createdAt,
        },
        songs: playlistSongsResult,
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