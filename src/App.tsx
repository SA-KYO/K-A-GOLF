import { useEffect, useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { AdminPage } from './pages/AdminPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { GalleryPage } from './pages/GalleryPage';
import { ScorePhotoPage } from './pages/ScorePhotoPage';
import { ScorePhotoSettingsPage } from './pages/ScorePhotoSettingsPage';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);

    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPath]);

  if (currentPath === '/admin') {
    return <AdminPage />;
  }

  if (currentPath === '/privacy') {
    return <PrivacyPolicy />;
  }

  if (currentPath === '/gallery') {
    return <GalleryPage />;
  }

  if (currentPath === '/score-photo') {
    return <ScorePhotoPage />;
  }

  if (currentPath === '/score-photo-settings') {
    return <ScorePhotoSettingsPage />;
  }

  return <LandingPage />;
}

export default App;
