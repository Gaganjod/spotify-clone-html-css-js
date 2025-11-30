"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Music, Play } from "lucide-react";
import { useAudioPlayer } from "@/contexts/audio-player-context";

interface Song {
  id: number;
  title: string;
  artistName: string;
  albumName: string | null;
  durationSeconds: number;
  coverImageUrl: string | null;
  audioUrl: string | null;
  playCount: number;
}

interface Artist {
  id: number;
  name: string;
  imageUrl: string | null;
  bio: string | null;
  followersCount: number;
}

interface Album {
  id: number;
  title: string;
  artistName: string;
  releaseYear: number | null;
  coverImageUrl: string | null;
}

interface Playlist {
  id: number;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  isPublic: boolean;
}

const HomeMainView = () => {
  const { playSong } = useAudioPlayer();
  
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [popularArtists, setPopularArtists] = useState<Artist[]>([]);
  const [popularAlbums, setPopularAlbums] = useState<Album[]>([]);
  const [popularPlaylists, setPopularPlaylists] = useState<Playlist[]>([]);
  
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);

  useEffect(() => {
    const fetchTrendingSongs = async () => {
      try {
        const response = await fetch('/api/songs/trending?limit=6');
        if (response.ok) {
          const data = await response.json();
          setTrendingSongs(data);
        }
      } catch (error) {
        console.error('Error fetching trending songs:', error);
      } finally {
        setLoadingSongs(false);
      }
    };

    const fetchPopularArtists = async () => {
      try {
        const response = await fetch('/api/artists?limit=6');
        if (response.ok) {
          const data = await response.json();
          setPopularArtists(data);
        }
      } catch (error) {
        console.error('Error fetching artists:', error);
      } finally {
        setLoadingArtists(false);
      }
    };

    const fetchPopularAlbums = async () => {
      try {
        const response = await fetch('/api/albums?limit=6');
        if (response.ok) {
          const data = await response.json();
          setPopularAlbums(data);
        }
      } catch (error) {
        console.error('Error fetching albums:', error);
      } finally {
        setLoadingAlbums(false);
      }
    };

    const fetchPopularPlaylists = async () => {
      try {
        const response = await fetch('/api/playlists?limit=6');
        if (response.ok) {
          const data = await response.json();
          setPopularPlaylists(data);
        }
      } catch (error) {
        console.error('Error fetching playlists:', error);
      } finally {
        setLoadingPlaylists(false);
      }
    };

    fetchTrendingSongs();
    fetchPopularArtists();
    fetchPopularAlbums();
    fetchPopularPlaylists();
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none';
  };

  const handleSongClick = (song: Song) => {
    playSong({
      id: song.id,
      title: song.title,
      artistName: song.artistName,
      albumName: song.albumName,
      durationSeconds: song.durationSeconds,
      coverImageUrl: song.coverImageUrl,
      audioUrl: song.audioUrl,
    });
  };

  return (
    <div className="p-6">
      <h1 className="sr-only">Home</h1>

      {/* Trending Songs Section */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Trending songs</h2>
          <button className="text-sm font-bold text-muted-foreground hover:underline">
            Show all
          </button>
        </div>

        {loadingSongs ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square w-full rounded-md bg-skeleton-start" />
                <div className="mt-3 h-4 w-3/4 rounded bg-skeleton-start" />
                <div className="mt-2 h-3 w-1/2 rounded bg-skeleton-start" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {trendingSongs.map((song) => (
              <div
                key={song.id}
                onClick={() => handleSongClick(song)}
                className="group relative cursor-pointer rounded-md bg-card p-4 transition-all hover:bg-surface-elevated"
              >
                <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-md bg-gradient-to-br from-primary/20 to-accent/10">
                  {song.coverImageUrl ? (
                    <Image
                      src={song.coverImageUrl}
                      alt={song.title}
                      fill
                      className="object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music className="h-16 w-16 text-white/30" />
                    </div>
                  )}
                  <button
                    className="absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-black opacity-0 shadow-xl transition-all hover:scale-105 hover:bg-accent group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSongClick(song);
                    }}
                  >
                    <Play fill="currentColor" className="ml-0.5 h-5 w-5" />
                  </button>
                </div>
                <h3 className="truncate font-bold text-white">{song.title}</h3>
                <p className="truncate text-sm text-muted-foreground">
                  {song.artistName}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Popular Artists Section */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Popular artists</h2>
          <button className="text-sm font-bold text-muted-foreground hover:underline">
            Show all
          </button>
        </div>

        {loadingArtists ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square w-full rounded-full bg-skeleton-start" />
                <div className="mt-3 h-4 w-3/4 rounded bg-skeleton-start" />
                <div className="mt-2 h-3 w-1/2 rounded bg-skeleton-start" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {popularArtists.map((artist) => (
              <div
                key={artist.id}
                className="group relative cursor-pointer rounded-md bg-card p-4 transition-all hover:bg-surface-elevated"
              >
                <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-accent/10">
                  {artist.imageUrl ? (
                    <Image
                      src={artist.imageUrl}
                      alt={artist.name}
                      fill
                      className="object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music className="h-16 w-16 text-white/30" />
                    </div>
                  )}
                </div>
                <h3 className="truncate font-bold text-white">{artist.name}</h3>
                <p className="truncate text-sm text-muted-foreground">
                  {artist.followersCount.toLocaleString()} followers
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Popular Albums Section */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Popular albums and singles</h2>
          <button className="text-sm font-bold text-muted-foreground hover:underline">
            Show all
          </button>
        </div>

        {loadingAlbums ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square w-full rounded-md bg-skeleton-start" />
                <div className="mt-3 h-4 w-3/4 rounded bg-skeleton-start" />
                <div className="mt-2 h-3 w-1/2 rounded bg-skeleton-start" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {popularAlbums.map((album) => (
              <div
                key={album.id}
                className="group relative cursor-pointer rounded-md bg-card p-4 transition-all hover:bg-surface-elevated"
              >
                <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-md bg-gradient-to-br from-primary/20 to-accent/10">
                  {album.coverImageUrl ? (
                    <Image
                      src={album.coverImageUrl}
                      alt={album.title}
                      fill
                      className="object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music className="h-16 w-16 text-white/30" />
                    </div>
                  )}
                </div>
                <h3 className="truncate font-bold text-white">{album.title}</h3>
                <p className="truncate text-sm text-muted-foreground">
                  {album.artistName}{album.releaseYear ? ` • ${album.releaseYear}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Popular Radio Section */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Popular radio</h2>
          <button className="text-sm font-bold text-muted-foreground hover:underline">
            Show all
          </button>
        </div>

        {loadingPlaylists ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square w-full rounded-md bg-skeleton-start" />
                <div className="mt-3 h-4 w-3/4 rounded bg-skeleton-start" />
                <div className="mt-2 h-3 w-1/2 rounded bg-skeleton-start" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {popularPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                className="group relative cursor-pointer rounded-md bg-card p-4 transition-all hover:bg-surface-elevated"
              >
                <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-md bg-gradient-to-br from-primary/20 to-accent/10">
                  {playlist.coverImageUrl ? (
                    <Image
                      src={playlist.coverImageUrl}
                      alt={playlist.name}
                      fill
                      className="object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music className="h-16 w-16 text-white/30" />
                    </div>
                  )}
                </div>
                <h3 className="truncate font-bold text-white">{playlist.name}</h3>
                <p className="truncate text-sm text-muted-foreground">
                  {playlist.description || 'Playlist'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomeMainView;