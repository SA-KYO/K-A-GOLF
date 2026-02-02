import { useState, useEffect } from 'react';
import { AttendeeList } from '../components/AttendeeList';
import { AdminLogin } from '../components/AdminLogin';
import { MediaUploadAdmin } from '../components/MediaUploadAdmin';
import { ArrowLeft, LogOut } from 'lucide-react';

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('adminAuth');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-yellow-300 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-black hover:underline font-black transition-all uppercase"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>トップページに戻る</span>
          </a>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-red-400 text-black px-4 py-2 border-4 border-black hover:translate-x-0.5 hover:translate-y-0.5 font-black uppercase transition-transform"
            style={{ boxShadow: '4px 4px 0 0 #000' }}
          >
            <LogOut className="w-5 h-5" />
            <span>ログアウト</span>
          </button>
        </div>
        <AttendeeList
          title="メンバー参加者リスト"
          table="golf_attendees"
          csvFilePrefix="メンバー参加者リスト"
          showPhone
        />
        <div className="mt-10">
          <AttendeeList
            title="懇親会参加者リスト"
            table="after_party_attendees"
            csvFilePrefix="懇親会参加者リスト"
          />
        </div>
        <MediaUploadAdmin />
      </div>
    </div>
  );
}
