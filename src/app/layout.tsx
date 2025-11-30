import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AudioPlayerProvider } from "@/contexts/audio-player-context";

export const metadata: Metadata = {
  title: "Spotify - Web Player: Music for everyone",
  description: "Spotify is a digital music service that gives you access to millions of songs.",
  icons: {
    icon: [
      { url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/1898fc4b-7fa3-49a9-9393-c7002f243ee5-open-spotify-com/assets/icons/favicon_0f31d2ea-3.ico" },
      { url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/1898fc4b-7fa3-49a9-9393-c7002f243ee5-open-spotify-com/assets/icons/favicon16_1c487bff-2.png", sizes: "16x16", type: "image/png" },
      { url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/1898fc4b-7fa3-49a9-9393-c7002f243ee5-open-spotify-com/assets/icons/favicon32_b64ecc03-1.png", sizes: "32x32", type: "image/png" }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AudioPlayerProvider>
          {children}
        </AudioPlayerProvider>
        <Toaster />
      </body>
    </html>
  );
}