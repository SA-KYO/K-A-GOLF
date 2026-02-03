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
      icon: Target,
      description: '最も飛距離を出した方に贈呈！',
      note: '※指定ホールのみ対象',
    },
    {
      title: 'ニアピン賞',
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

      <div className="hero-top">
        <img
          src="/title-logo.png"
          alt="第一回 希楽夢杯"
          className="hero-logo"
        />
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-controls="site-menu"
          aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          className="hero-menu flex items-center gap-2"
        >
          <Menu className="w-4 h-4" />
          <span className="hidden sm:inline">MENU</span>
        </button>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[200]">
          <button
            type="button"
            aria-label="メニューを閉じる"
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            id="site-menu"
            className="absolute right-0 top-0 h-screen w-full max-w-sm bg-[#0a0a0a] border-l border-[rgba(0,255,136,0.2)] px-8 py-8 overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex items-center justify-between mb-10">
              <div className="text-sm uppercase tracking-[0.4em] font-medium" style={{ color: 'var(--accent)' }}>Menu</div>
              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center border border-[rgba(0,255,136,0.3)] hover:bg-[rgba(0,255,136,0.1)] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </button>
            </div>
            <nav className="space-y-1">
              {menuItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleMenuSelect(item.id)}
                  className="w-full text-left py-3 px-4 text-sm font-medium tracking-wide hover:bg-[rgba(0,255,136,0.05)] border-b border-[rgba(0,255,136,0.08)] transition-colors flex items-center gap-4 group"
                  style={{ color: 'var(--ink)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--accent)', opacity: 0.5 }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <section id="top" className="hero-banner">
        <div className="site-shell hero-grid">
          <div className="relative z-10">
            <span className="hero-kicker">KIRAMU CUP 2026</span>
            <h1 className="hero-title font-serif-jp">
              希楽夢杯、<br />
              <span className="hero-title-accent glow-text">ゴルフ</span>、<br />
              始メル。
            </h1>
            <div className="hero-lead">
              みんなで楽しくラウンドしながら、<br />
              新しいゴルフの楽しさを体感する一日。
            </div>
            <button onClick={scrollToForm} className="hero-cta">
              懇親会参加申込はこちら
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="hero-visual">
            <div className="hero-photo">
              <img src="/golf-course-bg.jpg" alt="ゴルフ場" />
            </div>
            <div className="hero-countdown">
              <div className="lesson-badge mb-4">COUNTDOWN</div>
              <Countdown />
            </div>
          </div>
        </div>

        <div className="site-shell hero-strip">
          {featuredMenus.map((item) => (
            <div key={item.id} className="strip-card">
              <img src={item.image} alt={item.title} />
              <div>{item.title}</div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border border-[rgba(0,255,136,0.3)] rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-[var(--accent)] rounded-full animate-pulse-slow" />
          </div>
        </div>
      </section>

      <section id="event-details" className="section-wrap">
        <div className="site-shell">
          <div className="section-header">
            <span className="lesson-badge">01</span>
            <span className="section-eyebrow">Event Details</span>
            <h2 className="section-title font-serif-jp">イベント詳細</h2>
            <div className="section-line" />
          </div>

          <div className="motif-panel mb-12">
            <div className="motif-grid">
              {motifIcons.map((Icon, index) => (
                <div key={`motif-${index}`} className="motif-dot">
                  <Icon />
                </div>
              ))}
            </div>
          </div>

          <div className="section-grid section-grid--2 mb-12">
            <div className="card-surface p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <Calendar className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                <h3 className="text-2xl font-medium font-serif-jp" style={{ color: 'var(--ink)' }}>開催日時</h3>
              </div>

              <div className="text-center mb-8">
                <div className="text-6xl md:text-7xl font-bold glow-text mb-2" style={{ color: 'var(--accent)' }}>
                  3/3
                </div>
                <div className="text-xl font-medium mb-4" style={{ color: 'var(--ink-muted)' }}>
                  2026年
                </div>
                <div className="inline-block px-6 py-2 border border-[rgba(0,255,136,0.3)] text-lg font-medium" style={{ color: 'var(--ink)' }}>
                  火曜日
                </div>
              </div>

              <div className="space-y-4">
                <div className="time-display-container flex flex-col items-center justify-center gap-2 border border-[rgba(0,255,136,0.3)] p-6 bg-[rgba(0,255,136,0.05)] animate-glow">
                  <Clock className="w-8 h-8 animate-clock-rotate" style={{ color: 'var(--accent)' }} />
                  <div className="text-4xl md:text-5xl font-bold glow-text" style={{ color: 'var(--accent)' }}>7:50</div>
                  <div className="text-lg font-medium" style={{ color: 'var(--ink)' }}>スタート室集合</div>
                </div>
                <div className="flex items-center justify-center gap-3 p-4 border border-[rgba(0,255,136,0.15)] bg-[rgba(0,255,136,0.03)]">
                  <Trophy className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--ink-muted)' }}>08:12〜 嘉納スタート（5組予定）</span>
                </div>
              </div>
            </div>

            <div className="card-surface p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <MapPin className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                <h3 className="text-2xl font-medium font-serif-jp" style={{ color: 'var(--ink)' }}>ゴルフ会場</h3>
              </div>

              <div className="text-center mb-8">
                <div className="text-2xl md:text-3xl font-medium mb-6 font-serif-jp" style={{ color: 'var(--ink)' }}>
                  宇治田原カントリー倶楽部
                </div>
                <div className="p-4 border border-[rgba(0,255,136,0.15)] bg-[rgba(0,255,136,0.03)] mb-6">
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                    〒610-0211<br />
                    京都府綴喜郡宇治田原町<br className="md:hidden" />奥山田長尾31-2
                  </p>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=宇治田原カントリー倶楽部"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--accent)] text-sm font-medium tracking-wider hover:bg-[var(--accent)] hover:text-[var(--surface)] transition-all"
                  style={{ color: 'var(--accent)' }}
                >
                  <MapPin className="w-4 h-4" />
                  Googleマップで見る
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="card-soft p-8 md:p-12 mb-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              <DollarSign className="w-8 h-8" style={{ color: 'var(--accent)' }} />
              <h3 className="text-2xl font-medium font-serif-jp" style={{ color: 'var(--ink)' }}>参加費用</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="p-6 border border-[rgba(0,255,136,0.2)] bg-[rgba(0,255,136,0.03)] text-center">
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--ink-muted)' }}>プレー費</p>
                <p className="text-4xl font-bold glow-text mb-2" style={{ color: 'var(--accent)' }}>¥8,180</p>
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>昼食・表彰式ワンドリンク付</p>
              </div>
              <div className="p-6 border border-[rgba(0,255,136,0.2)] bg-[rgba(0,255,136,0.03)] text-center">
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--ink-muted)' }}>コンペルフィー</p>
                <p className="text-4xl font-bold glow-text mb-2" style={{ color: 'var(--accent)' }}>¥2,000</p>
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>賞品費</p>
              </div>
            </div>
          </div>

          <div className="card-soft p-8 md:p-12">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Utensils className="w-6 h-6" style={{ color: 'var(--accent)' }} />
              <Trophy className="w-6 h-6" style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="text-2xl font-medium text-center mb-8 font-serif-jp" style={{ color: 'var(--ink)' }}>
              イベント内容
            </h3>
            <div className="max-w-2xl mx-auto space-y-6 text-center">
              <div className="p-6 border border-[rgba(0,255,136,0.3)] bg-[rgba(0,255,136,0.05)]">
                <p className="text-2xl md:text-3xl font-medium font-serif-jp leading-relaxed" style={{ color: 'var(--ink)' }}>
                  麺屋希楽夢<br />初のゴルフコンペ開催！
                </p>
              </div>
              <p className="text-base leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                京都府宇治田原町のラーメン屋<br />【麺屋 希楽夢】主催
              </p>
              <p className="text-base" style={{ color: 'var(--ink-muted)' }}>
                初心者歓迎／おひとり参加OK
              </p>
              <p className="text-base" style={{ color: 'var(--ink-muted)' }}>
                みんなで楽しくラウンドしましょう
              </p>
            </div>
          </div>

          <div id="groupings" className="card-surface p-8 md:p-12 mt-12">
            <div className="section-header">
              <span className="lesson-badge">02</span>
              <span className="section-eyebrow">Groupings</span>
              <h3 className="section-title font-serif-jp">組み分け</h3>
              <div className="section-line" />
            </div>

            <div className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-2 px-6 py-3 border border-[rgba(0,255,136,0.2)] bg-[rgba(0,255,136,0.05)] text-sm font-medium" style={{ color: 'var(--ink)' }}>
                08:12〜 嘉納スタート
              </div>
            </div>

            <div className="section-grid section-grid--2">
              {groupings.map((group) => (
                <div key={group.label} className="card-soft p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 flex items-center justify-center text-lg font-bold border border-[var(--accent)]"
                        style={{ color: 'var(--accent)', background: 'rgba(0,255,136,0.1)' }}
                      >
                        {group.label}
                      </div>
                      <div className="text-lg font-medium" style={{ color: 'var(--ink)' }}>{group.title}</div>
                    </div>
                    <div className="px-3 py-1 border border-[rgba(0,255,136,0.2)] text-sm" style={{ color: 'var(--ink-muted)' }}>
                      {group.count}人
                    </div>
                  </div>

                  <div className="border border-dashed border-[rgba(0,255,136,0.15)] p-4">
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {group.members.map((member) => (
                        <li
                          key={member.name}
                          className="flex items-center gap-2 px-3 py-2 border border-[rgba(0,255,136,0.1)] bg-[rgba(0,255,136,0.02)]"
                        >
                          <span className="w-2 h-2 border border-[rgba(0,255,136,0.3)]" style={{ background: member.highlight ? 'var(--accent)' : 'transparent' }} />
                          <span
                            className="text-sm font-medium"
                            style={{ color: member.highlight ? 'var(--accent)' : 'var(--ink)' }}
                          >
                            {member.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="special-awards" className="card-surface p-8 md:p-12 mt-12">
            <div className="section-header">
              <span className="lesson-badge">03</span>
              <span className="section-eyebrow">Awards</span>
              <h3 className="section-title font-serif-jp">特別賞</h3>
              <div className="section-line" />
            </div>

            <div className="section-grid section-grid--2">
              {specialAwards.map((award) => {
                const Icon = award.icon;
                return (
                  <div key={award.title} className="card-soft p-8 text-center">
                    <div className="mx-auto mb-6 w-16 h-16 flex items-center justify-center border border-[var(--accent)] bg-[rgba(0,255,136,0.1)]">
                      <Icon className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className="text-xl md:text-2xl font-medium mb-4 font-serif-jp" style={{ color: 'var(--ink)' }}>{award.title}</div>
                    <div className="w-12 h-px mx-auto mb-4" style={{ background: 'var(--accent)' }} />
                    <p className="text-sm mb-3" style={{ color: 'var(--ink-muted)' }}>{award.description}</p>
                    {award.note && (
                      <p className="text-xs" style={{ color: 'rgba(232,228,217,0.5)' }}>{award.note}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div id="local-rules" className="card-surface p-8 md:p-12 mt-12">
            <div className="section-header">
              <span className="lesson-badge">04</span>
              <span className="section-eyebrow">Local Rules</span>
              <h3 className="section-title font-serif-jp">希楽夢杯ローカルルール</h3>
              <div className="section-line" />
            </div>

            <div className="section-grid section-grid--2">
              {localRules.map((rule, index) => (
                <div
                  key={rule.title}
                  className="card-soft p-5 md:p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 flex items-center justify-center border border-[var(--accent)]">
                      <Check className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    </span>
                    <span className="text-xs font-medium tracking-wider" style={{ color: 'var(--accent)' }}>
                      RULE {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="pl-11">
                    <div className="text-base font-medium mb-2" style={{ color: 'var(--ink)' }}>{rule.title}</div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="award-ceremony" className="card-surface p-8 md:p-12 mt-12">
            <div className="section-header">
              <span className="lesson-badge">05</span>
              <span className="section-eyebrow">Ceremony</span>
              <h3 className="section-title font-serif-jp">表彰式</h3>
              <div className="section-line" />
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="card-soft p-8 text-center">
                <div className="text-2xl md:text-3xl font-medium mb-6 font-serif-jp" style={{ color: 'var(--ink)' }}>
                  宇治田原カントリー倶楽部
                </div>
                <p className="text-base leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                  プレー終了後、会場にて表彰式を行います。<br />
                  賞品をご用意しておりますので、お楽しみに！
                </p>
              </div>
            </div>
          </div>

          <div id="after-party" className="card-surface p-8 md:p-12 mt-12">
            <div className="section-header">
              <span className="lesson-badge">06</span>
              <span className="section-eyebrow">After Party</span>
              <h3 className="section-title font-serif-jp">懇親会</h3>
              <div className="section-line" />
            </div>

            <div className="section-grid section-grid--2">
              <div className="card-soft p-6 md:col-span-2">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-medium mb-4 font-serif-jp" style={{ color: 'var(--ink)' }}>
                    麺屋 希楽夢
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-6" style={{ color: 'var(--accent)' }}>
                    <Clock className="w-5 h-5" />
                    <span className="text-lg font-medium">18:00〜（予定）</span>
                  </div>
                  <div className="inline-block p-4 border border-[rgba(0,255,136,0.15)] bg-[rgba(0,255,136,0.03)]">
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
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
                  className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--accent)] text-sm font-medium tracking-wider hover:bg-[var(--accent)] hover:text-[var(--surface)] transition-all"
                  style={{ color: 'var(--accent)' }}
                >
                  <MapPin className="w-4 h-4" />
                  Googleマップで見る
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="card-soft p-6 text-center">
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--ink-muted)' }}>参加費（食事代）</p>
                <p className="text-3xl font-bold glow-text" style={{ color: 'var(--accent)' }}>¥2,000</p>
              </div>

              <div className="card-soft p-6">
                <p className="text-sm leading-relaxed text-center" style={{ color: 'var(--ink-muted)' }}>
                  お食事はお鍋を予定しております<br />
                  <span className="text-xs">※飲み物は各自でご用意をお願いします。</span>
                </p>
              </div>

              <div className="card-soft p-6 md:col-span-2">
                <p className="text-base leading-relaxed text-center" style={{ color: 'var(--ink-muted)' }}>
                  プレー後は麺屋希楽夢にて懇親会を開催！<br />
                  ゴルフの余韻を楽しみながら、<br />
                  美味しい料理とともに交流を深めましょう。<br />
                  <span className="text-sm">※参加自由</span>
                </p>
              </div>

              <div className="card-soft p-6 text-center">
                <p className="text-sm font-medium mb-4" style={{ color: 'var(--ink)' }}>
                  インスタグラムはこちら！
                </p>
                <a
                  href="https://www.instagram.com/menya.kiramu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2 border border-[var(--accent)] text-sm font-medium tracking-wider hover:bg-[var(--accent)] hover:text-[var(--surface)] transition-all"
                  style={{ color: 'var(--accent)' }}
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="card-soft p-6 text-center">
                <p className="text-sm font-medium mb-4" style={{ color: 'var(--ink)' }}>
                  公式LINEはこちら！
                </p>
                <a
                  href="https://line.me/R/ti/p/@091wotfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2 border border-[var(--accent)] text-sm font-medium tracking-wider hover:bg-[var(--accent)] hover:text-[var(--surface)] transition-all"
                  style={{ color: 'var(--accent)' }}
                >
                  <MessageCircle className="w-4 h-4" />
                  LINE
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="card-soft p-6 text-center md:col-span-2">
                <p className="text-sm font-medium mb-4" style={{ color: 'var(--ink)' }}>
                  希楽夢HPはこちら！
                </p>
                <a
                  href="https://menyakiramu.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2 border border-[var(--accent)] text-sm font-medium tracking-wider hover:bg-[var(--accent)] hover:text-[var(--surface)] transition-all"
                  style={{ color: 'var(--accent)' }}
                >
                  <Globe className="w-4 h-4" />
                  希楽夢HP
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div id="deadline" className="card-surface p-10 md:p-16 mt-12">
            <div className="section-header">
              <span className="lesson-badge">07</span>
              <span className="section-eyebrow">Deadline</span>
              <h3 className="section-title font-serif-jp">懇親会回答締め切り</h3>
              <div className="section-line" />
            </div>

            <div className="text-center">
              <div className="inline-block p-8 md:p-12 border border-[var(--accent)] bg-[rgba(0,255,136,0.05)]">
                <div className="text-4xl md:text-5xl font-bold glow-text mb-4" style={{ color: 'var(--accent)' }}>
                  2026年2月24日
                </div>
                <div className="text-lg font-medium" style={{ color: 'var(--ink)' }}>
                  までにご回答ください
                </div>
              </div>

              <div className="mt-8 p-6 max-w-xl mx-auto border border-[rgba(0,255,136,0.15)] bg-[rgba(0,255,136,0.03)]">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                  期日までにご回答いただけますよう、お願いいたします。締切日を過ぎてもご連絡がない場合は、不参加として扱わせていただきます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="score-photo" className="section-wrap">
        <div className="site-shell">
          <div className="section-header">
            <span className="lesson-badge">08</span>
            <span className="section-eyebrow">Score Photo</span>
            <h2 className="section-title font-serif-jp">スコアフォト作成</h2>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              写真にスコアを重ねて保存できます
            </p>
            <div className="section-line" />
          </div>

          <div className="section-grid section-grid--2 items-stretch">
            <div className="card-surface p-6 md:p-8 h-full flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <span className="lesson-badge">フォーム入力</span>
                <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>入力はカンタン</span>
              </div>
              <div className="border border-[rgba(0,255,136,0.15)] p-2 flex-1">
                <img
                  src="/score-photo-form.png"
                  alt="スコアフォト作成フォーム"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
              <div className="mt-6 grid sm:grid-cols-3 gap-2 text-xs">
                {['パー自動反映', '合計自動計算', 'スマホ対応', 'スコア途中保存', '好きな画像選択', '大会名入力OK'].map((feature) => (
                  <div key={feature} className="px-3 py-2 text-center border border-[rgba(0,255,136,0.1)] bg-[rgba(0,255,136,0.03)]" style={{ color: 'var(--ink-muted)' }}>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="card-surface p-6 md:p-8 h-full flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <span className="lesson-badge">完成イメージ</span>
                <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>そのまま保存OK</span>
              </div>
              <div className="border border-[rgba(0,255,136,0.15)] p-2 flex-1 bg-black">
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
                  className="px-8 py-3 border border-[var(--accent)] text-sm font-medium tracking-wider hover:bg-[var(--accent)] hover:text-[var(--surface)] transition-all"
                  style={{ color: 'var(--accent)' }}
                >
                  スコアフォトを作成する
                </button>
                <p className="text-xs text-center" style={{ color: 'var(--ink-muted)' }}>
                  写真を選ぶだけでスコア入り画像が完成します
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-16">
            <button
              onClick={goToScorePhoto}
              className="w-full max-w-md px-10 py-4 border border-[var(--accent)] text-sm font-medium tracking-wider hover:bg-[var(--accent)] hover:text-[var(--surface)] transition-all"
              style={{ color: 'var(--accent)' }}
            >
              スコアフォトを作成する
            </button>
          </div>
        </div>
      </section>

      <section id="popular-menu" className="section-wrap">
        <div className="site-shell">
          <div className="section-header">
            <span className="lesson-badge">09</span>
            <span className="section-eyebrow">Popular Menu</span>
            <h2 className="section-title font-serif-jp">人気メニュー</h2>
            <div className="section-line" />
          </div>

          <div className="card-surface p-6 md:p-10">
            <div className="section-grid section-grid--2 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3">
                  <span className="px-3 py-1 text-xs font-medium bg-[var(--accent)] text-[var(--surface)]">{featuredMenus[activeSlide].tag}</span>
                  <span className="text-xs tracking-wider" style={{ color: 'var(--ink-muted)' }}>{featuredMenus[activeSlide].subtitle}</span>
                </div>

                <div>
                  <h3 className="text-2xl md:text-3xl font-medium mb-2 font-serif-jp" style={{ color: 'var(--ink)' }}>
                    {featuredMenus[activeSlide].title}
                    <span className="text-lg md:text-xl ml-2 glow-text" style={{ color: 'var(--accent)' }}>
                      （{featuredMenus[activeSlide].price}）
                    </span>
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--ink-muted)' }}>
                    {featuredMenus[activeSlide].description}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={prevSlide}
                    className="w-10 h-10 flex items-center justify-center border border-[rgba(0,255,136,0.3)] hover:bg-[rgba(0,255,136,0.1)] transition-colors"
                    aria-label="前のメニュー"
                  >
                    <ChevronLeft className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  </button>
                  <div className="flex items-center gap-2">
                    {featuredMenus.map((item, index) => (
                      <span
                        key={item.id}
                        className={`h-2 transition-all ${index === activeSlide ? 'w-6 bg-[var(--accent)]' : 'w-2 bg-[rgba(0,255,136,0.3)]'}`}
                        aria-label={`${index + 1}枚目`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={nextSlide}
                    className="w-10 h-10 flex items-center justify-center border border-[rgba(0,255,136,0.3)] hover:bg-[rgba(0,255,136,0.1)] transition-colors"
                    aria-label="次のメニュー"
                  >
                    <ChevronRight className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  </button>
                </div>

                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                  {featuredMenus[activeSlide].note}
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-4 -top-4 w-20 h-20 border border-[rgba(0,255,136,0.2)] -z-10" />
                <div className="border border-[rgba(0,255,136,0.3)] p-2 bg-black">
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

      <section id="dj-booth" className="section-wrap">
        <div className="site-shell">
          <div className="section-header">
            <span className="lesson-badge">10</span>
            <span className="section-eyebrow">DJ Booth</span>
            <h2 className="section-title font-serif-jp">DJブース</h2>
            <div className="section-line" />
          </div>
        </div>
        <div className="site-shell mb-16">
          <AttendeeStats table="after_party_attendees" />
        </div>
        <div className="site-shell">
          <div className="card-surface p-6 md:p-10">
            <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--accent)] bg-[rgba(0,255,136,0.1)] mb-4">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
                  <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>KIRAMUブース</span>
                </div>
                <h3 className="text-xl md:text-2xl font-medium mb-4 font-serif-jp glow-text" style={{ color: 'var(--accent)' }}>
                  KIRAMU DJ SET
                </h3>
                <p className="text-sm mb-6" style={{ color: 'var(--ink-muted)' }}>
                  レコードボタンを押すと、KOJIMA-Yayyyy!!!が流れます。
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['KOJIMA', 'VINYL', 'HYPE'].map((tag) => (
                    <span key={tag} className="px-3 py-1 border border-[rgba(0,255,136,0.2)]" style={{ color: 'var(--ink-muted)' }}>{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 border border-[rgba(0,255,136,0.2)] bg-[rgba(0,0,0,0.5)]">
                  <button
                    type="button"
                    onClick={toggleDjSound}
                    aria-pressed={isDjPlaying}
                    aria-label={isDjPlaying ? 'DJサウンドを停止' : 'DJサウンドを再生'}
                    className={`relative mx-auto flex items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-[var(--accent)] transition-all ${
                      isDjPlaying ? 'scale-105 shadow-[0_0_30px_rgba(0,255,136,0.4)]' : 'hover:shadow-[0_0_20px_rgba(0,255,136,0.2)]'
                    }`}
                    style={{ background: 'linear-gradient(145deg, #0a3d2a, #0a0a0a)' }}
                  >
                    <span
                      className={`absolute inset-3 rounded-full border border-[rgba(0,255,136,0.3)] ${isDjPlaying ? 'animate-spin' : ''}`}
                      style={{ background: 'repeating-radial-gradient(circle, #0a0a0a 0 4px, #151515 4px 8px)' }}
                    />
                    <span className="absolute inset-10 rounded-full bg-[var(--accent)]" style={{ opacity: 0.2 }} />
                    <span className="relative text-xs font-medium tracking-widest" style={{ color: 'var(--accent)' }}>
                      {isDjPlaying ? 'STOP' : 'PLAY'}
                    </span>
                  </button>
                  <div className="mt-4 text-center text-xs" style={{ color: 'var(--ink-muted)' }}>
                    {isDjPlaying ? '再生中...' : 'レコードボタンを押してスタート'}
                  </div>
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <div className="text-[10px] tracking-widest" style={{ color: 'var(--accent)' }}>
                      BGM LIVE
                    </div>
                    <div className="flex items-end justify-center gap-1 h-8">
                      {[0, 1, 2, 3, 4, 5].map((bar) => (
                        <span
                          key={`dj-eq-${bar}`}
                          className={`w-2 h-8 ${isDjPlaying ? 'animate-dj-eq' : 'opacity-30'}`}
                          style={{
                            background: 'var(--accent)',
                            animationDelay: `${bar * 0.12}s`
                          }}
                        />
                      ))}
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

      <section id="rsvp-form" className="section-wrap">
        <div className="site-shell">
          <div className="section-header">
            <span className="lesson-badge">11</span>
            <span className="section-eyebrow">RSVP</span>
            <h2 className="section-title font-serif-jp">懇親会参加申込</h2>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              下記フォームよりご回答ください
            </p>
            <div className="section-line" />
          </div>

          <RSVPForm />
        </div>
      </section>

      <MediaUploadSection />

      <section id="line-register" className="section-wrap--tight">
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
              className="w-full h-auto border border-[rgba(0,255,136,0.2)]"
              loading="lazy"
            />
          </a>
        </div>
      </section>

      <footer className="py-16 px-4 border-t border-[rgba(0,255,136,0.1)]" style={{ background: 'var(--surface)' }}>
        <div className="site-shell text-center">
          <div className="text-xs tracking-[0.5em] mb-4" style={{ color: 'var(--accent)' }}>CONTACT</div>
          <h3 className="text-xl font-medium mb-6 tracking-wider font-serif-jp" style={{ color: 'var(--ink)' }}>KIRAMU GOLF COMPETITION 2026</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--ink-muted)' }}>
            ご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
          <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            希楽夢杯実行委員会
          </p>
        </div>
      </footer>
    </div>
  );
}
