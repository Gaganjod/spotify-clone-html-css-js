import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { songs } from '@/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single song by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const song = await db
        .select()
        .from(songs)
        .where(eq(songs.id, parseInt(id)))
        .limit(1);

      if (song.length === 0) {
        return NextResponse.json(
          { error: 'Song not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(song[0], { status: 200 });
    }

    // List songs with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(songs);

    if (search) {
      query = query.where(
        or(
          like(songs.title, `%${search}%`),
          like(songs.artistName, `%${search}%`)
        )
      );
    }

    const results = await query
      .orderBy(desc(songs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, artistName, albumName, durationSeconds, coverImageUrl, audioUrl } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!artistName || typeof artistName !== 'string' || artistName.trim() === '') {
      return NextResponse.json(
        { error: 'Artist name is required and must be a non-empty string', code: 'MISSING_ARTIST_NAME' },
        { status: 400 }
      );
    }

    if (!durationSeconds || typeof durationSeconds !== 'number' || durationSeconds <= 0 || !Number.isInteger(durationSeconds)) {
      return NextResponse.json(
        { error: 'Duration seconds is required and must be a positive integer', code: 'INVALID_DURATION' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData: any = {
      title: title.trim(),
      artistName: artistName.trim(),
      durationSeconds,
      playCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (albumName && typeof albumName === 'string') {
      insertData.albumName = albumName.trim();
    }

    if (coverImageUrl && typeof coverImageUrl === 'string') {
      insertData.coverImageUrl = coverImageUrl.trim();
    }

    if (audioUrl && typeof audioUrl === 'string') {
      insertData.audioUrl = audioUrl.trim();
    }

    const newSong = await db.insert(songs).values(insertData).returning();

    return NextResponse.json(newSong[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if song exists
    const existingSong = await db
      .select()
      .from(songs)
      .where(eq(songs.id, parseInt(id)))
      .limit(1);

    if (existingSong.length === 0) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, artistName, albumName, durationSeconds, coverImageUrl, audioUrl, playCount } = body;

    // Prepare update data
    const updateData: any = {};

    // Validate and add fields if provided
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json(
          { error: 'Title must be a non-empty string', code: 'INVALID_TITLE' },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (artistName !== undefined) {
      if (typeof artistName !== 'string' || artistName.trim() === '') {
        return NextResponse.json(
          { error: 'Artist name must be a non-empty string', code: 'INVALID_ARTIST_NAME' },
          { status: 400 }
        );
      }
      updateData.artistName = artistName.trim();
    }

    if (albumName !== undefined) {
      if (albumName === null) {
        updateData.albumName = null;
      } else if (typeof albumName === 'string') {
        updateData.albumName = albumName.trim();
      } else {
        return NextResponse.json(
          { error: 'Album name must be a string or null', code: 'INVALID_ALBUM_NAME' },
          { status: 400 }
        );
      }
    }

    if (durationSeconds !== undefined) {
      if (typeof durationSeconds !== 'number' || durationSeconds <= 0 || !Number.isInteger(durationSeconds)) {
        return NextResponse.json(
          { error: 'Duration seconds must be a positive integer', code: 'INVALID_DURATION' },
          { status: 400 }
        );
      }
      updateData.durationSeconds = durationSeconds;
    }

    if (coverImageUrl !== undefined) {
      if (coverImageUrl === null) {
        updateData.coverImageUrl = null;
      } else if (typeof coverImageUrl === 'string') {
        updateData.coverImageUrl = coverImageUrl.trim();
      } else {
        return NextResponse.json(
          { error: 'Cover image URL must be a string or null', code: 'INVALID_COVER_IMAGE_URL' },
          { status: 400 }
        );
      }
    }

    if (audioUrl !== undefined) {
      if (audioUrl === null) {
        updateData.audioUrl = null;
      } else if (typeof audioUrl === 'string') {
        updateData.audioUrl = audioUrl.trim();
      } else {
        return NextResponse.json(
          { error: 'Audio URL must be a string or null', code: 'INVALID_AUDIO_URL' },
          { status: 400 }
        );
      }
    }

    if (playCount !== undefined) {
      if (typeof playCount !== 'number' || playCount < 0 || !Number.isInteger(playCount)) {
        return NextResponse.json(
          { error: 'Play count must be a non-negative integer', code: 'INVALID_PLAY_COUNT' },
          { status: 400 }
        );
      }
      updateData.playCount = playCount;
    }

    // Return error if no fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update', code: 'NO_UPDATE_FIELDS' },
        { status: 400 }
      );
    }

    const updatedSong = await db
      .update(songs)
      .set(updateData)
      .where(eq(songs.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedSong[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if song exists
    const existingSong = await db
      .select()
      .from(songs)
      .where(eq(songs.id, parseInt(id)))
      .limit(1);

    if (existingSong.length === 0) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    await db.delete(songs).where(eq(songs.id, parseInt(id))).returning();

    return NextResponse.json(
      { message: 'Song deleted successfully', id: parseInt(id) },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}