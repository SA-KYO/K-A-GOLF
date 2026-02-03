import { useEffect, useRef, useState } from 'react';
import { Countdown } from '../components/Countdown';
import { RSVPForm } from '../components/RSVPForm';
import { AttendeeStats } from '../components/AttendeeStats';
import { MediaUploadSection } from '../components/MediaUploadSection';
import { Calendar, MapPin, Clock, Utensils, Trophy, ExternalLink, DollarSign, Instagram, MessageCircle, Globe, ChevronLeft, ChevronRight, Users, Medal, Target, Check, AlertCircle, Menu, X } from 'lucide-react';

const SmokeSVG = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M200 600C200 600 50 450 80 300C110 150 200 100 200 0C200 100 290 150 320 300C350 450 200 600 200 600Z" fill="currentColor" />
    <path d="M150 500C150 500 50 400 70 280C90 160 150 120 150 50C150 120 210 160 230 280C250 400 150 500 150 500Z" fill="currentColor" opacity="0.6" />
    <path d="M250 550C250 550 350 420 330 290C310 160 250 110 250 30C250 110 190 160 170 290C150 420 250 550 250 550Z" fill="currentColor" opacity="0.4" />
  </svg>
);

const StampSVG = ({ className, text }: { className?: string; text: string }) => (
  <div className={`${className} relative`}>
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="5" y="5" width="90" height="110" fill="#c41e3a" stroke="#8b0000" strokeWidth="3" />
      <rect x="10" y="10" width="80" height="100" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-white font-bold text-xs writing-vertical whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
        {text}
      </span>
    </div>
  </div>
);

