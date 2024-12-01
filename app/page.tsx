import Sidebar from './components/Sidebar';
import ImageGenerator from './components/ImageGenerator';

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <ImageGenerator />
        </div>
      </main>
    </div>
  );
}
