import { db } from '@/db';
import { artists } from '@/db/schema';

async function main() {
    const sampleArtists = [
        // Pop Artists
        {
            name: 'Luna Park',
            bio: 'Rising pop sensation known for dreamy vocals and infectious melodies. Her debut album "Starlight Sessions" topped charts worldwide, blending modern pop with indie sensibilities.',
            imageUrl: '/images/artists/artist-1.jpg',
            followersCount: 285000,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Sarah Chen',
            bio: 'Multi-platinum pop artist with a powerhouse voice and genre-defying sound. Combines R&B influences with contemporary pop production, creating anthems that resonate globally.',
            imageUrl: '/images/artists/artist-2.jpg',
            followersCount: 456000,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'The Velvet Hearts',
            bio: 'Electro-pop duo crafting shimmering synth landscapes and heartfelt lyrics. Their innovative approach to pop music has earned them critical acclaim and a devoted fanbase.',
            imageUrl: '/images/artists/artist-3.jpg',
            followersCount: 198000,
            createdAt: new Date().toISOString(),
        },
        
        // Rock/Indie Artists
        {
            name: 'The Midnight Echo',
            bio: 'Alternative rock band delivering raw energy and introspective lyrics. Known for their explosive live performances and guitar-driven soundscapes that push genre boundaries.',
            imageUrl: '/images/artists/artist-4.jpg',
            followersCount: 342000,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'The River Bend',
            bio: 'Indie rock collective with a vintage soul. Drawing inspiration from classic rock while maintaining a fresh, modern edge that appeals to both old and new generations.',
            imageUrl: '/images/artists/artist-5.jpg',
            followersCount: 167000,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Atlas Stone',
            bio: 'Progressive rock outfit known for epic compositions and technical prowess. Their concept albums tell immersive stories through intricate musical arrangements.',
            imageUrl: '/images/artists/artist-6.jpg',
            followersCount: 124000,
            createdAt: new Date().toISOString(),
        },
        
        // Hip-Hop/Rap Artists
        {
            name: 'Marcus Jay',
            bio: 'Conscious rapper and lyricist tackling social issues with intelligent wordplay. His storytelling ability and smooth flow have made him a voice of his generation.',
            imageUrl: '/images/artists/artist-7.jpg',
            followersCount: 412000,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Rhythm & Truth',
            bio: 'Hip-hop duo blending boom-bap beats with modern production. Their authentic approach to rap and collaborative chemistry create tracks that honor the culture.',
            imageUrl: '/images/artists/artist-8.jpg',
            followersCount: 278000,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Nova Reign',
            bio: 'Female rapper breaking barriers with confident delivery and genre-crossing sound. Merges trap, R&B, and pop influences into her unique artistic vision.',
            imageUrl: '/images/artists/artist-9.jpg',
            followersCount: 389000,
            createdAt: new Date().toISOString(),
        },
        
        // Electronic/EDM Artists
        {
            name: 'DJ Nexus',
            bio: 'Electronic music producer and DJ creating euphoric progressive house tracks. Known for festival-headlining sets and collaborations with international artists.',
            imageUrl: '/images/artists/artist-10.jpg',
            followersCount: 498000,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Cosmic Wave',
            bio: 'Ambient electronic artist crafting immersive sonic journeys. Specializes in downtempo beats and atmospheric soundscapes perfect for late-night listening.',
            imageUrl: '/images/artists/artist-11.jpg',
            followersCount: 145000,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Pulse Theory',
            bio: 'Techno producer pushing boundaries with experimental sound design. Their dark, hypnotic tracks dominate underground club scenes across Europe.',
            imageUrl: '/images/artists/artist-12.jpg',
            followersCount: 92000,
            createdAt: new Date().toISOString(),
        },
        
        // Alternative/Indie Artists
        {
            name: 'Willow Grace',
            bio: 'Singer-songwriter with an ethereal voice and poetic lyrics. Her intimate folk-influenced indie sound creates deeply emotional and personal listening experiences.',
            imageUrl: '/images/artists/artist-13.jpg',
            followersCount: 215000,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'The Blue Hour',
            bio: 'Dream pop band layering reverb-drenched guitars with atmospheric vocals. Their nostalgic yet forward-thinking sound defines modern indie music.',
            imageUrl: '/images/artists/artist-14.jpg',
            followersCount: 178000,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Neon Wilderness',
            bio: 'Alternative band fusing post-punk energy with shoegaze textures. Their cinematic approach to songwriting creates immersive audio landscapes.',
            imageUrl: '/images/artists/artist-15.jpg',
            followersCount: 156000,
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(artists).values(sampleArtists);
    
    console.log('✅ Artists seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});