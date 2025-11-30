import TopNavBar from '@/components/navigation/top-nav-bar';
import LeftSidebar from '@/components/navigation/left-sidebar';
import HomeMainView from '@/components/content/home-main-view';
import BottomPlayerBar from '@/components/player/bottom-player-bar';

export default function Home() {
  return (
    <div className="flex h-screen flex-col bg-black">
      <TopNavBar />
      
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        
        <main className="flex-1 overflow-y-auto bg-[#121212]" id="main-view">
          <HomeMainView />
        </main>
      </div>
      
      <BottomPlayerBar />
    </div>
  );
}