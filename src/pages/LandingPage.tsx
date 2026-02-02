import { useEffect, useRef, useState } from 'react';
import { Countdown } from '../components/Countdown';
import { RSVPForm } from '../components/RSVPForm';
import { AttendeeStats } from '../components/AttendeeStats';
import { MediaUploadSection } from '../components/MediaUploadSection';
import { Calendar, MapPin, Clock, Utensils, Trophy, ExternalLink, DollarSign, Instagram, MessageCircle, Globe, ChevronLeft, ChevronRight, Users, Medal, Target, Check, AlertCircle, Menu, X } from 'lucide-react';

export function LandingPage() {
  const featuredMenus = [
    {
      id: 'shoyu-tsukemen',
      title: '醤油つけ麺',
      price: '1,100円',
      subtitle: 'LIMITED MENU',
      tag: '平日限定',
      description:
        '香り立つ自家製醤油ダレが決め手。数種の醤油を重ねた奥行きあるつけ汁に、魚介と鶏の旨味を丁寧に合わせ、ひと口目から"醤油の立ち上がり"とコクが広がります。北海道産小麦を使った自家製麺は、つけ汁をしっかり抱える程よいコシと喉ごし。〆はスープ割りで、香りと余韻まで楽しんで。',
      image: '/syouyutukemen.jpg',
      note: '数秒ごとに自動でスライドします',
    },
    {
      id: 'spicy-miso',
      title: '特製塩らーめん',
      price: '1,400円',
      subtitle: 'RECOMMENDATION',
      tag: 'おすすめ',
      description:
        '澄んだ塩スープに自家製麺が絡む、当店自慢の塩らーめんに贅沢なトッピングをプラス。バラチャーシュー2枚、肩ロース1枚、味玉、海苔2枚が入った特製仕様で、素材の旨みを最大限に味わえる一杯です。',
      image: '/tokusio.jpg',
      note: '当店自慢の塩らーめんに贅沢なトッピングをプラス',
    },
    {
      id: 'classic-shio',
      title: 'チャーシュー丼',
      price: '600円',
      subtitle: 'ACCOMPANIED BY',
      tag: 'らーめんのお供に',
      description:
        'チャーシューを贅沢にのせた一杯。肉の旨味をしっかり感じられるチャーシューに自家製ダレと卵黄が絡み合う、〆にもぴったりのごちそう丼です。',
      image: '/cha-syu-.jpeg',
      note: 'ごちそう丼',
    },
  ];

  const groupings = [
    {
      label: 'A',
      title: '第1組',
      count: 4,
      color: '#FF5C8A',
      members: [
        { name: '北川彩佳', highlight: true },
        { name: '那須せいか', highlight: true },
        { name: '木田仁也' },
        { name: '小嶋良彦' },
      ],
    },
    {
      label: 'B',
      title: '第2組',
      count: 3,
      color: '#20C997',
      members: [
        { name: '片山祐介' },
        { name: '佐々木杏太' },
        { name: '岡田真明' },
      ],
    },
    {
      label: 'C',
      title: '第3組',
      count: 3,
      color: '#4DA3FF',
      members: [
        { name: '中尾匠' },
        { name: '奥村ひとみ', highlight: true },
        { name: '比嘉唯介' },
      ],
    },
    {
      label: 'D',
      title: '第4組',
      count: 4,
      color: '#FFD54F',
      members: [
        { name: '秋田佳英' },
        { name: '草野耕平' },
        { name: '西川和友' },
        { name: '岩丸太志' },
      ],
    },
  ];

  const specialAwards = [
    {
      title: 'ドラコン賞',
      accent: '#F4B400',
      icon: Target,
      description: '最も飛距離を出した方に贈呈！',
      note: '※指定ホールのみ対象',
    },
    {
      title: 'ニアピン賞',
      accent: '#4DA3FF',
      icon: Trophy,
      description: 'ピンに最も近づけた方に贈呈！',
      note: '※指定ホールのみ対象',
    },
  ];

  const localRules = [
    {
      title: 'スタートティー',
      description: '男性は白、女性は赤で',
    },
    {
      title: '6インチプレース',
      description: 'グリーン以外は手のひらサイズ移動OK',
    },
    {
      title: '2打目からのOB対応',
      description: '暫定を打たずに進んでボールをロストした場合は探している辺りから+2でスタート',
    },
    {
      title: '同伴者が見ていたボール',
      description: 'ラフで落ち葉に隠れている等は+0で探している場所からスタート',
    },
    {
      title: 'グリーン上ワングリップ',
      description: '約30cm程度は入らなくてもOK。OKもらったら1打足す',
    },
    {
      title: 'ハンデ',
      description: 'ダブルペリアの上限なし',
    },
    {
      title: 'その他',
      description: '初心者も参加していますので優しさアリアリで！1日怪我のないように楽しくプレーしましょう！！',
    },
  ];

  const motifIcons = [
    Calendar,
    MapPin,
    Users,
    Trophy,
    Utensils,
    Target,
    Medal,
    Check,
    AlertCircle,
    Clock,
    DollarSign,
    Globe,
  ];


  const [activeSlide, setActiveSlide] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isDjPlaying, setIsDjPlaying] = useState(false);
  const isLineBrowser = typeof navigator !== 'undefined' && /LINE/i.test(navigator.userAgent);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);

  const menuItems = [
    { id: 'top', label: 'トップ' },
    { id: 'event-details', label: 'イベント詳細' },
    { id: 'groupings', label: '組み分け' },
    { id: 'special-awards', label: '特別賞' },
    { id: 'local-rules', label: 'ローカルルール' },
    { id: 'award-ceremony', label: '表彰式' },
    { id: 'after-party', label: '懇親会' },
    { id: 'deadline', label: '回答締め切り' },
    { id: 'score-photo', label: 'スコアフォト' },
    { id: 'popular-menu', label: '人気メニュー' },
    { id: 'dj-booth', label: 'DJブース' },
    { id: 'rsvp-form', label: '懇親会参加申込' },
    { id: 'media-upload', label: '写真・動画アップロード' },
    { id: 'line-register', label: 'LINE登録' },
  ];

  const scrollToForm = () => {
    document.getElementById('rsvp-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMenuSelect = (id: string) => {
    setPendingScrollId(id);
    setIsMenuOpen(false);
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % featuredMenus.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + featuredMenus.length) % featuredMenus.length);
  };

  const goToScorePhoto = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (isLineBrowser) {
      window.location.href = `${window.location.origin}/score-photo?openExternalBrowser=1`;
      return;
    }
    window.history.pushState({}, '', '/score-photo');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const toggleDjSound = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isDjPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setIsDjPlaying(false);
      return;
    }

    try {
      audio.currentTime = 0;
      await audio.play();
      setIsDjPlaying(true);
    } catch (error) {
      console.error('DJ sound playback failed:', error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % featuredMenus.length);
    }, 5200);
    return () => clearInterval(timer);
  }, [featuredMenus.length]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) return;
    if (!pendingScrollId) return;
    const targetId = pendingScrollId;
    setPendingScrollId(null);
    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [isMenuOpen, pendingScrollId]);

  return (
    <div className="min-h-screen bg-yellow-300 animate-page-enter">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xs md:text-sm uppercase tracking-[0.4em] font-semibold text-black">
            K-A GOLF CLUB
          </div>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-controls="site-menu"
            aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            className="group inline-flex items-center gap-3 text-[11px] md:text-xs uppercase tracking-[0.35em] font-semibold text-black"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/40">
              <Menu className="w-4 h-4" />
            </span>
            MENU
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="メニューを閉じる"
            className="absolute inset-0 bg-black/70"
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            id="site-menu"
            className="absolute right-0 top-0 h-screen max-h-screen w-full max-w-xs sm:max-w-sm bg-white/95 border-l border-black/20 px-6 py-8 overflow-y-auto overscroll-contain touch-pan-y h-[100dvh] max-h-[100dvh] pb-[calc(env(safe-area-inset-bottom)+2rem)] backdrop-blur"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="text-lg uppercase tracking-[0.35em] font-semibold text-black">MENU</div>
              <button
                type="button"
                className="rounded-full border border-black/30 px-3 py-2 text-sm font-semibold text-black hover:opacity-80 transition-opacity"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleMenuSelect(item.id)}
                  className="w-full text-left border-b border-black/10 pb-2 text-sm font-semibold text-black tracking-[0.08em] hover:text-black/70 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <section id="top" className="relative min-h-screen flex items-center px-4 pt-28 pb-24 scroll-mt-24"
        style={{
          backgroundImage: 'url(/golf-course-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-yellow-300/70"></div>
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] items-center">
            <div className="text-left">
              <div className="section-eyebrow section-eyebrow--small mb-6">OFFICIAL WEB</div>
            <img
              src="/title-logo.png"
              alt="第一回 希楽夢杯"
                className="w-full max-w-xl h-auto"
            />
              <div className="section-line mt-6" />
              <p className="mt-6 text-sm md:text-base text-black/70 font-semibold tracking-[0.32em] uppercase">
                KIRAMU CUP GOLF COMPETITION 2026
              </p>
              <button
                onClick={scrollToForm}
                className="mt-10 inline-flex items-center gap-3 border border-black/40 px-6 py-3 text-xs md:text-sm uppercase tracking-[0.35em] font-semibold text-black hover:border-black/70 hover:text-black/70 transition-colors"
              >
                懇親会参加申込はこちら
                <span className="text-base">→</span>
              </button>
            </div>

            <div className="bg-white/90 p-6 md:p-10 card-surface">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-black" />
                <h2 className="text-lg md:text-xl font-semibold text-black uppercase tracking-[0.28em]">開催まで</h2>
              </div>
              <Countdown />
            </div>
          </div>
        </div>
      </section>

      <section id="event-details" className="section-wrap bg-yellow-400">
        <div className="site-shell">
          <div className="section-header">
            <span className="section-eyebrow">DETAILS</span>
            <h2 className="section-title text-black">イベント詳細</h2>
            <div className="section-line" />
          </div>

          <div className="motif-panel mb-12">
            <div className="motif-grid">
              {motifIcons.map((Icon, index) => (
                <div key={`motif-${index}`} className="motif-dot">
                  <Icon className="w-5 h-5 text-black" />
                </div>
              ))}
            </div>
          </div>

          <div className="section-grid section-grid--2 mb-12">
            <div className="card-surface p-10">
              <div className="flex items-center justify-center gap-3 mb-8">
                <Calendar className="w-10 h-10" style={{ color: 'var(--accent)' }} />
                <h3 className="text-3xl font-black uppercase" style={{ color: 'var(--accent)' }}>開催日時</h3>
              </div>

              <div className="text-center mb-6">
                <div className="text-6xl md:text-7xl font-black text-black mb-3">
                  3/3
                </div>
                <div className="text-2xl md:text-3xl font-black text-black mb-4">
                  2026年
                </div>
                <div className="inline-block px-6 py-3 bg-white text-black text-xl font-black border-4 border-black" style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}>
                  火曜日
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="time-display-container flex flex-col items-center justify-center gap-3 border-4 border-black p-6 animate-fade-in-scale animate-glow" style={{ backgroundColor: 'var(--accent)', boxShadow: '4px 4px 0 0 var(--shadow-color)' }}>
                  <Clock className="w-10 h-10 text-white animate-clock-rotate" />
                  <div className="text-5xl md:text-7xl font-black text-white animate-pulse-slow">7:50</div>
                  <div className="text-2xl md:text-3xl font-black text-white">スタート室集合</div>
                </div>
                <div className="flex items-center justify-center gap-3 text-black bg-white border-4 border-black p-4">
                  <Trophy className="w-6 h-6 text-black" />
                  <span className="text-base md:text-lg font-bold">08:12〜 嘉納スタート（5組予定）</span>
                </div>
              </div>
            </div>

            <div className="card-surface p-10">
              <div className="flex items-center justify-center gap-3 mb-8">
                <MapPin className="w-10 h-10" style={{ color: 'var(--accent)' }} />
                <h3 className="text-3xl font-black uppercase" style={{ color: 'var(--accent)' }}>ゴルフ会場</h3>
              </div>

              <div className="text-center mb-6">
                <div className="text-3xl md:text-4xl font-black text-black mb-4">
                  🏌️‍♂️ 宇治田原カントリー倶楽部
                </div>
                <div className="bg-white border-4 border-black p-4 mb-4">
                  <p className="text-base md:text-lg text-black font-bold leading-relaxed">
                    〒610-0211<br />
                    京都府綴喜郡宇治田原町<br className="md:hidden" />奥山田長尾31-2
                  </p>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=宇治田原カントリー倶楽部"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white px-6 py-3 border-4 border-black text-lg font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
                  style={{ color: 'var(--accent)', boxShadow: '4px 4px 0 0 var(--shadow-color)' }}
                >
                  <MapPin className="w-5 h-5" />
                  Googleマップで見る
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="card-soft p-8 md:p-12 mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <DollarSign className="w-10 h-10" style={{ color: 'var(--accent)' }} />
              <h3 className="text-3xl font-black uppercase" style={{ color: 'var(--accent)' }}>参加費用</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-white border-4 border-black p-6" style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}>
                <div className="text-center">
                  <p className="text-lg font-bold text-black mb-2">プレー費</p>
                  <p className="text-4xl md:text-5xl font-black mb-2" style={{ color: 'var(--accent)' }}>¥8,180</p>
                  <p className="text-sm md:text-base text-black font-bold">昼食・表彰式ワンドリンク付</p>
                </div>
              </div>
              <div className="bg-white border-4 border-black p-6" style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}>
                <div className="text-center">
                  <p className="text-lg font-bold text-black mb-2">コンペルフィー</p>
                  <p className="text-4xl md:text-5xl font-black mb-2" style={{ color: 'var(--accent)' }}>¥2,000</p>
                  <p className="text-sm md:text-base text-black font-bold">賞品費</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-soft p-8 md:p-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Utensils className="w-8 h-8" style={{ color: 'var(--accent)' }} />
              <Trophy className="w-8 h-8" style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-center mb-8 uppercase" style={{ color: 'var(--accent)' }}>
              イベント内容
            </h3>
            <div className="space-y-6 text-black max-w-3xl mx-auto">
              <div className="bg-white border-4 border-black p-8 md:p-10" style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}>
                <p className="text-3xl md:text-4xl lg:text-5xl leading-tight font-black text-center" style={{ color: 'var(--accent)' }}>
                  麺屋希楽夢<p>初のゴルフコンペ開催！</p>
                </p>
              </div>
              <p className="text-lg md:text-xl leading-relaxed font-bold text-center">
                ・京都府宇治田原町のラーメン屋<p>【麺屋 希楽夢】主催</p>
              </p>
              <p className="text-lg md:text-xl leading-relaxed font-bold text-center">
                ・初心者歓迎／おひとり参加OK
              </p>
              <p className="text-lg md:text-xl leading-relaxed font-bold text-center">
                ・みんなで楽しくラウンドしましょう⛳️
              </p>
            </div>
          </div>

          <div id="groupings" className="card-surface p-8 md:p-12 mt-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Users className="w-9 h-9" style={{ color: 'var(--accent)' }} />
              <h3 className="text-3xl md:text-4xl font-black uppercase" style={{ color: 'var(--accent)' }}>組み分け</h3>
            </div>

            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white border border-black/20 px-6 py-3 text-lg md:text-xl font-semibold text-black rounded-full">
                08:12〜 嘉納スタート
              </div>
            </div>

            <div className="section-grid section-grid--2">
              {groupings.map((group) => (
                <div key={group.label} className="card-surface p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full border border-black/30 flex items-center justify-center text-lg font-semibold text-black"
                        style={{ backgroundColor: group.color }}
                      >
                        {group.label}
                      </div>
                      <div className="text-xl font-semibold text-black">{group.title}</div>
                    </div>
                    <div className="bg-gray-50 border border-black/20 rounded-full px-4 py-1 text-base font-semibold text-black">
                      {group.count}人
                    </div>
                  </div>

                  <div className="border border-dashed border-black/20 rounded-3xl p-4">
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {group.members.map((member) => (
                        <li
                          key={member.name}
                          className="bg-white border border-black/20 rounded-full px-4 py-2 text-center font-semibold"
                        >
                          <span className="inline-flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full border border-black/30 border-dotted bg-gray-200" />
                            <span
                              className="text-black"
                              style={member.highlight ? { color: 'var(--accent)' } : undefined}
                            >
                              {member.name}
                        </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="special-awards" className="card-surface p-8 md:p-12 mt-10">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Medal className="w-10 h-10" style={{ color: 'var(--accent)' }} />
              <h3 className="text-3xl md:text-4xl font-black uppercase" style={{ color: 'var(--accent)' }}>特別賞</h3>
            </div>

            <div className="section-grid section-grid--2">
              {specialAwards.map((award) => {
                const Icon = award.icon;
                return (
                  <div key={award.title} className="card-surface p-6 text-center">
                    <div
                      className="mx-auto mb-4 w-16 h-16 rounded-full border border-black/20 flex items-center justify-center"
                      style={{ backgroundColor: award.accent }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl md:text-3xl font-semibold text-black">{award.title}</div>
                    <div className="w-10 h-[2px] bg-black/20 mx-auto my-4" />
                    <p className="text-base md:text-lg font-semibold text-black/70">{award.description}</p>
                    {award.badge && (
                      <div
                        className="inline-flex items-center justify-center border border-black/20 px-4 py-2 text-sm md:text-base font-semibold mt-5"
                        style={{ backgroundColor: award.accent }}
                      >
                        {award.badge}
                      </div>
                    )}
                    {award.note && (
                      <p className="mt-3 text-sm md:text-base font-semibold text-black/60">{award.note}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div id="local-rules" className="card-surface p-8 md:p-12 mt-10">
            <div className="flex items-center justify-center gap-3 mb-8">
              <AlertCircle className="w-10 h-10" style={{ color: 'var(--accent)' }} />
              <h3 className="text-3xl md:text-4xl font-black uppercase" style={{ color: 'var(--accent)' }}>希楽夢杯ローカルルール</h3>
            </div>

            <div className="section-grid section-grid--2">
              {localRules.map((rule, index) => (
                <div
                  key={rule.title}
                  className="card-surface p-5 md:p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-black/20 bg-yellow-200">
                      <Check className="w-4 h-4 text-black" />
                    </span>
                    <span className="inline-flex items-center justify-center px-3 py-1 border border-black/20 text-xs md:text-sm font-semibold bg-white">
                      RULE {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="border-l border-black/20 pl-4">
                    <div className="text-lg md:text-xl font-semibold text-black">{rule.title}</div>
                    <p className="text-sm md:text-base font-semibold text-black/70 leading-relaxed mt-2">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="award-ceremony" className="card-surface p-8 md:p-12 mt-10">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Trophy className="w-10 h-10" style={{ color: 'var(--accent)' }} />
              <h3 className="text-3xl font-black uppercase" style={{ color: 'var(--accent)' }}>表彰式</h3>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="card-surface p-8">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-semibold text-black mb-4">
                    宇治田原カントリー倶楽部
                  </div>
                  <p className="text-lg md:text-xl text-black/70 font-semibold leading-relaxed">
                    プレー終了後、会場にて表彰式を行います。<br />
                    賞品をご用意しておりますので、お楽しみに！
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div id="after-party" className="card-surface p-8 md:p-12 mt-10">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Utensils className="w-10 h-10" style={{ color: 'var(--accent)' }} />
              <h3 className="text-3xl font-black uppercase" style={{ color: 'var(--accent)' }}>懇親会</h3>
            </div>

            <div className="section-grid section-grid--2">
              <div className="card-surface p-6 md:col-span-2">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-black mb-4">
                    🍜 麺屋 希楽夢
                  </div>
                  <div className="flex items-center justify-center gap-2 text-black mb-4">
                    <Clock className="w-6 h-6" />
                    <span className="text-xl md:text-2xl font-black">18:00〜（予定）</span>
                  </div>
                  <div className="card-soft p-4">
                    <p className="text-base md:text-lg text-black/70 font-semibold leading-relaxed">
                      〒610-0201<br />
                      京都府綴喜郡宇治田原町南亥子90-1
                    </p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-center">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=麺屋希楽夢+京都府綴喜郡宇治田原町南亥子90-1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white px-6 py-3 border border-black/20 text-sm uppercase tracking-[0.25em] font-semibold text-black hover:text-black/70 transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                  Googleマップで見る
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>

              <div className="card-surface p-6">
                <div className="text-center mb-4">
                  <p className="text-lg font-bold text-black mb-2">参加費（食事代）</p>
                  <p className="text-4xl md:text-5xl font-black" style={{ color: 'var(--accent)' }}>¥2,000</p>
                </div>
              </div>

              <div className="card-surface p-6">
                <p className="text-lg text-black/70 font-semibold leading-relaxed text-center">
                  お食事はお鍋を予定しております🍲<br />
                  <span className="text-base">※飲み物は各自でご用意をお願いします。</span>
                </p>
              </div>

              <div className="card-surface p-6 md:col-span-2">
                <p className="text-lg text-black/70 font-semibold leading-relaxed text-center">
                  プレー後は麺屋希楽夢にて<p>懇親会を開催！</p>
                  <p>ゴルフの余韻を<br />楽しみながら、</p><p>美味しい料理とともに交流を深めましょう。</p>
                  <p>※参加自由</p>
                </p>
              </div>

              <div className="card-surface p-6">
                <div className="text-center">
                  <p className="text-xl font-black text-black mb-4">
                    インスタグラムはこちら！
                  </p>
                  <a
                    href="https://www.instagram.com/menya.kiramu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-6 py-3 border border-black/20 text-white text-sm uppercase tracking-[0.25em] font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Instagram className="w-6 h-6" />
                    Instagram
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <div className="card-surface p-6">
                <div className="text-center">
                  <p className="text-xl font-black text-black mb-4">
                    公式LINEはこちら！
                  </p>
                  <a
                    href="https://line.me/R/ti/p/@091wotfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 border border-black/20 text-white text-sm uppercase tracking-[0.25em] font-semibold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#06C755' }}
                  >
                    <MessageCircle className="w-6 h-6" />
                    LINE
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <div className="card-surface p-6">
                <div className="text-center">
                  <p className="text-xl font-black text-black mb-4">
                    希楽夢HPはこちら！
                  </p>
                  <a
                    href="https://menyakiramu.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 border border-black/20 text-white text-sm uppercase tracking-[0.25em] font-semibold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#c78c1b' }}
                  >
                    <Globe className="w-6 h-6" />
                    希楽夢HP
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div id="deadline" className="card-surface p-10 md:p-16 mt-10">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Calendar className="w-10 h-10" style={{ color: 'var(--accent)' }} />
              <h3 className="text-3xl md:text-4xl font-black uppercase" style={{ color: 'var(--accent)' }}>懇親会回答締め切り</h3>
            </div>

            <div className="text-center">
              <div className="card-surface inline-block p-8 md:p-12">
                <div className="text-5xl md:text-7xl font-black mb-4" style={{ color: 'var(--accent)' }}>
                  2026年2月24日
                </div>
                <div className="text-2xl md:text-3xl font-black text-black">
                  までにご回答ください
                </div>
              </div>

              <div className="mt-8 card-soft p-6 max-w-2xl mx-auto">
                <p className="text-lg md:text-xl text-black/70 font-semibold leading-relaxed">
                  期日までにご回答いただけますよう、お願いいたします。締切日を過ぎてもご連絡がない場合は、不参加として扱わせていただきます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="score-photo" className="section-wrap bg-yellow-300">
        <div className="site-shell">
          <div className="section-header">
            <span className="section-eyebrow">SCORE PHOTO</span>
            <h2 className="section-title text-black">スコアフォト作成</h2>
            <p className="text-base md:text-lg text-black/70 font-semibold">
              写真にスコアを重ねて保存できます♪
            </p>
            <div className="section-line" />
          </div>

          <div className="section-grid section-grid--2 items-stretch">
            <div className="card-surface p-6 md:p-8 h-full flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-2 bg-yellow-200 border border-black/20 px-4 py-2 text-xs md:text-sm font-semibold uppercase tracking-[0.2em]">
                  フォーム入力
                </span>
                <span className="text-sm md:text-base font-semibold text-black/60">入力はカンタン</span>
              </div>
              <div className="card-soft p-3">
                <img
                  src="/score-photo-form.png"
                  alt="スコアフォト作成フォーム"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
              <div className="mt-6 grid sm:grid-cols-3 gap-3 text-xs md:text-sm font-semibold text-black">
                <div className="card-soft px-4 py-3 text-center">パー自動反映</div>
                <div className="card-soft px-4 py-3 text-center">合計自動計算</div>
                <div className="card-soft px-4 py-3 text-center">スマホ対応</div>
                <div className="card-soft px-4 py-3 text-center">スコア途中保存</div>
                <div className="card-soft px-4 py-3 text-center">好きな画像選択</div>
                <div className="card-soft px-4 py-3 text-center">大会名入力OK</div>
              </div>
            </div>

            <div className="card-surface p-6 md:p-8 h-full flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-2 bg-yellow-200 border border-black/20 px-4 py-2 text-xs md:text-sm font-semibold uppercase tracking-[0.2em]">
                  完成イメージ
                </span>
                <span className="text-sm md:text-base font-semibold text-black/60">そのまま保存OK</span>
              </div>
              <div className="rounded-2xl overflow-hidden border border-black/20 bg-black/90 p-3">
                <img
                  src="/score-photo-sample.png"
                  alt="スコアフォト完成イメージ"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
              <div className="mt-6 flex flex-col items-center gap-4">
                <button
                  onClick={goToScorePhoto}
                  className="border border-black/30 px-6 md:px-8 py-3 text-xs md:text-sm uppercase tracking-[0.25em] font-semibold text-black hover:text-black/70 transition-colors"
                >
                  スコアフォトを作成する
                </button>
                <p className="text-xs md:text-sm text-black/60 font-semibold text-center">
                  写真を選ぶだけでスコア入り画像が完成します
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-24">
            <div
              className="w-full max-w-lg card-soft p-3"
            >
              <button
                onClick={goToScorePhoto}
                className="w-full border border-black/30 px-6 md:px-10 py-3 text-xs md:text-sm uppercase tracking-[0.25em] font-semibold text-black hover:text-black/70 transition-colors"
              >
                スコアフォトを作成する
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="popular-menu" className="section-wrap bg-yellow-300">
        <div className="site-shell">
          <div className="section-header">
            <span className="section-eyebrow">POPULAR MENU</span>
            <h2 className="section-title text-black">人気メニュー</h2>
            <div className="section-line" />
          </div>

          <div className="relative card-surface p-6 md:p-10 overflow-hidden">
            <div className="section-grid section-grid--2 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 bg-yellow-200 border border-black/20 px-4 py-2 text-xs md:text-sm font-semibold uppercase tracking-[0.25em]">
                  <span className="bg-black/80 text-white px-3 py-1 text-[10px] md:text-xs rounded-full">{featuredMenus[activeSlide].tag}</span>
                  <span className="tracking-[0.2em] text-black/50">{featuredMenus[activeSlide].subtitle}</span>
                </div>

                <div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-black leading-tight mb-2">
                    {featuredMenus[activeSlide].title}
                    <span className="text-2xl md:text-3xl font-semibold ml-2" style={{ color: 'var(--accent)' }}>
                      （{featuredMenus[activeSlide].price}）
                    </span>
                  </h3>
                  <p className="text-base md:text-lg text-black/70 leading-relaxed font-semibold whitespace-pre-line">
                    {featuredMenus[activeSlide].description}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={prevSlide}
                    className="flex items-center justify-center w-11 h-11 bg-white border border-black/20 rounded-full hover:opacity-80 transition-opacity"
                    aria-label="前のメニュー"
                  >
                    <ChevronLeft className="w-6 h-6 text-black" />
                  </button>
                  <div className="flex items-center gap-2">
                    {featuredMenus.map((item, index) => (
                      <span
                        key={item.id}
                        className={`h-3 w-3 rounded-full border border-black/20 transition-all ${index === activeSlide ? 'bg-red-500 w-4' : 'bg-white'}`}
                        aria-label={`${index + 1}枚目`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={nextSlide}
                    className="flex items-center justify-center w-11 h-11 bg-white border border-black/20 rounded-full hover:opacity-80 transition-opacity"
                    aria-label="次のメニュー"
                  >
                    <ChevronRight className="w-6 h-6 text-black" />
                  </button>
                </div>

                <p className="text-sm md:text-base text-black/50 font-semibold">
                  {featuredMenus[activeSlide].note}
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-6 -top-6 w-24 h-24 bg-yellow-200 border border-black/20 rotate-6" />
                <div className="relative card-surface p-4">
                  <img
                    src={featuredMenus[activeSlide].image}
                    alt={featuredMenus[activeSlide].title}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  /> 
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="dj-booth" className="section-wrap bg-yellow-300">
        <div className="site-shell mb-16">
          <AttendeeStats table="after_party_attendees" />
        </div>
        <div className="site-shell">
          <div
            className="relative overflow-hidden bg-black/90 text-white border border-black/20 p-6 md:p-10 rounded-3xl"
          >
            <div
              className="absolute inset-0 opacity-50 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 20% 20%, rgba(0, 245, 255, 0.35), transparent 45%), radial-gradient(circle at 80% 30%, rgba(255, 0, 122, 0.35), transparent 40%), linear-gradient(120deg, rgba(255, 255, 255, 0.05), transparent 60%)',
              }}
            />
            <div className="relative grid gap-8 md:grid-cols-[1.2fr_1fr] items-center">
              <div>
                <div
                  className="inline-flex items-center gap-2 bg-yellow-300 text-black px-3 py-2 border-4 border-black font-black uppercase"
                  style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}
                >
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  KIRAMUブース
                </div>
                <h3 className="mt-4 text-2xl md:text-3xl font-black uppercase tracking-wide" style={{ color: '#00F5FF' }}>
                  KIRAMU DJ SET
                </h3>
                <p className="mt-3 text-sm md:text-base text-white/90 font-bold">
                  レコードボタンを押すと、KOJIMA-Yayyyy!!!が流れます。
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs md:text-sm font-black uppercase text-yellow-300">
                  <span className="px-3 py-1 border-2 border-yellow-300">KOJIMA</span>
                  <span className="px-3 py-1 border-2 border-yellow-300">VINYL</span>
                  <span className="px-3 py-1 border-2 border-yellow-300">HYPE</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="bg-[#1b1b1b] border-4 border-black p-5" style={{ boxShadow: '6px 6px 0 0 var(--shadow-color)' }}>
                    <button
                      type="button"
                      onClick={toggleDjSound}
                      aria-pressed={isDjPlaying}
                      aria-label={isDjPlaying ? 'DJサウンドを停止' : 'DJサウンドを再生'}
                      className={`relative mx-auto flex items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-black bg-red-600 transition-transform focus:outline-none ${
                        isDjPlaying ? 'ring-4 ring-cyan-300/70 scale-105' : 'hover:scale-[1.02]'
                      }`}
                      style={{ boxShadow: '0 0 20px rgba(255, 0, 122, 0.6), 6px 6px 0 0 var(--shadow-color)' }}
                    >
                      <span
                        className={`absolute inset-2 rounded-full border-4 border-black ${isDjPlaying ? 'animate-spin' : ''}`}
                        style={{ background: 'repeating-radial-gradient(circle, #0b0b0b 0 6px, #1f1f1f 6px 12px)' }}
                      />
                      <span className="absolute inset-8 rounded-full bg-yellow-300 border-4 border-black" />
                      <span className="relative text-xs md:text-sm font-black text-black tracking-widest">
                        {isDjPlaying ? 'STOP' : 'PLAY'}
                      </span>
                    </button>
                    <div className="mt-3 text-center text-xs md:text-sm font-bold text-yellow-200">
                      {isDjPlaying ? '再生中...' : 'レコードボタンを押してスタート'}
                    </div>
                    <div className="mt-4 flex flex-col items-center gap-2">
                      <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-cyan-200">
                        BGM LIVE
                      </div>
                      <div className="flex items-end justify-center gap-2 h-10">
                        {[0, 1, 2, 3, 4, 5].map((bar) => (
                          <span
                            key={`dj-eq-${bar}`}
                            className={`w-2 md:w-3 h-10 rounded-full border-2 border-black bg-cyan-300 ${
                              isDjPlaying ? 'animate-dj-eq' : 'opacity-50'
                            }`}
                            style={{ animationDelay: `${bar * 0.12}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <audio
              ref={audioRef}
              src="/Yayyyyy!!.MP4"
              preload="none"
              onEnded={() => setIsDjPlaying(false)}
            />
          </div>
        </div>
      </section>

      <section id="rsvp-form" className="section-wrap bg-yellow-400">
        <div className="site-shell">
          <div className="section-header">
            <span className="section-eyebrow">RSVP</span>
            <h2 className="section-title text-black">懇親会参加申込</h2>
            <p className="text-base md:text-lg text-black/70 font-semibold">
              下記フォームよりご回答ください
            </p>
            <div className="section-line" />
          </div>

          <RSVPForm />
        </div>
      </section>

      <MediaUploadSection />

      <section id="line-register" className="section-wrap--tight bg-yellow-300">
        <div className="site-shell">
          <a
            href="https://line.me/R/ti/p/@091wotfr"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:opacity-90 transition-opacity duration-200"
          >
            <img
              src="/名称_未_設定-1.png"
              alt="麺屋希楽夢 LINE公式アカウント - 営業日、メニュー情報、SNS情報をこちらから登録"
              className="w-full h-auto border border-black/20 rounded-3xl"
              loading="lazy"
            />
          </a>
        </div>
      </section>

      <footer className="bg-yellow-300 text-black py-12 px-4 border-t border-black/10">
        <div className="site-shell text-left">
          <div className="section-eyebrow section-eyebrow--small mb-4">CONTACT</div>
          <h3 className="text-2xl font-semibold mb-4 uppercase tracking-[0.2em]">KIRAMU GOLF COMPETITION 2026</h3>
          <p className="text-black/70 mb-6 font-semibold">
            ご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
          <p className="text-sm text-black/70 font-semibold">
            希楽夢杯実行委員会
          </p>
        </div>
      </footer>
    </div>
  );
}
