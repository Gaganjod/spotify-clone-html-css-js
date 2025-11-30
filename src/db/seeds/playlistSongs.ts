import { db } from '@/db';
import { playlistSongs, playlists, songs } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

async function main() {
    // First, query the database to get actual playlist and song IDs
    const existingPlaylists = await db.select().from(playlists);
    const existingSongs = await db.select().from(songs).orderBy(desc(songs.playCount));

    if (existingPlaylists.length === 0 || existingSongs.length === 0) {
        console.error('❌ No playlists or songs found. Please run playlists and songs seeders first.');
        return;
    }

    // Sort songs by play count for easier selection
    const popularSongs = existingSongs.slice(0, 20);
    const mellowSongs = existingSongs.filter(s => 
        s.title.toLowerCase().includes('dream') || 
        s.title.toLowerCase().includes('night') ||
        s.title.toLowerCase().includes('ocean') ||
        s.title.toLowerCase().includes('midnight') ||
        s.artistName.toLowerCase().includes('aurora') ||
        s.artistName.toLowerCase().includes('cigarettes')
    );
    const energySongs = existingSongs.filter(s => 
        s.artistName.toLowerCase().includes('dua lipa') ||
        s.artistName.toLowerCase().includes('weeknd') ||
        s.artistName.toLowerCase().includes('daft punk') ||
        s.artistName.toLowerCase().includes('drake') ||
        s.title.toLowerCase().includes('energy') ||
        s.title.toLowerCase().includes('party')
    );
    const focusSongs = existingSongs.filter(s => 
        s.artistName.toLowerCase().includes('daft punk') ||
        s.artistName.toLowerCase().includes('tame impala') ||
        s.title.toLowerCase().includes('digital') ||
        s.title.toLowerCase().includes('machine')
    );

    const currentTime = new Date().toISOString();

    const playlistSongsData = [];

    // Playlist 1: "Trending Now" - Top 10 most popular songs
    const trendingPlaylist = existingPlaylists[0];
    const trendingSongs = popularSongs.slice(0, 10);
    trendingSongs.forEach((song, index) => {
        playlistSongsData.push({
            playlistId: trendingPlaylist.id,
            songId: song.id,
            position: index,
            addedAt: currentTime,
        });
    });

    // Playlist 2: "Top Hits 2024" - Next 10 popular songs
    const topHitsPlaylist = existingPlaylists[1];
    const topHitsSongs = popularSongs.slice(5, 15);
    topHitsSongs.forEach((song, index) => {
        playlistSongsData.push({
            playlistId: topHitsPlaylist.id,
            songId: song.id,
            position: index,
            addedAt: currentTime,
        });
    });

    // Playlist 3: "Chill Vibes" - 8 mellow songs
    const chillPlaylist = existingPlaylists[2];
    const chillSongs = mellowSongs.length >= 8 ? mellowSongs.slice(0, 8) : existingSongs.slice(10, 18);
    chillSongs.forEach((song, index) => {
        playlistSongsData.push({
            playlistId: chillPlaylist.id,
            songId: song.id,
            position: index,
            addedAt: currentTime,
        });
    });

    // Playlist 4: "Workout Energy" - 10 high-energy songs
    const workoutPlaylist = existingPlaylists[3];
    const workoutSongs = energySongs.length >= 10 ? energySongs.slice(0, 10) : existingSongs.slice(0, 10);
    workoutSongs.forEach((song, index) => {
        playlistSongsData.push({
            playlistId: workoutPlaylist.id,
            songId: song.id,
            position: index,
            addedAt: currentTime,
        });
    });

    // Playlist 5: "Focus Flow" - 8 electronic/ambient songs
    const focusPlaylist = existingPlaylists[4];
    const focusFlowSongs = focusSongs.length >= 8 ? focusSongs.slice(0, 8) : existingSongs.slice(15, 23);
    focusFlowSongs.forEach((song, index) => {
        playlistSongsData.push({
            playlistId: focusPlaylist.id,
            songId: song.id,
            position: index,
            addedAt: currentTime,
        });
    });

    await db.insert(playlistSongs).values(playlistSongsData);
    
    console.log('✅ Playlist songs seeder completed successfully');
    console.log(`   Added ${playlistSongsData.length} playlist-song associations`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});