import { db } from '@/db';
import { playlists } from '@/db/schema';

async function main() {
    const samplePlaylists = [
        {
            name: 'Trending Now',
            description: 'Discover the hottest tracks taking over the charts right now. Fresh releases and viral hits that everyone is talking about. Updated daily with the latest trending music.',
            coverImageUrl: '/images/playlists/playlist-1.jpg',
            isPublic: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Top Hits 2024',
            description: 'The biggest songs that defined 2024. From chart-toppers to breakthrough artists, this is your ultimate collection of this year\'s most unforgettable hits.',
            coverImageUrl: '/images/playlists/playlist-2.jpg',
            isPublic: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Chill Vibes',
            description: 'Kick back and relax with smooth, laid-back tracks perfect for unwinding. Mellow beats and soothing melodies to help you de-stress and enjoy the moment.',
            coverImageUrl: '/images/playlists/playlist-3.jpg',
            isPublic: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Workout Energy',
            description: 'Power through your workout with high-energy tracks designed to keep you motivated. Pumping beats and intense rhythms to push you to your limits and crush your fitness goals.',
            coverImageUrl: '/images/playlists/playlist-4.jpg',
            isPublic: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Focus Flow',
            description: 'Enhance your concentration with carefully curated instrumental and ambient tracks. Perfect for studying, working, or any task that requires deep focus and mental clarity.',
            coverImageUrl: '/images/playlists/playlist-5.jpg',
            isPublic: true,
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(playlists).values(samplePlaylists);
    
    console.log('✅ Playlists seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});