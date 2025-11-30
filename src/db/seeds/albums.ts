import { db } from '@/db';
import { albums } from '@/db/schema';

async function main() {
    const sampleAlbums = [
        {
            title: 'Neon Dreams',
            artistName: 'The Midnight Echo',
            releaseYear: 2023,
            coverImageUrl: '/images/albums/album-1.jpg',
            createdAt: new Date('2023-03-15').toISOString(),
        },
        {
            title: 'Echoes of Tomorrow',
            artistName: 'The Midnight Echo',
            releaseYear: 2021,
            coverImageUrl: '/images/albums/album-2.jpg',
            createdAt: new Date('2021-09-20').toISOString(),
        },
        {
            title: 'Cosmic Journey',
            artistName: 'Luna Park',
            releaseYear: 2024,
            coverImageUrl: '/images/albums/album-3.jpg',
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            title: 'Moonlight Sessions',
            artistName: 'Luna Park',
            releaseYear: 2022,
            coverImageUrl: '/images/albums/album-4.jpg',
            createdAt: new Date('2022-06-14').toISOString(),
        },
        {
            title: 'Digital Horizons',
            artistName: 'DJ Nexus',
            releaseYear: 2023,
            coverImageUrl: '/images/albums/album-5.jpg',
            createdAt: new Date('2023-11-08').toISOString(),
        },
        {
            title: 'Electric Pulse',
            artistName: 'DJ Nexus',
            releaseYear: 2020,
            coverImageUrl: '/images/albums/album-6.jpg',
            createdAt: new Date('2020-04-22').toISOString(),
        },
        {
            title: 'Whispers in the Wind',
            artistName: 'Sarah Chen',
            releaseYear: 2024,
            coverImageUrl: '/images/albums/album-7.jpg',
            createdAt: new Date('2024-02-28').toISOString(),
        },
        {
            title: 'Autumn Melodies',
            artistName: 'Sarah Chen',
            releaseYear: 2019,
            coverImageUrl: '/images/albums/album-8.jpg',
            createdAt: new Date('2019-10-12').toISOString(),
        },
        {
            title: 'Urban Legends',
            artistName: 'The River Bend',
            releaseYear: 2023,
            coverImageUrl: '/images/albums/album-9.jpg',
            createdAt: new Date('2023-07-19').toISOString(),
        },
        {
            title: 'Mountain Roads',
            artistName: 'The River Bend',
            releaseYear: 2018,
            coverImageUrl: '/images/albums/album-10.jpg',
            createdAt: new Date('2018-05-30').toISOString(),
        },
    ];

    await db.insert(albums).values(sampleAlbums);
    
    console.log('✅ Albums seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});