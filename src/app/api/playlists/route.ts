import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { playlists } from '@/db/schema';
import { eq, like, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single playlist by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const playlist = await db
        .select()
        .from(playlists)
        .where(eq(playlists.id, parseInt(id)))
        .limit(1);

      if (playlist.length === 0) {
        return NextResponse.json(
          { error: 'Playlist not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(playlist[0], { status: 200 });
    }

    // List all playlists with pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(playlists).orderBy(desc(playlists.createdAt));

    if (search) {
      query = db
        .select()
        .from(playlists)
        .where(like(playlists.name, `%${search}%`))
        .orderBy(desc(playlists.createdAt));
    }

    const results = await query.limit(limit).offset(offset);

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
    const { name, description, coverImageUrl, isPublic } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedDescription = description ? description.trim() : null;
    const sanitizedCoverImageUrl = coverImageUrl ? coverImageUrl.trim() : null;
    const sanitizedIsPublic = isPublic !== undefined ? Boolean(isPublic) : true;

    // Create new playlist
    const newPlaylist = await db
      .insert(playlists)
      .values({
        name: sanitizedName,
        description: sanitizedDescription,
        coverImageUrl: sanitizedCoverImageUrl,
        isPublic: sanitizedIsPublic,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newPlaylist[0], { status: 201 });
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

    // Check if playlist exists
    const existingPlaylist = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, parseInt(id)))
      .limit(1);

    if (existingPlaylist.length === 0) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, coverImageUrl, isPublic } = body;

    // Build update object with only provided fields
    const updates: Partial<typeof playlists.$inferInsert> = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    if (coverImageUrl !== undefined) {
      updates.coverImageUrl = coverImageUrl ? coverImageUrl.trim() : null;
    }

    if (isPublic !== undefined) {
      updates.isPublic = Boolean(isPublic);
    }

    // Update playlist
    const updatedPlaylist = await db
      .update(playlists)
      .set(updates)
      .where(eq(playlists.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedPlaylist[0], { status: 200 });
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

    // Check if playlist exists
    const existingPlaylist = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, parseInt(id)))
      .limit(1);

    if (existingPlaylist.length === 0) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    // Delete playlist
    await db
      .delete(playlists)
      .where(eq(playlists.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      { message: 'Playlist deleted successfully', id: parseInt(id) },
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