export function LandingPage() {
  const featuredMenus = [
    {
      id: 'shoyu-tsukemen',
      title: '醤油つけ麺',
      price: '1,100円',
      subtitle: 'LIMITED MENU',
      tag: '平日限定',
      description:
        '香り立つ自家製醤油ダレが決め手。数種の醤油を重ねた奥行きあるつけ汁に、魚介と鶏の旨味を丁寧に合わせ、ひと口目から"醤油の立ち上がり"とコクが広がります。',
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
        '澄んだ塩スープに自家製麺が絡む、当店自慢の塩らーめんに贅沢なトッピングをプラス。バラチャーシュー2枚、肩ロース1枚、味玉、海苔2枚が入った特製仕様。',
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
    { title: 'スタートティー', description: '男性は白、女性は赤で' },
    { title: '6インチプレース', description: 'グリーン以外は手のひらサイズ移動OK' },
    { title: '2打目からのOB対応', description: '暫定を打たずに進んでボールをロストした場合は探している辺りから+2でスタート' },
    { title: '同伴者が見ていたボール', description: 'ラフで落ち葉に隠れている等は+0で探している場所からスタート' },
    { title: 'グリーン上ワングリップ', description: '約30cm程度は入らなくてもOK。OKもらったら1打足す' },
    { title: 'ハンデ', description: 'ダブルペリアの上限なし' },
    { title: 'その他', description: '初心者も参加していますので優しさアリアリで！1日怪我のないように楽しくプレーしましょう！！' },
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isDjPlaying, setIsDjPlaying] = useState(false);
  const isLineBrowser = typeof navigator !== 'undefined' && /LINE/i.test(navigator.userAgent);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);

  const menuItems = [
    { id: 'top', label: 'トップ', en: 'TOP' },
    { id: 'event-details', label: 'イベント詳細', en: 'EVENT' },
    { id: 'groupings', label: '組み分け', en: 'GROUPINGS' },
    { id: 'special-awards', label: '特別賞', en: 'AWARDS' },
    { id: 'local-rules', label: 'ローカルルール', en: 'RULES' },
    { id: 'award-ceremony', label: '表彰式', en: 'CEREMONY' },
    { id: 'after-party', label: '懇親会', en: 'PARTY' },
    { id: 'deadline', label: '回答締め切り', en: 'DEADLINE' },
    { id: 'score-photo', label: 'スコアフォト', en: 'PHOTO' },
    { id: 'popular-menu', label: '人気メニュー', en: 'MENU' },
    { id: 'dj-booth', label: 'DJブース', en: 'DJ' },
    { id: 'rsvp-form', label: '懇親会参加申込', en: 'RSVP' },
    { id: 'media-upload', label: '写真・動画', en: 'UPLOAD' },
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
    <div className="min-h-screen bg-dark animate-page-enter">
      <div className="hero-top">
        <img src="/title-logo.png" alt="第一回 希楽夢杯" className="hero-logo" />
        <nav className="hidden md:flex items-center gap-8">
          {['TOP', '喰王について', 'ファイター紹介', '最新情報'].map((item, i) => (
            <span key={i} className="nav-link cursor-pointer">{item}</span>
          ))}
        </nav>
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
            className="absolute left-0 top-0 h-screen w-full max-w-2xl bg-[#0a0a0a] px-8 py-24 overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <button
              type="button"
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center border border-white/30 hover:bg-white hover:text-black transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleMenuSelect(item.id)}
                  className="w-full text-left py-3 group flex items-baseline gap-4 hover:text-[#c41e3a] transition-colors"
                >
                  <span className="text-4xl md:text-5xl font-black tracking-tight uppercase">{item.en}</span>
                  <span className="text-sm text-gray-500 group-hover:text-[#c41e3a]">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <section id="top" className="hero-banner relative">
        <SmokeSVG className="smoke-decoration smoke-left text-white/10 animate-smoke" />
        <SmokeSVG className="smoke-decoration smoke-right text-white/10 animate-smoke" style={{ animationDelay: '-4s' }} />

        <div className="site-shell hero-grid">
          <div className="relative z-10">
            <span className="hero-kicker">KIRAMU CUP 2026</span>
            <h1 className="hero-title font-serif-jp">
              希楽夢杯、<br />
              <span className="hero-title-accent">ゴルフ</span>、<br />
              始メル。
            </h1>
            <div className="hero-lead">
              一打一打にドラマがある。<br />
              コースに立つ者は皆、己を賭けて挑む挑戦者。<br />
              仲間の心を掴み、<br />
              ゴルフの情熱を伝える——<br />
              それが「希楽夢杯」。
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
            <StampSVG className="absolute -right-4 top-8 w-20 h-24" text="希楽夢杯" />
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
      </section>

      <section id="event-details" className="section-dark relative">
        <SmokeSVG className="smoke-decoration smoke-right text-white/5" />

        <div className="site-shell">
          <div className="section-header">
            <div className="section-en-title">EVENT</div>
            <div className="section-jp-title font-serif-jp">イベント詳細</div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="card-dark p-8 relative">
              <StampSVG className="absolute -right-4 -top-4 w-16 h-20" text="開催日" />
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-8 h-8 text-[#c41e3a]" />
                <h3 className="text-2xl font-bold font-serif-jp">開催日時</h3>
              </div>
              <div className="text-center mb-8">
                <div className="text-7xl md:text-8xl font-black mb-2 text-[#c41e3a]">3/3</div>
                <div className="text-xl font-medium mb-4 text-gray-400">2026年</div>
                <div className="inline-block px-6 py-2 border-2 border-[#c41e3a] text-lg font-semibold">火曜日</div>
              </div>
              <div className="space-y-4">
                <div className="time-display-container flex flex-col items-center justify-center gap-2 border-2 border-[#c41e3a] p-6 bg-black/50">
                  <Clock className="w-8 h-8 animate-clock-rotate text-[#c41e3a]" />
                  <div className="text-5xl md:text-6xl font-black text-[#c41e3a]">7:50</div>
                  <div className="text-lg font-semibold">スタート室集合</div>
                </div>
                <div className="flex items-center justify-center gap-3 p-4 border border-white/20 bg-black/30">
                  <Trophy className="w-5 h-5 text-[#c41e3a]" />
                  <span className="text-sm font-medium text-gray-400">08:12〜 嘉納スタート（5組予定）</span>
                </div>
              </div>
            </div>

            <div className="card-dark p-8">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-8 h-8 text-[#c41e3a]" />
                <h3 className="text-2xl font-bold font-serif-jp">ゴルフ会場</h3>
              </div>
              <div className="text-center mb-8">
                <div className="text-2xl md:text-3xl font-bold mb-6 font-serif-jp">宇治田原カントリー倶楽部</div>
                <div className="p-4 border border-white/20 bg-black/30 mb-6">
                  <p className="text-sm leading-relaxed text-gray-400">
                    〒610-0211<br />
                    京都府綴喜郡宇治田原町<br className="md:hidden" />奥山田長尾31-2
                  </p>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=宇治田原カントリー倶楽部"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-sm font-semibold tracking-wider hover:bg-white hover:text-black transition-all"
                >
                  <MapPin className="w-4 h-4" />
                  Googleマップで見る
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="card-dark p-8 md:p-12 mb-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              <DollarSign className="w-8 h-8 text-[#c41e3a]" />
              <h3 className="text-2xl font-bold font-serif-jp">参加費用</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="p-6 border-2 border-[#c41e3a] bg-black/50 text-center">
                <p className="text-sm font-semibold mb-2 text-gray-400">プレー費</p>
                <p className="text-5xl font-black mb-2 text-[#c41e3a]">¥8,180</p>
                <p className="text-xs text-gray-500">昼食・表彰式ワンドリンク付</p>
              </div>
              <div className="p-6 border-2 border-[#c41e3a] bg-black/50 text-center">
                <p className="text-sm font-semibold mb-2 text-gray-400">コンペルフィー</p>
                <p className="text-5xl font-black mb-2 text-[#c41e3a]">¥2,000</p>
                <p className="text-xs text-gray-500">賞品費</p>
              </div>
            </div>
          </div>

          <div className="card-dark p-8 md:p-12">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Utensils className="w-6 h-6 text-[#c41e3a]" />
              <Trophy className="w-6 h-6 text-[#c41e3a]" />
            </div>
            <h3 className="text-2xl font-bold text-center mb-8 font-serif-jp">イベント内容</h3>
            <div className="max-w-2xl mx-auto space-y-6 text-center">
              <div className="p-6 border-2 border-[#c41e3a] bg-black/50">
                <p className="text-3xl md:text-4xl font-black font-serif-jp leading-relaxed">
                  麺屋希楽夢<br />初のゴルフコンペ開催！
                </p>
              </div>
              <p className="text-base leading-relaxed text-gray-400">
                京都府宇治田原町のラーメン屋<br />【麺屋 希楽夢】主催
              </p>
              <p className="text-base text-gray-500">初心者歓迎／おひとり参加OK</p>
            </div>
          </div>
        </div>
      </section>

      <section id="groupings" className="section-texture relative">
        <SmokeSVG className="smoke-decoration smoke-left text-white/10" />

        <div className="site-shell">
          <div className="section-header">
            <div className="section-en-title">GROUPINGS</div>
            <div className="section-jp-title font-serif-jp">組み分け</div>
          </div>

          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#c41e3a] bg-black/50 text-sm font-semibold">
              08:12〜 嘉納スタート
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {groupings.map((group) => (
              <div key={group.label} className="card-frame p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 flex items-center justify-center text-2xl font-black border-2 border-[#c41e3a] bg-black text-[#c41e3a]">
                      {group.label}
                    </div>
                    <div className="text-xl font-bold">{group.title}</div>
                  </div>
                  <div className="px-3 py-1 border border-white/30 text-sm text-gray-400">{group.count}人</div>
                </div>
                <div className="border border-dashed border-[#c41e3a] p-4 bg-black/30">
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {group.members.map((member) => (
                      <li key={member.name} className="flex items-center gap-2 px-3 py-2 border border-white/10 bg-black/50">
                        <span className={`w-2 h-2 border ${member.highlight ? 'border-[#c41e3a] bg-[#c41e3a]' : 'border-white/50 bg-transparent'}`} />
                        <span className={`text-sm font-medium ${member.highlight ? 'text-[#c41e3a]' : 'text-white'}`}>{member.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="special-awards" className="section-dark relative">
        <StampSVG className="absolute right-8 top-16 w-20 h-24" text="特別賞" />

        <div className="site-shell">
          <div className="section-header">
            <div className="section-en-title">AWARDS</div>
            <div className="section-jp-title font-serif-jp">特別賞</div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {specialAwards.map((award) => {
              const Icon = award.icon;
              return (
                <div key={award.title} className="card-frame p-8 text-center">
                  <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center border-2 border-[#c41e3a] bg-black">
                    <Icon className="w-10 h-10 text-[#c41e3a]" />
                  </div>
                  <div className="text-2xl md:text-3xl font-black mb-4 font-serif-jp">{award.title}</div>
                  <div className="w-16 h-1 mx-auto mb-4 bg-[#c41e3a]" />
                  <p className="text-sm mb-3 text-gray-400">{award.description}</p>
                  {award.note && <p className="text-xs text-gray-600">{award.note}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="local-rules" className="section-texture relative">
        <SmokeSVG className="smoke-decoration smoke-right text-white/10" />

        <div className="site-shell">
          <div className="section-header">
            <div className="section-en-title">RULES</div>
            <div className="section-jp-title font-serif-jp">希楽夢杯ローカルルール</div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {localRules.map((rule, index) => (
              <div key={rule.title} className="card-dark p-5 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 flex items-center justify-center border-2 border-[#c41e3a] bg-black">
                    <Check className="w-5 h-5 text-[#c41e3a]" />
                  </span>
                  <span className="text-xs font-semibold tracking-wider text-[#c41e3a]">
                    RULE {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="pl-13">
                  <div className="text-base font-semibold mb-2">{rule.title}</div>
                  <p className="text-sm leading-relaxed text-gray-400">{rule.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="award-ceremony" className="section-dark relative">
        <div className="site-shell">
          <div className="section-header">
            <div className="section-en-title">CEREMONY</div>
            <div className="section-jp-title font-serif-jp">表彰式</div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="card-frame p-8 text-center">
              <div className="text-3xl md:text-4xl font-black mb-6 font-serif-jp">宇治田原カントリー倶楽部</div>
              <p className="text-base leading-relaxed text-gray-400">
                プレー終了後、会場にて表彰式を行います。<br />
                賞品をご用意しておりますので、お楽しみに！
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="after-party" className="section-texture relative">
        <SmokeSVG className="smoke-decoration smoke-left text-white/10" />
        <StampSVG className="absolute right-8 top-16 w-20 h-24" text="懇親会" />

        <div className="site-shell">
          <div className="section-header">
            <div className="section-en-title">AFTER PARTY</div>
            <div className="section-jp-title font-serif-jp">懇親会</div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card-dark p-8 md:col-span-2">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black mb-4 font-serif-jp">麺屋 希楽夢</div>
                <div className="flex items-center justify-center gap-2 mb-6 text-[#c41e3a]">
                  <Clock className="w-5 h-5" />
                  <span className="text-xl font-bold">18:00〜（予定）</span>
                </div>
                <div className="inline-block p-4 border-2 border-[#c41e3a] bg-black/50">
                  <p className="text-sm leading-relaxed text-gray-400">
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
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-sm font-semibold tracking-wider hover:bg-white hover:text-black transition-all"
              >
                <MapPin className="w-4 h-4" />
                Googleマップで見る
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="card-dark p-6 text-center">
              <p className="text-sm font-semibold mb-2 text-gray-400">参加費（食事代）</p>
              <p className="text-4xl font-black text-[#c41e3a]">¥2,000</p>
            </div>

            <div className="card-dark p-6">
              <p className="text-sm leading-relaxed text-center text-gray-400">
                お食事はお鍋を予定しております<br />
                <span className="text-xs">※飲み物は各自でご用意をお願いします。</span>
              </p>
            </div>

            <div className="card-dark p-6 md:col-span-2">
              <p className="text-base leading-relaxed text-center text-gray-400">
                プレー後は麺屋希楽夢にて懇親会を開催！<br />
                ゴルフの余韻を楽しみながら、<br />
                美味しい料理とともに交流を深めましょう。<br />
                <span className="text-sm">※参加自由</span>
              </p>
            </div>

            <div className="card-dark p-6 text-center">
              <p className="text-sm font-semibold mb-4">インスタグラムはこちら！</p>
              <a
                href="https://www.instagram.com/menya.kiramu/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 border-2 border-[#c41e3a] text-sm font-semibold tracking-wider text-[#c41e3a] hover:bg-[#c41e3a] hover:text-white transition-all"
              >
                <Instagram className="w-4 h-4" />
                Instagram
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="card-dark p-6 text-center">
              <p className="text-sm font-semibold mb-4">公式LINEはこちら！</p>
              <a
                href="https://line.me/R/ti/p/@091wotfr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 border-2 border-[#c41e3a] text-sm font-semibold tracking-wider text-[#c41e3a] hover:bg-[#c41e3a] hover:text-white transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                LINE
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="card-dark p-6 text-center md:col-span-2">
              <p className="text-sm font-semibold mb-4">希楽夢HPはこちら！</p>
              <a
                href="https://menyakiramu.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 border-2 border-[#c41e3a] text-sm font-semibold tracking-wider text-[#c41e3a] hover:bg-[#c41e3a] hover:text-white transition-all"
              >
                <Globe className="w-4 h-4" />
                希楽夢HP
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="deadline" className="section-dark relative">
        <div className="site-shell">
          <div className="section-header section-header--center">
            <div className="section-en-title">DEADLINE</div>
            <div className="section-jp-title font-serif-jp">懇親会回答締め切り</div>
          </div>

          <div className="text-center">
            <div className="inline-block p-8 md:p-12 border-2 border-[#c41e3a] bg-black/50">
              <div className="text-5xl md:text-7xl font-black mb-4 text-[#c41e3a]">2026年2月24日</div>
              <div className="text-xl font-bold">までにご回答ください</div>
            </div>

            <div className="mt-8 p-6 max-w-xl mx-auto border-2 border-[#c41e3a] bg-black/50">
              <p className="text-sm leading-relaxed text-gray-400">
                期日までにご回答いただけますよう、お願いいたします。締切日を過ぎてもご連絡がない場合は、不参加として扱わせていただきます。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="score-photo" className="section-texture relative">
        <SmokeSVG className="smoke-decoration smoke-right text-white/10" />

        <div className="site-shell">
          <div className="section-header">
            <div className="section-en-title">SCORE PHOTO</div>
            <div className="section-jp-title font-serif-jp">スコアフォト作成</div>
            <p className="section-jp-sub">写真にスコアを重ねて保存できます</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card-dark p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <span className="lesson-badge">フォーム入力</span>
                <span className="text-xs text-gray-500">入力はカンタン</span>
              </div>
              <div className="border-2 border-[#c41e3a] p-2">
                <img src="/score-photo-form.png" alt="スコアフォト作成フォーム" className="w-full h-auto object-cover" loading="lazy" />
              </div>
              <div className="mt-6 grid sm:grid-cols-3 gap-2 text-xs">
                {['パー自動反映', '合計自動計算', 'スマホ対応', 'スコア途中保存', '好きな画像選択', '大会名入力OK'].map((feature) => (
                  <div key={feature} className="px-3 py-2 text-center border border-white/20 bg-black/50 text-gray-400">{feature}</div>
                ))}
              </div>
            </div>

            <div className="card-dark p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <span className="lesson-badge">完成イメージ</span>
                <span className="text-xs text-gray-500">そのまま保存OK</span>
              </div>
              <div className="border-2 border-[#c41e3a] p-2 bg-black">
                <img src="/score-photo-sample.png" alt="スコアフォト完成イメージ" className="w-full h-auto object-cover" loading="lazy" />
              </div>
              <div className="mt-6 flex flex-col items-center gap-4">
                <button onClick={goToScorePhoto} className="px-8 py-3 border-2 border-white text-sm font-semibold tracking-wider hover:bg-white hover:text-black transition-all">
                  スコアフォトを作成する
                </button>
                <p className="text-xs text-center text-gray-500">写真を選ぶだけでスコア入り画像が完成します</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-16">
            <button onClick={goToScorePhoto} className="view-more-btn">
              VIEW MORE
            </button>
          </div>
        </div>
      </section>

      <section id="popular-menu" className="section-dark relative">
        <SmokeSVG className="smoke-decoration smoke-left text-white/10" />

        <div className="site-shell">
          <div className="section-header">
            <div className="section-en-title">MENU</div>
            <div className="section-jp-title font-serif-jp">人気メニュー</div>
          </div>

          <div className="card-dark p-6 md:p-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3">
                  <span className="px-3 py-1 text-xs font-semibold bg-[#c41e3a] text-white">{featuredMenus[activeSlide].tag}</span>
                  <span className="text-xs tracking-wider text-gray-500">{featuredMenus[activeSlide].subtitle}</span>
                </div>

                <div>
                  <h3 className="text-3xl md:text-4xl font-black mb-2 font-serif-jp">
                    {featuredMenus[activeSlide].title}
                    <span className="text-lg md:text-xl ml-2 text-[#c41e3a]">（{featuredMenus[activeSlide].price}）</span>
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-gray-400">{featuredMenus[activeSlide].description}</p>
                </div>

                <div className="flex items-center gap-4">
                  <button onClick={prevSlide} className="w-12 h-12 flex items-center justify-center border-2 border-white hover:bg-white hover:text-black transition-colors" aria-label="前のメニュー">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-2">
                    {featuredMenus.map((item, index) => (
                      <span key={item.id} className={`h-2 transition-all ${index === activeSlide ? 'w-8 bg-[#c41e3a]' : 'w-2 bg-white/30'}`} aria-label={`${index + 1}枚目`} />
                    ))}
                  </div>
                  <button onClick={nextSlide} className="w-12 h-12 flex items-center justify-center border-2 border-white hover:bg-white hover:text-black transition-colors" aria-label="次のメニュー">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-xs text-gray-500">{featuredMenus[activeSlide].note}</p>
              </div>

              <div className="relative">
                <div className="absolute -left-4 -top-4 w-24 h-24 border-2 border-[#c41e3a] -z-10" />
                <div className="card-frame">
                  <img src={featuredMenus[activeSlide].image} alt={featuredMenus[activeSlide].title} className="w-full h-auto object-cover filter grayscale-[30%]" loading="lazy" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="dj-booth" className="section-texture relative">
        <div className="site-shell">
          <div className="section-header">
            <div className="section-en-title">DJ BOOTH</div>
            <div className="section-jp-title font-serif-jp">DJブース</div>
          </div>
        </div>
        <div className="site-shell mb-16">
          <AttendeeStats table="after_party_attendees" />
        </div>
        <div className="site-shell">
          <div className="card-dark p-6 md:p-10">
            <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#c41e3a] bg-black/50 mb-4">
                  <span className="h-2 w-2 rounded-full bg-[#c41e3a] animate-pulse" />
                  <span className="text-sm font-semibold text-[#c41e3a]">KIRAMUブース</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-4 font-serif-jp text-[#c41e3a]">KIRAMU DJ SET</h3>
                <p className="text-sm mb-6 text-gray-400">レコードボタンを押すと、KOJIMA-Yayyyy!!!が流れます。</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['KOJIMA', 'VINYL', 'HYPE'].map((tag) => (
                    <span key={tag} className="px-3 py-1 border border-white/20 text-gray-500">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 border-2 border-[#c41e3a] bg-black/80">
                  <button
                    type="button"
                    onClick={toggleDjSound}
                    aria-pressed={isDjPlaying}
                    aria-label={isDjPlaying ? 'DJサウンドを停止' : 'DJサウンドを再生'}
                    className={`relative mx-auto flex items-center justify-center w-32 h-32 md:w-36 md:h-36 rounded-full border-2 border-[#c41e3a] transition-all ${
                      isDjPlaying ? 'scale-105 shadow-[0_0_40px_rgba(196,30,58,0.5)]' : 'hover:shadow-[0_0_25px_rgba(196,30,58,0.3)]'
                    }`}
                    style={{ background: 'linear-gradient(145deg, #3d0a0a, #0a0a0a)' }}
                  >
                    <span
                      className={`absolute inset-3 rounded-full border border-[#c41e3a]/30 ${isDjPlaying ? 'animate-spin' : ''}`}
                      style={{ background: 'repeating-radial-gradient(circle, #0a0a0a 0 4px, #151515 4px 8px)' }}
                    />
                    <span className="absolute inset-12 rounded-full bg-[#c41e3a] opacity-20" />
                    <span className="relative text-sm font-black tracking-widest text-[#c41e3a]">{isDjPlaying ? 'STOP' : 'PLAY'}</span>
                  </button>
                  <div className="mt-4 text-center text-xs text-gray-500">{isDjPlaying ? '再生中...' : 'レコードボタンを押してスタート'}</div>
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <div className="text-[10px] tracking-widest text-[#c41e3a]">BGM LIVE</div>
                    <div className="flex items-end justify-center gap-1 h-8">
                      {[0, 1, 2, 3, 4, 5].map((bar) => (
                        <span
                          key={`dj-eq-${bar}`}
                          className={`w-2 h-8 bg-[#c41e3a] ${isDjPlaying ? 'animate-dj-eq' : 'opacity-30'}`}
                          style={{ animationDelay: `${bar * 0.12}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <audio ref={audioRef} src="/Yayyyyy!!.MP4" preload="none" onEnded={() => setIsDjPlaying(false)} />
          </div>
        </div>
      </section>

      <section id="rsvp-form" className="section-dark relative">
        <SmokeSVG className="smoke-decoration smoke-right text-white/5" />

        <div className="site-shell">
          <div className="section-header">
            <div className="section-en-title">RSVP</div>
            <div className="section-jp-title font-serif-jp">懇親会参加申込</div>
            <p className="section-jp-sub">下記フォームよりご回答ください</p>
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
              className="w-full h-auto border-2 border-[#c41e3a]"
              loading="lazy"
            />
          </a>
        </div>
      </section>

      <footer className="py-20 px-4 border-t border-white/10 bg-[#0a0a0a]">
        <div className="site-shell text-center">
          <div className="text-xs tracking-[0.5em] mb-4 text-[#c41e3a]">CONTACT</div>
          <h3 className="text-2xl font-black mb-6 tracking-wider font-serif-jp">KIRAMU GOLF COMPETITION 2026</h3>
          <p className="text-sm mb-6 text-gray-500">ご不明な点がございましたら、お気軽にお問い合わせください。</p>
          <p className="text-xs text-gray-600">希楽夢杯実行委員会</p>
        </div>
      </footer>
    </div>
  );
}
