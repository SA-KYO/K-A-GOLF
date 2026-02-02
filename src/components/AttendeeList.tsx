import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, GolfAttendee } from '../lib/supabase';
import { CheckCircle2, XCircle, MessageSquare, Phone, User, Trash2, Download } from 'lucide-react';

type AttendeeListProps = {
  title: string;
  table: string;
  csvFilePrefix: string;
  showPhone?: boolean;
};

export function AttendeeList({ title, table, csvFilePrefix, showPhone = false }: AttendeeListProps) {
  const [attendees, setAttendees] = useState<GolfAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'attending' | 'not_attending'>('all');

  const fetchAttendees = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setAttendees(data);
      }
    } catch (error) {
      console.error('Error fetching attendees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!supabase) return;
    if (!window.confirm(`${name}さんの回答を削除しますか？`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAttendees(attendees.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting attendee:', error);
      alert('削除に失敗しました');
    }
  };

  const exportToCSV = () => {
    const dataToExport = filteredAttendees;

    if (dataToExport.length === 0) {
      alert('エクスポートするデータがありません');
      return;
    }

    const headers = ['名前'];
    if (showPhone) headers.push('電話番号');
    headers.push('参加状況', 'コメント', '回答日時');

    const csvContent = [
      headers.join(','),
      ...dataToExport.map(attendee => {
        const status = attendee.attendance_status === 'attending' ? '参加' : '不参加';
        const comment = attendee.comment ? `"${attendee.comment.replace(/"/g, '""')}"` : '';
        const date = new Date(attendee.created_at).toLocaleString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });

        return [
          `"${attendee.name}"`,
          ...(showPhone ? [`"${attendee.phone ?? ''}"`] : []),
          status,
          comment,
          `"${date}"`
        ].join(',');
      })
    ].join('\n');

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const filterName = filter === 'all' ? '全員' : filter === 'attending' ? '参加者' : '不参加者';
    const fileName = `${csvFilePrefix}_${filterName}_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    fetchAttendees();

    const channel = supabase
      .channel(`attendees_list_changes_${table}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          fetchAttendees();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="text-center py-12">
        <div className="text-black text-lg font-black">参加者データは準備中です</div>
      </div>
    );
  }

  const filteredAttendees = attendees.filter(attendee => {
    if (filter === 'all') return true;
    return attendee.attendance_status === filter;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse text-black text-lg font-black">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white border-4 border-black p-6 md:p-8" style={{ boxShadow: '8px 8px 0 0 #000' }}>
        <h2 className="text-3xl md:text-4xl font-black text-center mb-8 text-black uppercase">
          {title}
        </h2>

        <div className="flex gap-2 mb-6 flex-wrap justify-center">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 border-4 border-black font-black uppercase transition-all ${
              filter === 'all'
                ? 'bg-yellow-300 text-black'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
            style={filter === 'all' ? { boxShadow: '4px 4px 0 0 #000' } : {}}
          >
            全て ({attendees.length})
          </button>
          <button
            onClick={() => setFilter('attending')}
            className={`px-4 py-2 border-4 border-black font-black uppercase transition-all ${
              filter === 'attending'
                ? 'bg-green-400 text-black'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
            style={filter === 'attending' ? { boxShadow: '4px 4px 0 0 #000' } : {}}
          >
            参加 ({attendees.filter(a => a.attendance_status === 'attending').length})
          </button>
          <button
            onClick={() => setFilter('not_attending')}
            className={`px-4 py-2 border-4 border-black font-black uppercase transition-all ${
              filter === 'not_attending'
                ? 'bg-red-400 text-black'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
            style={filter === 'not_attending' ? { boxShadow: '4px 4px 0 0 #000' } : {}}
          >
            不参加 ({attendees.filter(a => a.attendance_status === 'not_attending').length})
          </button>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={exportToCSV}
            disabled={filteredAttendees.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-blue-400 text-black border-4 border-black font-black uppercase hover:translate-x-0.5 hover:translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ boxShadow: '4px 4px 0 0 #000' }}
          >
            <Download className="w-5 h-5" />
            <span>CSVダウンロード</span>
          </button>
        </div>

        {filteredAttendees.length === 0 ? (
          <div className="text-center py-12 text-black font-bold">
            まだ回答がありません
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAttendees.map((attendee) => (
              <div
                key={attendee.id}
                className={`border-4 border-black p-4 md:p-6 ${
                  attendee.attendance_status === 'attending' ? 'bg-green-200' : 'bg-red-200'
                }`}
                style={{ boxShadow: '6px 6px 0 0 #000' }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-5 h-5 text-black" />
                      <span className="text-lg md:text-xl font-black text-black">
                        {attendee.name}
                      </span>
                      {attendee.attendance_status === 'attending' ? (
                        <CheckCircle2 className="w-6 h-6 text-black" />
                      ) : (
                        <XCircle className="w-6 h-6 text-black" />
                      )}
                    </div>

                    {showPhone && attendee.phone && (
                      <div className="flex items-center gap-2 text-black mb-2 font-bold">
                        <Phone className="w-4 h-4" />
                        <span>{attendee.phone}</span>
                      </div>
                    )}

                    {attendee.comment && (
                      <div className="mt-3 bg-white border-4 border-black p-3">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-black mt-1 flex-shrink-0" />
                          <span className="text-sm text-black font-bold">{attendee.comment}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm text-black font-bold">
                      {new Date(attendee.created_at).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <button
                      onClick={() => handleDelete(attendee.id, attendee.name)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-red-400 text-black hover:translate-x-0.5 hover:translate-y-0.5 border-4 border-black font-black uppercase transition-transform"
                      style={{ boxShadow: '4px 4px 0 0 #000' }}
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>削除</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
