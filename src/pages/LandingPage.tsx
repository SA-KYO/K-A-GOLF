import { useEffect, useRef, useState } from 'react';
import { Countdown } from '../components/Countdown';
import { RSVPForm } from '../components/RSVPForm';
import { AttendeeStats } from '../components/AttendeeStats';
import { MediaUploadSection } from '../components/MediaUploadSection';
import { Calendar, MapPin, Clock, Utensils, Trophy, ExternalLink, DollarSign, Instagram, MessageCircle, Globe, ChevronLeft, ChevronRight, Target, Check, Menu, X } from 'lucide-react';

const SmokeSVG = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M200 600C200 600 50 450 80 300C110 150 200 100 200 0C200 100 290 150 320 300C350 450 200 600 200 600Z" fill="currentColor" />
    <path d="M150 500C150 500 50 400 70 280C90 160 150 120 150 50C150 120 210 160 230 280C250 400 150 500 150 500Z" fill="currentColor" opacity="0.6" />
    <path d="M250 550C250 550 350 420 330 290C310 160 250 110 250 30C250 110 190 160 170 290C150 420 250 550 250 550Z" fill="currentColor" opacity="0.4" />
  </svg>
);

const SmokeWrapSVG = ({ className, flip }: { className?: string; flip?: boolean }) => (
  <svg
    className={className}
    viewBox="0 0 200 800"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: flip ? 'scaleX(-1)' : undefined }}
  >
    <path d="M0 0C50 100 100 150 80 250C60 350 20 400 40 500C60 600 100 650 80 750C70 800 50 800 0 800V0Z" fill="currentColor" />
    <path d="M0 100C30 150 60 180 50 250C40 320 10 350 20 420C30 490 60 520 50 590C45 630 30 650 0 680V100Z" fill="currentColor" opacity="0.5" />
  </svg>
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
    <div className="min-h-screen bg-[#0a0a0a] animate-page-enter">
      <div className="hero-top">
        <img src="/title-logo.png" alt="第一回 希楽夢杯" className="hero-logo" />
        <nav className="hidden md:flex items-center gap-10">
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
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center border border-white/20 hover:bg-white hover:text-black transition-colors"
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
                  className="w-full text-left py-3 group flex items-baseline gap-4 hover:text-[#3d7a35] transition-colors"
                >
                  <span className="text-4xl md:text-5xl font-black tracking-tight uppercase">{item.en}</span>
                  <span className="text-sm text-gray-500 group-hover:text-[#3d7a35]">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <section id="top" className="hero-banner relative">
        <SmokeSVG className="smoke-decoration smoke-left text-white/8 animate-smoke" />
        <SmokeSVG className="smoke-decoration smoke-right text-white/8 animate-smoke" style={{ animationDelay: '-5s' }} />

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
            <div className="relative">
              <div className="card-frame-gradient">
                <img src="/golf-course-bg.jpg" alt="ゴルフ場" className="w-full" />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <p className="text-white text-lg font-medium font-serif-jp">宇治田原カントリー倶楽部</p>
                </div>
              </div>
              <SmokeWrapSVG className="absolute -right-12 top-0 bottom-0 w-32 text-white/20 animate-float" />
            </div>
            <div className="hero-countdown mt-6">
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
        <div className="section-bg-text">EVENT</div>
        <SmokeWrapSVG className="absolute right-0 top-0 bottom-0 w-48 text-white/5" />

        <div className="site-shell relative z-10">
          <div className="section-header">
            <div className="section-jp-title font-serif-jp">イベント詳細</div>
          </div>

          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-center mb-20">
            <div className="space-y-8">
              <div>
                <p className="text-sm tracking-widest text-[#3d7a35] mb-3">DATE</p>
                <div className="text-8xl md:text-9xl font-black leading-none">3/3</div>
                <div className="text-2xl font-medium mt-2 text-gray-400">2026年 火曜日</div>
              </div>
              <div className="elegant-divider !mx-0 !ml-0" />
              <div>
                <p className="text-sm tracking-widest text-[#3d7a35] mb-3">TIME</p>
                <div className="flex items-baseline gap-3">
                  <Clock className="w-6 h-6 text-[#3d7a35]" />
                  <span className="text-5xl font-black">7:50</span>
                  <span className="text-lg text-gray-400">集合</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="tilted-oval-frame mx-auto">
                <div className="tilted-oval-container">
                  <div className="tilted-oval-rings" />
                  <div className="tilted-oval-image">
                    <img src="/golf-course-bg.jpg" alt="ゴルフ場" />
                  </div>
                  <div className="absolute inset-0 gradient-blue-bottom rounded-full" style={{ transform: 'rotate(15deg)' }} />
                  <div className="absolute bottom-8 left-0 right-0 text-center z-10" style={{ transform: 'rotate(15deg)' }}>
                    <p className="text-white text-xl font-bold font-serif-jp">宇治田原カントリー倶楽部</p>
                  </div>
                </div>
                <SmokeSVG className="cloud-smoke-bottom text-white/20" />
              </div>
              <SmokeWrapSVG className="absolute -left-16 top-1/4 w-24 h-96 text-white/15 animate-smoke" />
              <SmokeWrapSVG className="absolute -right-16 top-1/3 w-24 h-96 text-white/15 animate-smoke" flip />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-elegant text-center">
              <MapPin className="w-8 h-8 mx-auto mb-4 text-[#3d7a35]" />
              <h3 className="text-xl font-bold mb-3 font-serif-jp">会場</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                京都府綴喜郡宇治田原町<br />奥山田長尾31-2
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=宇治田原カントリー倶楽部"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm text-[#3d7a35] hover:text-white transition-colors"
              >
                MAP <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="card-elegant text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-4 text-[#3d7a35]" />
              <h3 className="text-xl font-bold mb-3 font-serif-jp">プレー費</h3>
              <p className="text-4xl font-black text-[#3d7a35]">¥8,180</p>
              <p className="text-xs text-gray-500 mt-2">昼食・ワンドリンク付</p>
            </div>

            <div className="card-elegant text-center">
              <Trophy className="w-8 h-8 mx-auto mb-4 text-[#3d7a35]" />
              <h3 className="text-xl font-bold mb-3 font-serif-jp">コンペフィー</h3>
              <p className="text-4xl font-black text-[#3d7a35]">¥2,000</p>
              <p className="text-xs text-gray-500 mt-2">賞品費</p>
            </div>
          </div>
        </div>
      </section>

      <section id="groupings" className="section-texture relative">
        <div className="section-bg-text">GROUPINGS</div>
        <SmokeWrapSVG className="absolute left-0 top-0 bottom-0 w-40 text-white/5" />

        <div className="site-shell relative z-10">
          <div className="section-header">
            <div className="section-jp-title font-serif-jp">組み分け</div>
            <p className="section-jp-sub mt-2">08:12〜 嘉納スタート</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {groupings.map((group) => (
              <div key={group.label} className="card-elegant">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-2 border-[#3d7a35] text-[#3d7a35]">
                    {group.label}
                  </div>
                  <div>
                    <div className="text-xl font-bold">{group.title}</div>
                    <div className="text-sm text-gray-500">{group.count}名</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {group.members.map((member) => (
                    <div key={member.name} className="flex items-center gap-3 py-2 border-b border-white/5">
                      <span className={`w-2 h-2 rounded-full ${member.highlight ? 'bg-[#3d7a35]' : 'bg-white/20'}`} />
                      <span className={`text-sm ${member.highlight ? 'text-[#3d7a35] font-medium' : 'text-gray-400'}`}>{member.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="special-awards" className="section-dark relative">
        <div className="section-bg-text">AWARDS</div>

        <div className="site-shell relative z-10">
          <div className="section-header">
            <div className="section-jp-title font-serif-jp">特別賞</div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {specialAwards.map((award) => {
              const Icon = award.icon;
              return (
                <div key={award.title} className="text-center">
                  <div className="mx-auto mb-8 w-28 h-28 rounded-full flex items-center justify-center border-2 border-[#3d7a35]/50 bg-[#3d7a35]/10">
                    <Icon className="w-12 h-12 text-[#3d7a35]" />
                  </div>
                  <div className="text-3xl font-black mb-4 font-serif-jp">{award.title}</div>
                  <div className="elegant-divider" />
                  <p className="text-sm text-gray-400">{award.description}</p>
                  {award.note && <p className="text-xs text-gray-600 mt-2">{award.note}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="local-rules" className="section-texture relative">
        <div className="section-bg-text">RULES</div>
        <SmokeWrapSVG className="absolute right-0 top-0 bottom-0 w-40 text-white/5" flip />

        <div className="site-shell relative z-10">
          <div className="section-header">
            <div className="section-jp-title font-serif-jp">希楽夢杯ローカルルール</div>
          </div>

          <div className="space-y-4">
            {localRules.map((rule, index) => (
              <div key={rule.title} className="card-elegant flex items-start gap-6">
                <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center border border-[#3d7a35]/50 text-[#3d7a35] font-bold">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div>
                  <div className="text-lg font-semibold mb-1">{rule.title}</div>
                  <p className="text-sm text-gray-400 leading-relaxed">{rule.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="award-ceremony" className="section-dark relative">
        <div className="section-bg-text">CEREMONY</div>

        <div className="site-shell relative z-10">
          <div className="section-header section-header--center">
            <div className="section-jp-title font-serif-jp">表彰式</div>
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <div className="text-3xl md:text-4xl font-black mb-8 font-serif-jp">宇治田原カントリー倶楽部</div>
            <div className="elegant-divider" />
            <p className="text-gray-400 leading-relaxed">
              プレー終了後、会場にて表彰式を行います。<br />
              賞品をご用意しておりますので、お楽しみに！
            </p>
          </div>
        </div>
      </section>

      <section id="after-party" className="section-texture relative">
        <div className="section-bg-text">PARTY</div>
        <SmokeWrapSVG className="absolute left-0 top-0 bottom-0 w-40 text-white/5" />

        <div className="site-shell relative z-10">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="tilted-oval-frame mx-auto">
                <div className="tilted-oval-container">
                  <div className="tilted-oval-rings" />
                  <div className="tilted-oval-image">
                    <img src="/tokusio.jpg" alt="希楽夢の料理" />
                  </div>
                  <div className="absolute inset-0 gradient-green-bottom rounded-full" style={{ transform: 'rotate(15deg)' }} />
                  <div className="absolute bottom-8 left-0 right-0 text-center z-10" style={{ transform: 'rotate(15deg)' }}>
                    <p className="text-white text-xl font-bold font-serif-jp">麺屋 希楽夢</p>
                  </div>
                </div>
                <SmokeSVG className="cloud-smoke-bottom text-white/20" />
              </div>
              <SmokeWrapSVG className="absolute -left-12 top-1/4 w-20 h-80 text-white/15 animate-smoke" />
              <SmokeWrapSVG className="absolute -right-12 top-1/3 w-20 h-80 text-white/15 animate-smoke" flip />
            </div>

            <div className="order-1 lg:order-2">
              <div className="section-header !mb-8">
                <div className="section-jp-title font-serif-jp">懇親会</div>
              </div>

              <p className="text-gray-400 leading-loose mb-8">
                プレー後は麺屋希楽夢にて懇親会を開催！<br />
                ゴルフの余韻を楽しみながら、<br />
                美味しい料理とともに交流を深めましょう。
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 text-[#3d7a35]" />
                  <span className="text-xl font-bold">18:00〜（予定）</span>
                </div>
                <div className="flex items-center gap-4">
                  <DollarSign className="w-5 h-5 text-[#3d7a35]" />
                  <span className="text-xl font-bold">¥2,000</span>
                  <span className="text-sm text-gray-500">（食事代）</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href="https://www.instagram.com/menya.kiramu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2 border border-white/20 text-sm hover:border-[#3d7a35] hover:text-[#3d7a35] transition-all"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
                <a
                  href="https://line.me/R/ti/p/@091wotfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2 border border-white/20 text-sm hover:border-[#3d7a35] hover:text-[#3d7a35] transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  LINE
                </a>
                <a
                  href="https://menyakiramu.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2 border border-white/20 text-sm hover:border-[#3d7a35] hover:text-[#3d7a35] transition-all"
                >
                  <Globe className="w-4 h-4" />
                  HP
                </a>
              </div>

              <button className="view-more-btn mt-10">
                VIEW MORE
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="deadline" className="section-dark relative">
        <div className="section-bg-text">DEADLINE</div>

        <div className="site-shell relative z-10">
          <div className="section-header section-header--center">
            <div className="section-jp-title font-serif-jp">懇親会回答締め切り</div>
          </div>

          <div className="text-center">
            <div className="text-6xl md:text-8xl font-black mb-6">2/24</div>
            <div className="text-xl text-gray-400">2026年</div>
            <div className="elegant-divider" />
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              期日までにご回答いただけますよう、お願いいたします。
            </p>
          </div>
        </div>
      </section>

      <section id="score-photo" className="section-texture relative">
        <div className="section-bg-text">PHOTO</div>
        <SmokeWrapSVG className="absolute right-0 top-0 bottom-0 w-40 text-white/5" flip />

        <div className="site-shell relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-header !mb-8">
                <div className="section-jp-title font-serif-jp">スコアフォト作成</div>
                <p className="section-jp-sub mt-2">写真にスコアを重ねて保存できます</p>
              </div>

              <p className="text-gray-400 leading-loose mb-8">
                お好きな写真を選んで、スコアを入力するだけ。<br />
                思い出に残るオリジナルのスコアフォトが完成します。
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {['パー自動反映', '合計自動計算', 'スマホ対応', '好きな画像選択'].map((feature) => (
                  <span key={feature} className="px-4 py-2 text-xs border border-white/10 text-gray-400">{feature}</span>
                ))}
              </div>

              <button onClick={goToScorePhoto} className="view-more-btn">
                VIEW MORE
              </button>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/20">
                <img src="/score-photo-sample.png" alt="スコアフォト完成イメージ" className="w-full h-auto" loading="lazy" />
              </div>
              <SmokeWrapSVG className="absolute -right-8 top-1/4 w-16 h-64 text-white/15 animate-float" flip />
            </div>
          </div>
        </div>
      </section>

      <section id="popular-menu" className="section-dark relative">
        <div className="section-bg-text">MENU</div>
        <SmokeWrapSVG className="absolute left-0 top-0 bottom-0 w-40 text-white/5" />

        <div className="site-shell relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="tilted-oval-frame mx-auto">
                <div className="tilted-oval-container">
                  <div className="tilted-oval-rings" />
                  <div className="tilted-oval-image">
                    <img src={featuredMenus[activeSlide].image} alt={featuredMenus[activeSlide].title} />
                  </div>
                  <div className="absolute inset-0 gradient-blue-bottom rounded-full" style={{ transform: 'rotate(15deg)' }} />
                  <div className="absolute bottom-8 left-0 right-0 text-center z-10" style={{ transform: 'rotate(15deg)' }}>
                    <p className="text-white text-xl font-bold font-serif-jp">{featuredMenus[activeSlide].title}</p>
                  </div>
                </div>
                <SmokeSVG className="cloud-smoke-bottom text-white/20" />
              </div>
              <SmokeWrapSVG className="absolute -left-12 top-1/4 w-20 h-80 text-white/15 animate-smoke" />
              <SmokeWrapSVG className="absolute -right-12 top-1/3 w-20 h-80 text-white/15 animate-smoke" flip />
            </div>

            <div className="order-1 lg:order-2">
              <div className="section-header !mb-8">
                <div className="section-jp-title font-serif-jp">人気メニュー</div>
              </div>

              <div className="mb-6">
                <span className="text-xs tracking-widest text-[#3d7a35]">{featuredMenus[activeSlide].subtitle}</span>
              </div>

              <h3 className="text-3xl md:text-4xl font-black mb-2 font-serif-jp">
                {featuredMenus[activeSlide].title}
              </h3>
              <p className="text-2xl font-bold text-[#3d7a35] mb-6">{featuredMenus[activeSlide].price}</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-8">{featuredMenus[activeSlide].description}</p>

              <div className="flex items-center gap-6">
                <button onClick={prevSlide} className="w-12 h-12 rounded-full flex items-center justify-center border border-white/20 hover:border-white hover:bg-white hover:text-black transition-all" aria-label="前のメニュー">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  {featuredMenus.map((item, index) => (
                    <span key={item.id} className={`h-1.5 rounded-full transition-all ${index === activeSlide ? 'w-8 bg-[#3d7a35]' : 'w-1.5 bg-white/20'}`} />
                  ))}
                </div>
                <button onClick={nextSlide} className="w-12 h-12 rounded-full flex items-center justify-center border border-white/20 hover:border-white hover:bg-white hover:text-black transition-all" aria-label="次のメニュー">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="dj-booth" className="section-texture relative">
        <div className="section-bg-text">DJ</div>

        <div className="site-shell relative z-10">
          <div className="section-header">
            <div className="section-jp-title font-serif-jp">DJブース</div>
          </div>

          <div className="mb-16">
            <AttendeeStats table="after_party_attendees" />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm tracking-widest text-[#3d7a35] mb-4">KIRAMU DJ SET</p>
              <p className="text-gray-400 leading-loose mb-6">レコードボタンを押すと、KOJIMA-Yayyyy!!!が流れます。</p>
              <div className="flex flex-wrap gap-2">
                {['KOJIMA', 'VINYL', 'HYPE'].map((tag) => (
                  <span key={tag} className="px-4 py-1 text-xs border border-white/10 text-gray-500">{tag}</span>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={toggleDjSound}
                aria-pressed={isDjPlaying}
                aria-label={isDjPlaying ? 'DJサウンドを停止' : 'DJサウンドを再生'}
                className={`relative flex items-center justify-center w-40 h-40 rounded-full border-2 transition-all ${
                  isDjPlaying ? 'border-[#3d7a35] scale-105 shadow-[0_0_60px_rgba(61,122,53,0.4)]' : 'border-white/30 hover:border-[#3d7a35]'
                }`}
                style={{ background: 'radial-gradient(circle at 30% 30%, #1a1a1a 0%, #0a0a0a 100%)' }}
              >
                <span
                  className={`absolute inset-4 rounded-full border border-white/10 ${isDjPlaying ? 'animate-spin' : ''}`}
                  style={{ background: 'repeating-radial-gradient(circle, #0a0a0a 0 3px, #151515 3px 6px)', animationDuration: '3s' }}
                />
                <span className="relative text-sm font-bold tracking-widest">{isDjPlaying ? 'STOP' : 'PLAY'}</span>
              </button>
              <audio ref={audioRef} src="/Yayyyyy!!.MP4" preload="none" onEnded={() => setIsDjPlaying(false)} />
            </div>
          </div>
        </div>
      </section>

      <section id="staff-gallery" className="section-dark relative">
        <div className="section-bg-text">STAFF</div>
        <SmokeWrapSVG className="absolute left-0 top-0 bottom-0 w-40 text-white/5" />

        <div className="site-shell relative z-10">
          <div className="section-header section-header--center">
            <div className="section-jp-title font-serif-jp">スタッフギャラリー</div>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            <div className="relative pb-16">
              <div className="gallery-card gallery-card--grayscale aspect-[3/4]">
                <img src="/tokusio.jpg" alt="あこ" className="w-full h-full object-cover" />
              </div>
              <div className="gallery-card-name">あこ</div>
            </div>

            <div className="relative pb-16">
              <div className="gallery-card gallery-card--center aspect-[3/4]">
                <img src="/cha-syu-.jpeg" alt="かこ" className="w-full h-full object-cover" />
                <div className="gallery-card-gradient" />
              </div>
              <div className="gallery-card-name">かこ</div>
            </div>

            <div className="relative pb-16">
              <div className="gallery-card gallery-card--grayscale aspect-[3/4]">
                <img src="/syouyutukemen.jpg" alt="ロシアン佐藤" className="w-full h-full object-cover" />
              </div>
              <div className="gallery-card-name">ロシアン佐藤</div>
            </div>
          </div>

          <SmokeSVG className="absolute bottom-0 left-10% w-96 h-48 text-white/15 animate-float" />
        </div>
      </section>

      <section id="rsvp-form" className="section-dark relative">
        <div className="section-bg-text">RSVP</div>
        <SmokeWrapSVG className="absolute right-0 top-0 bottom-0 w-40 text-white/5" flip />

        <div className="site-shell relative z-10">
          <div className="section-header section-header--center">
            <div className="section-jp-title font-serif-jp">懇親会参加申込</div>
            <p className="section-jp-sub mt-2">下記フォームよりご回答ください</p>
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
              alt="麺屋希楽夢 LINE公式アカウント"
              className="w-full h-auto rounded-lg"
              loading="lazy"
            />
          </a>
        </div>
      </section>

      <footer className="py-24 px-4 border-t border-white/5 bg-[#0a0a0a]">
        <div className="site-shell text-center">
          <div className="text-xs tracking-[0.5em] mb-4 text-[#3d7a35]">CONTACT</div>
          <h3 className="text-2xl font-black mb-8 tracking-wider font-serif-jp">KIRAMU GOLF COMPETITION 2026</h3>
          <div className="elegant-divider" />
          <p className="text-sm text-gray-600">希楽夢杯実行委員会</p>
        </div>
      </footer>
    </div>
  );
}
