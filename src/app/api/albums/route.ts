import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { albums } from '@/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single album by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const album = await db
        .select()
        .from(albums)
        .where(eq(albums.id, parseInt(id)))
        .limit(1);

      if (album.length === 0) {
        return NextResponse.json(
          { error: 'Album not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(album[0], { status: 200 });
    }

    // List albums with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(albums);

    if (search) {
      query = query.where(
        or(
          like(albums.title, `%${search}%`),
          like(albums.artistName, `%${search}%`)
        )
      );
    }

    const results = await query
      .orderBy(desc(albums.createdAt))
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
    const { title, artistName, releaseYear, coverImageUrl } = body;

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

    // Validate releaseYear if provided
    if (releaseYear !== undefined && releaseYear !== null) {
      if (!Number.isInteger(releaseYear)) {
        return NextResponse.json(
          { error: 'Release year must be a valid integer', code: 'INVALID_RELEASE_YEAR' },
          { status: 400 }
        );
      }
    }

    // Prepare insert data
    const insertData: any = {
      title: title.trim(),
      artistName: artistName.trim(),
      createdAt: new Date().toISOString(),
    };

    if (releaseYear !== undefined && releaseYear !== null) {
      insertData.releaseYear = releaseYear;
    }

    if (coverImageUrl && typeof coverImageUrl === 'string') {
      insertData.coverImageUrl = coverImageUrl.trim();
    }

    const newAlbum = await db.insert(albums).values(insertData).returning();

    return NextResponse.json(newAlbum[0], { status: 201 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if album exists
    const existingAlbum = await db
      .select()
      .from(albums)
      .where(eq(albums.id, parseInt(id)))
      .limit(1);

    if (existingAlbum.length === 0) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, artistName, releaseYear, coverImageUrl } = body;

    const updates: any = {};

    // Validate and add title if provided
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json(
          { error: 'Title must be a non-empty string', code: 'INVALID_TITLE' },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    // Validate and add artistName if provided
    if (artistName !== undefined) {
      if (typeof artistName !== 'string' || artistName.trim() === '') {
        return NextResponse.json(
          { error: 'Artist name must be a non-empty string', code: 'INVALID_ARTIST_NAME' },
          { status: 400 }
        );
      }
      updates.artistName = artistName.trim();
    }

    // Validate and add releaseYear if provided
    if (releaseYear !== undefined) {
      if (releaseYear !== null && !Number.isInteger(releaseYear)) {
        return NextResponse.json(
          { error: 'Release year must be a valid integer', code: 'INVALID_RELEASE_YEAR' },
          { status: 400 }
        );
      }
      updates.releaseYear = releaseYear;
    }

    // Add coverImageUrl if provided
    if (coverImageUrl !== undefined) {
      if (coverImageUrl !== null && typeof coverImageUrl === 'string') {
        updates.coverImageUrl = coverImageUrl.trim();
      } else if (coverImageUrl === null) {
        updates.coverImageUrl = null;
      }
    }

    const updatedAlbum = await db
      .update(albums)
      .set(updates)
      .where(eq(albums.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedAlbum[0], { status: 200 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if album exists
    const existingAlbum = await db
      .select()
      .from(albums)
      .where(eq(albums.id, parseInt(id)))
      .limit(1);

    if (existingAlbum.length === 0) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      );
    }

    await db.delete(albums).where(eq(albums.id, parseInt(id))).returning();

    return NextResponse.json(
      { message: 'Album deleted successfully', id: parseInt(id) },
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