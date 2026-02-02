import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Users } from 'lucide-react';

type AttendeeStatsProps = {
  table?: string;
};

export function AttendeeStats({ table = 'golf_attendees' }: AttendeeStatsProps) {
  const [attendingCount, setAttendingCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from(table)
        .select('attendance_status');

      if (error) throw error;

      if (data) {
        setTotalCount(data.length);
        setAttendingCount(data.filter(a => a.attendance_status === 'attending').length);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    fetchStats();

    const channel = supabase
      .channel(`attendee_stats_changes_${table}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="text-center py-4">
        <div className="text-black font-black">参加状況は準備中です</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-pulse text-black font-black">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-400 border-4 border-black p-6 md:p-8" style={{ boxShadow: '8px 8px 0 0 #000' }}>
      <div className="flex flex-col items-center justify-center gap-2 mb-4">
        <div className="bg-white border-4 border-black px-4 py-2 text-sm md:text-base font-black" style={{ boxShadow: '4px 4px 0 0 #000' }}>
          【懇親会】
        </div>
        <div className="flex items-center justify-center gap-3">
          <Users className="w-8 h-8" style={{ color: '#22C55E' }} />
          <h3 className="text-2xl md:text-3xl font-black uppercase" style={{ color: '#22C55E' }}>現在の参加状況</h3>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:gap-6 mt-6">
        <div className="bg-yellow-400 border-4 border-black p-4 md:p-6 text-center" style={{ boxShadow: '6px 6px 0 0 #000' }}>
          <div className="text-3xl md:text-5xl font-black text-black mb-2">
            {attendingCount}
          </div>
          <div className="text-sm md:text-base text-black font-black uppercase">参加予定</div>
        </div>
        <div className="bg-yellow-400 border-4 border-black p-4 md:p-6 text-center" style={{ boxShadow: '6px 6px 0 0 #000' }}>
          <div className="text-3xl md:text-5xl font-black text-black mb-2">
            {totalCount}
          </div>
          <div className="text-sm md:text-base text-black font-black uppercase">総回答数</div>
        </div>
      </div>
    </div>
  );
}
