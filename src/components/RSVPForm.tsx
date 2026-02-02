import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CheckCircle2 } from 'lucide-react';

export function RSVPForm() {
  const [formData, setFormData] = useState({
    name: '',
    attendance_status: '',
    comment: '',
  });
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="max-w-2xl mx-auto bg-yellow-400 border-4 border-black p-8 md:p-12 text-center" style={{ boxShadow: '8px 8px 0 0 var(--shadow-color)' }}>
        <h3 className="text-2xl md:text-3xl font-black text-black mb-4 uppercase">
          準備中
        </h3>
        <p className="text-black font-bold">
          懇親会参加申込フォームは現在準備中です。少し時間をおいてからご確認ください。
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.attendance_status) {
      setError('必須項目を入力してください');
      return;
    }

    if (!agreedToPrivacy) {
      setError('プライバシーポリシーに同意してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from('after_party_attendees')
        .insert([
          {
            name: formData.name,
            attendance_status: formData.attendance_status,
            comment: formData.comment || null,
          },
        ]);

      if (insertError) throw insertError;

      setIsSubmitted(true);
      setFormData({ name: '', attendance_status: '', comment: '' });
      setAgreedToPrivacy(false);
    } catch (err) {
      setError('送信中にエラーが発生しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto bg-yellow-400 border-4 border-black p-8 md:p-12 text-center" style={{ boxShadow: '8px 8px 0 0 var(--shadow-color)' }}>
        <CheckCircle2 className="w-20 h-20 text-black mx-auto mb-4" />
        <h3 className="text-2xl md:text-3xl font-black text-black mb-4 uppercase">
          ご回答ありがとうございます
        </h3>
        <p className="text-black mb-6 font-bold">
          懇親会参加申込を受け付けました。当日お会いできることを楽しみにしております。
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="bg-yellow-400 px-8 py-3 border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-transform font-black uppercase"
          style={{ color: '#22C55E', boxShadow: '6px 6px 0 0 var(--shadow-color)' }}
        >
          別の方の回答を入力
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white border-4 border-black p-8 md:p-12" style={{ boxShadow: '8px 8px 0 0 var(--shadow-color)' }}>
      <h3 className="text-2xl md:text-3xl font-black text-center mb-8 text-black uppercase">
        懇親会参加申込フォーム
      </h3>

      {error && (
        <div className="bg-red-400 border-4 border-black text-black px-4 py-3 mb-6 font-bold">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-black text-black mb-2 uppercase">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-0 font-bold"
            placeholder="山田 太郎"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-black text-black mb-3 uppercase">
            出欠確認 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="attendance"
                value="attending"
                checked={formData.attendance_status === 'attending'}
                onChange={(e) => setFormData({ ...formData, attendance_status: e.target.value })}
                className="sr-only"
                required
              />
              <div
                className={`border-4 border-black p-4 text-center transition-all ${
                  formData.attendance_status === 'attending'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-white hover:bg-gray-100'
                }`}
                style={formData.attendance_status === 'attending' ? { boxShadow: '4px 4px 0 0 var(--shadow-color)' } : {}}
              >
                <div className="text-lg font-black uppercase">参加する</div>
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="attendance"
                value="not_attending"
                checked={formData.attendance_status === 'not_attending'}
                onChange={(e) => setFormData({ ...formData, attendance_status: e.target.value })}
                className="sr-only"
              />
              <div
                className={`border-4 border-black p-4 text-center transition-all ${
                  formData.attendance_status === 'not_attending'
                    ? 'bg-yellow-400'
                    : 'bg-white hover:bg-gray-100'
                }`}
                style={formData.attendance_status === 'not_attending' ? { color: '#22C55E', boxShadow: '4px 4px 0 0 var(--shadow-color)' } : {}}
              >
                <div className="text-lg font-black uppercase">参加しない</div>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-black text-black mb-2 uppercase">
            コメント・メッセージ
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-0 resize-none font-bold"
            rows={4}
            placeholder="何かメッセージがあればご記入ください"
          />
        </div>

        <div className="bg-gray-50 border-4 border-black p-6" style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}>
          <div className="text-center mb-4">
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/privacy');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="inline-block bg-yellow-400 px-8 py-3 border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-transform font-black text-black uppercase"
              style={{ boxShadow: '6px 6px 0 0 var(--shadow-color)', fontSize: '16px' }}
            >
              プライバシーポリシー
            </a>
          </div>

          <label className="flex items-center justify-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedToPrivacy}
              onChange={(e) => setAgreedToPrivacy(e.target.checked)}
              className="w-5 h-5 border-4 border-black cursor-pointer accent-yellow-400 focus:ring-2 focus:ring-black"
              style={{ minWidth: '20px', minHeight: '20px' }}
            />
            <span className="font-bold text-black text-sm md:text-base group-hover:text-gray-700 transition-colors select-none">
              プライバシーポリシーに同意します <span className="text-red-500">*</span>
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !agreedToPrivacy}
          className="w-full bg-yellow-400 text-black py-4 border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-transform font-black text-lg uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ boxShadow: '6px 6px 0 0 var(--shadow-color)' }}
        >
          {isSubmitting ? '送信中...' : '回答を送信する'}
        </button>
      </div>
    </form>
  );
}
