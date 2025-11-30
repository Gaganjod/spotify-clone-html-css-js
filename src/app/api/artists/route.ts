import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { artists } from '@/db/schema';
import { eq, like, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single artist by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const artist = await db
        .select()
        .from(artists)
        .where(eq(artists.id, parseInt(id)))
        .limit(1);

      if (artist.length === 0) {
        return NextResponse.json(
          { error: 'Artist not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(artist[0], { status: 200 });
    }

    // List all artists with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(artists).orderBy(desc(artists.createdAt));

    if (search) {
      query = query.where(like(artists.name, `%${search}%`));
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
    const { name, bio, imageUrl } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedBio = bio ? bio.trim() : null;
    const sanitizedImageUrl = imageUrl ? imageUrl.trim() : null;

    // Prepare insert data
    const insertData = {
      name: sanitizedName,
      bio: sanitizedBio,
      imageUrl: sanitizedImageUrl,
      followersCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Insert with returning
    const newArtist = await db.insert(artists).values(insertData).returning();

    return NextResponse.json(newArtist[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);

    // Handle unique constraint violation
    if ((error as Error).message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Artist name already exists', code: 'DUPLICATE_NAME' },
        { status: 400 }
      );
    }

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

    const artistId = parseInt(id);

    // Check if artist exists
    const existingArtist = await db
      .select()
      .from(artists)
      .where(eq(artists.id, artistId))
      .limit(1);

    if (existingArtist.length === 0) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, bio, imageUrl, followersCount } = body;

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (bio !== undefined) {
      updateData.bio = bio ? bio.trim() : null;
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl ? imageUrl.trim() : null;
    }

    if (followersCount !== undefined) {
      if (typeof followersCount !== 'number' || followersCount < 0) {
        return NextResponse.json(
          { error: 'Followers count must be a non-negative number', code: 'INVALID_FOLLOWERS_COUNT' },
          { status: 400 }
        );
      }
      updateData.followersCount = followersCount;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(existingArtist[0], { status: 200 });
    }

    // Update with returning
    const updated = await db
      .update(artists)
      .set(updateData)
      .where(eq(artists.id, artistId))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);

    // Handle unique constraint violation
    if ((error as Error).message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Artist name already exists', code: 'DUPLICATE_NAME' },
        { status: 400 }
      );
    }

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

    const artistId = parseInt(id);

    // Check if artist exists before deleting
    const existingArtist = await db
      .select()
      .from(artists)
      .where(eq(artists.id, artistId))
      .limit(1);

    if (existingArtist.length === 0) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    // Delete with returning
    const deleted = await db
      .delete(artists)
      .where(eq(artists.id, artistId))
      .returning();

    return NextResponse.json(
      {
        message: 'Artist deleted successfully',
        id: deleted[0].id,
      },
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