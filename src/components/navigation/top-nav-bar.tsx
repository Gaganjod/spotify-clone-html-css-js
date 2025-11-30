"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, LayoutGrid, CircleArrowDown, Home as HomeIcon, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TopNavBar = () => {
    const { data: session, isPending, refetch } = useSession();
    const router = useRouter();

    const handleSignOut = async () => {
      const token = localStorage.getItem("bearer_token");
      const { error } = await authClient.signOut({
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      
      if (error?.code) {
        toast.error(error.code);
      } else {
        localStorage.removeItem("bearer_token");
        refetch();
        toast.success("Logged out successfully");
        router.push("/");
      }
    };

    return (
        <header className="relative grid h-16 grid-cols-[auto_1fr_auto] items-center gap-8 bg-black px-8" data-testid="global-nav-bar">
            <a href="#main-view" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 bg-white text-black p-3 rounded-md font-bold">
                Skip to main content
            </a>
            
            <div className="flex items-center">
                <Link href="/" aria-label="Spotify Home">
                    <Image
                        src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Spotify_Primary_Logo_RGB_Green-1764524529180.png?width=8000&height=8000&resize=contain"
                        alt="Spotify"
                        width={131}
                        height={40}
                        className="h-10 w-auto"
                        priority
                    />
                </Link>
            </div>

            <div className="flex justify-start">
              <div className="flex items-center gap-2 w-full max-w-md">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/70 text-muted-foreground hover:text-white flex-shrink-0">
                  <HomeIcon size={20} />
                </Button>
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="What do you want to play?"
                        className="h-12 w-full rounded-full bg-[#242424] pl-11 pr-11 text-sm font-normal text-white placeholder:text-muted-foreground placeholder:font-medium border-2 border-transparent hover:border-white/10 focus:border-white focus:outline-none"
                        aria-label="What do you want to play?"
                    />
                    <Button variant="ghost" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-white">
                        <LayoutGrid size={20} />
                    </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
                <div className="hidden lg:flex items-center gap-4">
                    <Link href="#" className="text-sm font-bold text-muted-foreground hover:text-white hover:scale-105 transition-transform">Premium</Link>
                    <Link href="#" className="text-sm font-bold text-muted-foreground hover:text-white hover:scale-105 transition-transform">Support</Link>
                    <Link href="#" className="text-sm font-bold text-muted-foreground hover:text-white hover:scale-105 transition-transform">Download</Link>
                </div>
                <div className="h-6 w-px bg-white/60 hidden lg:block mx-2"></div>
                <div className="flex items-center gap-2">
                   <Button asChild variant="ghost" className="hidden sm:flex items-center gap-2 rounded-full text-white text-xs font-bold py-2 px-3 hover:bg-white/10">
                        <Link href="/download">
                           <CircleArrowDown size={20}/>
                           Install App
                        </Link>
                    </Button>
                    
                    {isPending ? (
                      <div className="h-10 w-20 bg-white/10 rounded-full animate-pulse"></div>
                    ) : session?.user ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="default" className="rounded-full bg-white text-black font-bold h-10 px-6 text-sm hover:scale-105 hover:bg-gray-200 transition-transform flex items-center gap-2">
                            <User size={16} />
                            {session.user.name?.split(' ')[0] || 'User'}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-[#282828] border-[#292929] text-white">
                          <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">{session.user.name}</p>
                              <p className="text-xs leading-none text-muted-foreground">
                                {session.user.email}
                              </p>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-[#292929]" />
                          <DropdownMenuItem
                            onClick={handleSignOut}
                            className="cursor-pointer hover:bg-white/10 focus:bg-white/10"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <>
                        <Button asChild variant="ghost" className="rounded-full text-muted-foreground hover:text-white font-bold text-xs px-4 py-2 hover:scale-105 transition-transform">
                            <Link href="/register">
                                Sign up
                            </Link>
                        </Button>
                        <Button asChild variant="default" className="rounded-full bg-white text-black font-bold h-12 px-8 text-sm hover:scale-105 hover:bg-gray-200 transition-transform">
                            <Link href="/login">
                               Log in
                            </Link>
                        </Button>
                      </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopNavBar;