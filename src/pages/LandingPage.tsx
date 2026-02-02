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
      <div className="fixed top-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-controls="site-menu"
          aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          className="flex items-center gap-2 bg-yellow-400 border-4 border-black px-4 py-3 font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
          style={{ boxShadow: '6px 6px 0 0 #000' }}
        >
          <Menu className="w-5 h-5" />
          MENU
        </button>
      </div>

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
            className="absolute right-0 top-0 h-screen max-h-screen w-full max-w-xs sm:max-w-sm bg-yellow-300 border-l-4 border-black px-6 py-8 overflow-y-auto overscroll-contain touch-pan-y h-[100dvh] max-h-[100dvh] pb-[calc(env(safe-area-inset-bottom)+2rem)]"
            style={{ boxShadow: '-10px 0 0 0 #000', WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="text-2xl font-black text-black uppercase">MENU</div>
              <button
                type="button"
                className="bg-white border-4 border-black px-3 py-2 font-black hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
                style={{ boxShadow: '4px 4px 0 0 #000' }}
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
                  className="w-full text-left bg-white border-4 border-black px-4 py-3 font-black text-black hover:translate-x-1 hover:translate-y-1 transition-transform"
                  style={{ boxShadow: '4px 4px 0 0 #000' }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <section id="top" className="relative min-h-screen flex items-center justify-center px-4 py-20 scroll-mt-24"
        style={{
          backgroundImage: 'url(/golf-course-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-yellow-300/80"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <img
              src="/title-logo.png"
              alt="第一回 希楽夢杯"
              className="w-full max-w-4xl h-auto"
            />
          </div>

          <div className="w-32 h-2 bg-black mx-auto mb-8" />

          <p className="text-xl md:text-2xl lg:text-3xl text-black mb-12 font-black tracking-wide uppercase">
            KIRAMU CUP GOLF COMPETITION 2026
          </p>

          <div className="bg-white rounded-none p-6 md:p-12 mb-12 border-4 border-black mx-6 md:mx-0" style={{ boxShadow: '8px 8px 0 0 #000' }}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <Calendar className="w-8 h-8 text-black" />
              <h2 className="text-2xl md:text-3xl font-black text-black uppercase">開催まで</h2>
            </div>
            <Countdown />
          </div>

          <button
            onClick={scrollToForm}
            className="bg-yellow-400 px-8 md:px-12 py-4 md:py-5 border-4 border-black text-lg md:text-xl font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
            style={{ color: '#22C55E', boxShadow: '6px 6px 0 0 #000' }}
          >
            懇親会参加申込はこちら
          </button>
        </div>
      </section>

      <section id="event-details" className="py-20 px-4 bg-yellow-400 scroll-mt-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-black uppercase">イベント詳細</h2>
            <div className="w-32 h-2 bg-black mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-yellow-400 border-4 border-black p-10" style={{ boxShadow: '8px 8px 0 0 #000' }}>
              <div className="flex items-center justify-center gap-3 mb-8">
                <Calendar className="w-10 h-10" style={{ color: '#22C55E' }} />
                <h3 className="text-3xl font-black uppercase" style={{ color: '#22C55E' }}>開催日時</h3>
              </div>

              <div className="text-center mb-6">
                <div className="text-6xl md:text-7xl font-black text-black mb-3">
                  3/3
                </div>
                <div className="text-2xl md:text-3xl font-black text-black mb-4">
                  2026年
                </div>
                <div className="inline-block px-6 py-3 bg-white text-black text-xl font-black border-4 border-black" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                  火曜日
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="time-display-container flex flex-col items-center justify-center gap-3 border-4 border-black p-6 animate-fade-in-scale animate-glow" style={{ backgroundColor: '#22C55E', boxShadow: '4px 4px 0 0 #000' }}>
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

            <div className="bg-yellow-400 border-4 border-black p-10" style={{ boxShadow: '8px 8px 0 0 #000' }}>
              <div className="flex items-center justify-center gap-3 mb-8">
                <MapPin className="w-10 h-10" style={{ color: '#22C55E' }} />
                <h3 className="text-3xl font-black uppercase" style={{ color: '#22C55E' }}>ゴルフ会場</h3>
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
                  style={{ color: '#22C55E', boxShadow: '4px 4px 0 0 #000' }}
                >
                  <MapPin className="w-5 h-5" />
                  Googleマップで見る
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-yellow-400 border-4 border-black p-8 md:p-12 mb-8" style={{ boxShadow: '8px 8px 0 0 #000' }}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <DollarSign className="w-10 h-10" style={{ color: '#22C55E' }} />
              <h3 className="text-3xl font-black uppercase" style={{ color: '#22C55E' }}>参加費用</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-white border-4 border-black p-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                <div className="text-center">
                  <p className="text-lg font-bold text-black mb-2">プレー費</p>
                  <p className="text-4xl md:text-5xl font-black mb-2" style={{ color: '#22C55E' }}>¥8,180</p>
                  <p className="text-sm md:text-base text-black font-bold">昼食・表彰式ワンドリンク付</p>
                </div>
              </div>
              <div className="bg-white border-4 border-black p-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                <div className="text-center">
                  <p className="text-lg font-bold text-black mb-2">コンペルフィー</p>
                  <p className="text-4xl md:text-5xl font-black mb-2" style={{ color: '#22C55E' }}>¥2,000</p>
                  <p className="text-sm md:text-base text-black font-bold">賞品費</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-400 border-4 border-black p-8 md:p-12" style={{ boxShadow: '8px 8px 0 0 #000' }}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <Utensils className="w-8 h-8" style={{ color: '#22C55E' }} />
              <Trophy className="w-8 h-8" style={{ color: '#22C55E' }} />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-center mb-8 uppercase" style={{ color: '#22C55E' }}>
              イベント内容
            </h3>
            <div className="space-y-6 text-black max-w-3xl mx-auto">
              <div className="bg-white border-4 border-black p-8 md:p-10" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                <p className="text-3xl md:text-4xl lg:text-5xl leading-tight font-black text-center" style={{ color: '#22C55E' }}>
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

          <div id="groupings" className="bg-yellow-400 border-4 border-black p-8 md:p-12 mt-8 scroll-mt-24" style={{ boxShadow: '8px 8px 0 0 #000' }}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <Users className="w-9 h-9" style={{ color: '#22C55E' }} />
              <h3 className="text-3xl md:text-4xl font-black uppercase" style={{ color: '#22C55E' }}>組み分け</h3>
            </div>

            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white border-4 border-black px-6 py-3 text-xl md:text-2xl font-black text-black" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                08:12〜 嘉納スタート
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
              {groupings.map((group) => (
                <div key={group.label} className="bg-white border-4 border-black p-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full border-4 border-black flex items-center justify-center text-xl font-black text-black"
                        style={{ backgroundColor: group.color }}
                      >
                        {group.label}
                      </div>
                      <div className="text-2xl font-black text-black">{group.title}</div>
                    </div>
                    <div className="bg-gray-100 border-4 border-black rounded-full px-4 py-1 text-lg font-black text-black">
                      {group.count}人
                    </div>
                  </div>

                  <div className="border-4 border-dashed border-black/30 rounded-3xl p-4">
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {group.members.map((member) => (
                        <li
                          key={member.name}
                          className="bg-white border-2 border-black rounded-full px-4 py-2 text-center font-black"
                          style={{ boxShadow: '3px 3px 0 0 #000' }}
                        >
                          <span className="inline-flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full border-2 border-black border-dotted bg-gray-200" />
                            <span className={member.highlight ? 'text-[#22C55E]' : 'text-black'}>
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

          <div id="special-awards" className="bg-yellow-400 border-4 border-black p-8 md:p-12 mt-8 scroll-mt-24" style={{ boxShadow: '8px 8px 0 0 #000' }}>
            <div className="flex items-center justify-center gap-3 mb-8">
              <Medal className="w-10 h-10" style={{ color: '#22C55E' }} />
              <h3 className="text-3xl md:text-4xl font-black uppercase" style={{ color: '#22C55E' }}>特別賞</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
              {specialAwards.map((award) => {
                const Icon = award.icon;
                return (
                  <div
                    key={award.title}
                    className="bg-white border-4 border-black p-6 text-center"
                    style={{ boxShadow: '4px 4px 0 0 #000' }}
                  >
                    <div
                      className="mx-auto mb-4 w-16 h-16 rounded-full border-4 border-black flex items-center justify-center"
                      style={{ backgroundColor: award.accent }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-black">{award.title}</div>
                    <div className="w-12 h-1 bg-black mx-auto my-4" />
                    <p className="text-base md:text-lg font-bold text-black">{award.description}</p>
                    {award.badge && (
                      <div
                        className="inline-flex items-center justify-center border-4 border-black px-4 py-2 text-sm md:text-base font-black mt-5"
                        style={{ backgroundColor: award.accent }}
                      >
                        {award.badge}
                      </div>
                    )}
                    {award.note && (
                      <p className="mt-3 text-sm md:text-base font-bold text-black">{award.note}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div id="local-rules" className="bg-yellow-400 border-4 border-black p-8 md:p-12 mt-8 scroll-mt-24" style={{ boxShadow: '8px 8px 0 0 #000' }}>
            <div className="flex items-center justify-center gap-3 mb-8">
              <AlertCircle className="w-10 h-10" style={{ color: '#22C55E' }} />
              <h3 className="text-3xl md:text-4xl font-black uppercase" style={{ color: '#22C55E' }}>希楽夢杯ローカルルール</h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2 max-w-5xl mx-auto">
              {localRules.map((rule, index) => (
                <div
                  key={rule.title}
                  className="bg-white border-4 border-black p-5 md:p-6"
                  style={{ boxShadow: '6px 6px 0 0 #000' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border-4 border-black bg-green-400">
                      <Check className="w-4 h-4 text-black" />
                    </span>
                    <span className="inline-flex items-center justify-center px-3 py-1 border-4 border-black text-xs md:text-sm font-black bg-yellow-200">
                      RULE {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="border-l-4 border-black pl-4">
                    <div className="text-lg md:text-xl font-black text-black">{rule.title}</div>
                    <p className="text-sm md:text-base font-bold text-black leading-relaxed mt-2">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="award-ceremony" className="bg-yellow-400 border-4 border-black p-8 md:p-12 mt-8 scroll-mt-24" style={{ boxShadow: '8px 8px 0 0 #000' }}>
            <div className="flex items-center justify-center gap-3 mb-8">
              <Trophy className="w-10 h-10" style={{ color: '#22C55E' }} />
              <h3 className="text-3xl font-black uppercase" style={{ color: '#22C55E' }}>表彰式</h3>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="bg-white border-4 border-black p-8" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-black mb-4">
                    宇治田原カントリー倶楽部
                  </div>
                  <p className="text-lg md:text-xl text-black font-bold leading-relaxed">
                    プレー終了後、会場にて表彰式を行います。<br />
                    賞品をご用意しておりますので、お楽しみに！
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div id="after-party" className="bg-yellow-400 border-4 border-black p-8 md:p-12 mt-8 scroll-mt-24" style={{ boxShadow: '8px 8px 0 0 #000' }}>
            <div className="flex items-center justify-center gap-3 mb-8">
              <Utensils className="w-10 h-10" style={{ color: '#22C55E' }} />
              <h3 className="text-3xl font-black uppercase" style={{ color: '#22C55E' }}>懇親会</h3>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="bg-white border-4 border-black p-6 mb-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                <div className="text-center mb-4">
                  <div className="text-3xl md:text-4xl font-black text-black mb-4">
                    🍜 麺屋 希楽夢
                  </div>
                  <div className="flex items-center justify-center gap-2 text-black mb-4">
                    <Clock className="w-6 h-6" />
                    <span className="text-xl md:text-2xl font-black">18:00〜（予定）</span>
                  </div>
                  <div className="bg-yellow-400 border-4 border-black p-4">
                    <p className="text-base md:text-lg text-black font-bold leading-relaxed">
                      〒610-0201<br />
                      京都府綴喜郡宇治田原町南亥子90-1
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=麺屋希楽夢+京都府綴喜郡宇治田原町南亥子90-1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white px-6 py-3 border-4 border-black text-lg font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
                  style={{ color: '#22C55E', boxShadow: '4px 4px 0 0 #000' }}
                >
                  <MapPin className="w-5 h-5" />
                  Googleマップで見る
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>

              <div className="bg-white border-4 border-black p-6 mt-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                <div className="text-center mb-4">
                  <p className="text-lg font-bold text-black mb-2">参加費（食事代）</p>
                  <p className="text-4xl md:text-5xl font-black" style={{ color: '#22C55E' }}>¥2,000</p>
                </div>
              </div>

              <div className="bg-white border-4 border-black p-6 mt-6">
                <p className="text-lg text-black font-bold leading-relaxed text-center">
                  お食事はお鍋を予定しております🍲<br />
                  <span className="text-base">※飲み物は各自でご用意をお願いします。</span>
                </p>
              </div>

              <div className="bg-white border-4 border-black p-6 mt-6">
                <p className="text-lg text-black font-bold leading-relaxed text-center">
                  プレー後は麺屋希楽夢にて<p>懇親会を開催！</p>
                  <p>ゴルフの余韻を<br />楽しみながら、</p><p>美味しい料理とともに交流を深めましょう。</p>
                  <p>※参加自由</p>
                </p>
              </div>

              <div className="bg-white border-4 border-black p-6 mt-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                <div className="text-center">
                  <p className="text-xl font-black text-black mb-4">
                    インスタグラムはこちら！
                  </p>
                  <a
                    href="https://www.instagram.com/menya.kiramu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-8 py-4 border-4 border-black text-white text-lg font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
                    style={{ boxShadow: '4px 4px 0 0 #000' }}
                  >
                    <Instagram className="w-6 h-6" />
                    Instagram
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <div className="bg-white border-4 border-black p-6 mt-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                <div className="text-center">
                  <p className="text-xl font-black text-black mb-4">
                    公式LINEはこちら！
                  </p>
                  <a
                    href="https://line.me/R/ti/p/@091wotfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 border-4 border-black text-white text-lg font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
                    style={{ backgroundColor: '#06C755', boxShadow: '4px 4px 0 0 #000' }}
                  >
                    <MessageCircle className="w-6 h-6" />
                    LINE
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <div className="bg-white border-4 border-black p-6 mt-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                <div className="text-center">
                  <p className="text-xl font-black text-black mb-4">
                    希楽夢HPはこちら！
                  </p>
                  <a
                    href="https://menyakiramu.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 border-4 border-black text-white text-lg font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
                    style={{ backgroundColor: '#c78c1b', boxShadow: '4px 4px 0 0 #000' }}
                  >
                    <Globe className="w-6 h-6" />
                    希楽夢HP
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div id="deadline" className="bg-yellow-400 border-4 border-black p-10 md:p-16 mt-8 scroll-mt-24" style={{ boxShadow: '8px 8px 0 0 #000' }}>
            <div className="flex items-center justify-center gap-3 mb-8">
              <Calendar className="w-10 h-10" style={{ color: '#22C55E' }} />
              <h3 className="text-3xl md:text-4xl font-black uppercase" style={{ color: '#22C55E' }}>懇親会回答締め切り</h3>
            </div>

            <div className="text-center">
              <div className="inline-block bg-white border-4 border-black p-8 md:p-12" style={{ boxShadow: '6px 6px 0 0 #000' }}>
                <div className="text-5xl md:text-7xl font-black mb-4" style={{ color: '#22C55E' }}>
                  2026年2月24日
                </div>
                <div className="text-2xl md:text-3xl font-black text-black">
                  までにご回答ください
                </div>
              </div>

              <div className="mt-8 bg-white border-4 border-black p-6 max-w-2xl mx-auto">
                <p className="text-lg md:text-xl text-black font-bold leading-relaxed">
                  期日までにご回答いただけますよう、お願いいたします。締切日を過ぎてもご連絡がない場合は、不参加として扱わせていただきます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="score-photo" className="py-20 px-4 bg-yellow-300 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-black uppercase mb-4">
              スコアフォト作成
            </h2>
            <p className="text-lg md:text-xl text-black font-black">
              写真にスコアを重ねて保存できます♪
            </p>
            <div className="w-32 h-2 bg-black mx-auto mt-6" />
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-stretch">
            <div className="bg-white border-4 border-black p-6 md:p-8 h-full flex flex-col" style={{ boxShadow: '8px 8px 0 0 #000' }}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-2 bg-yellow-200 border-4 border-black px-4 py-2 text-sm md:text-base font-black uppercase">
                  フォーム入力
                </span>
                <span className="text-sm md:text-base font-black text-black">入力はカンタン</span>
              </div>
              <div className="relative bg-yellow-100 border-4 border-black p-3" style={{ boxShadow: '6px 6px 0 0 #000' }}>
                <img
                  src="/score-photo-form.png"
                  alt="スコアフォト作成フォーム"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
              <div className="mt-6 grid sm:grid-cols-3 gap-3 text-sm md:text-base font-black text-black">
                <div className="bg-yellow-200 border-4 border-black px-4 py-3 text-center">パー自動反映</div>
                <div className="bg-yellow-200 border-4 border-black px-4 py-3 text-center">合計自動計算</div>
                <div className="bg-yellow-200 border-4 border-black px-4 py-3 text-center">スマホ対応</div>
                <div className="bg-yellow-200 border-4 border-black px-4 py-3 text-center">スコア途中保存</div>
                <div className="bg-yellow-200 border-4 border-black px-4 py-3 text-center">好きな画像選択</div>
                <div className="bg-yellow-200 border-4 border-black px-4 py-3 text-center">大会名入力OK</div>
              </div>
            </div>

            <div className="bg-white border-4 border-black p-6 md:p-8 h-full flex flex-col" style={{ boxShadow: '8px 8px 0 0 #000' }}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-2 bg-yellow-200 border-4 border-black px-4 py-2 text-sm md:text-base font-black uppercase">
                  完成イメージ
                </span>
                <span className="text-sm md:text-base font-black text-black">そのまま保存OK</span>
              </div>
              <div className="relative bg-black border-4 border-black p-3" style={{ boxShadow: '6px 6px 0 0 #000' }}>
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
                  className="bg-yellow-400 px-8 md:px-10 py-4 border-4 border-black text-base md:text-lg font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
                  style={{ color: '#22C55E', boxShadow: '6px 6px 0 0 #000' }}
                >
                  スコアフォトを作成する
                </button>
                <p className="text-xs md:text-sm text-black font-bold text-center">
                  写真を選ぶだけでスコア入り画像が完成します
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-24">
            <div
              className="w-full max-w-lg bg-yellow-300 border-4 border-black border-dotted p-2"
              style={{ boxShadow: '6px 6px 0 0 #000' }}
            >
              <button
                onClick={goToScorePhoto}
                className="w-full bg-white px-6 md:px-10 py-3 border-4 border-black text-base md:text-lg font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
                style={{ color: '#22C55E' }}
              >
                スコアフォトを作成する
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="popular-menu" className="py-20 px-4 bg-yellow-300 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-black uppercase mb-4">
              人気メニュー
            </h2>
            <div className="w-32 h-2 bg-black mx-auto" />
          </div>

          <div
            className="relative bg-white border-4 border-black p-6 md:p-10 overflow-hidden"
            style={{ boxShadow: '10px 10px 0 0 #000' }}
          >
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 bg-yellow-200 border-4 border-black px-4 py-2 font-black uppercase text-sm md:text-base">
                  <span className="bg-black text-white px-3 py-1 text-xs md:text-sm">{featuredMenus[activeSlide].tag}</span>
                  <span className="tracking-[0.15em] text-gray-500">{featuredMenus[activeSlide].subtitle}</span>
                </div>

                <div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-black leading-tight mb-2">
                    {featuredMenus[activeSlide].title}
                    <span className="text-2xl md:text-3xl font-black ml-2" style={{ color: '#22C55E' }}>
                      （{featuredMenus[activeSlide].price}）
                    </span>
                  </h3>
                  <p className="text-base md:text-lg text-black leading-relaxed font-bold whitespace-pre-line">
                    {featuredMenus[activeSlide].description}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={prevSlide}
                    className="flex items-center justify-center w-12 h-12 bg-white border-4 border-black rounded-full hover:-translate-x-1 transition-transform"
                    style={{ boxShadow: '4px 4px 0 0 #000' }}
                    aria-label="前のメニュー"
                  >
                    <ChevronLeft className="w-6 h-6 text-black" />
                  </button>
                  <div className="flex items-center gap-2">
                    {featuredMenus.map((item, index) => (
                      <span
                        key={item.id}
                        className={`h-3 w-3 rounded-full border-2 border-black transition-all ${index === activeSlide ? 'bg-red-500 w-4' : 'bg-white'}`}
                        aria-label={`${index + 1}枚目`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={nextSlide}
                    className="flex items-center justify-center w-12 h-12 bg-white border-4 border-black rounded-full hover:translate-x-1 transition-transform"
                    style={{ boxShadow: '4px 4px 0 0 #000' }}
                    aria-label="次のメニュー"
                  >
                    <ChevronRight className="w-6 h-6 text-black" />
                  </button>
                </div>

                <p className="text-sm md:text-base text-gray-600 font-bold">
                  {featuredMenus[activeSlide].note}
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-6 -top-6 w-24 h-24 bg-yellow-200 border-4 border-black rotate-6" style={{ boxShadow: '6px 6px 0 0 #000' }} />
                <div className="relative bg-white border-4 border-black p-4" style={{ boxShadow: '8px 8px 0 0 #000' }}>
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

      <section id="dj-booth" className="py-20 px-4 bg-yellow-300 scroll-mt-24">
        <div className="max-w-5xl mx-auto mb-16">
          <AttendeeStats table="after_party_attendees" />
        </div>
        <div className="max-w-5xl mx-auto">
          <div
            className="relative overflow-hidden bg-black text-white border-4 border-black p-6 md:p-10"
            style={{ boxShadow: '8px 8px 0 0 #000, 0 0 28px rgba(0, 245, 255, 0.35)' }}
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
                  style={{ boxShadow: '4px 4px 0 0 #000' }}
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
                  <div className="bg-[#1b1b1b] border-4 border-black p-5" style={{ boxShadow: '6px 6px 0 0 #000' }}>
                    <button
                      type="button"
                      onClick={toggleDjSound}
                      aria-pressed={isDjPlaying}
                      aria-label={isDjPlaying ? 'DJサウンドを停止' : 'DJサウンドを再生'}
                      className={`relative mx-auto flex items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-black bg-red-600 transition-transform focus:outline-none ${
                        isDjPlaying ? 'ring-4 ring-cyan-300/70 scale-105' : 'hover:scale-[1.02]'
                      }`}
                      style={{ boxShadow: '0 0 20px rgba(255, 0, 122, 0.6), 6px 6px 0 0 #000' }}
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

      <section id="rsvp-form" className="py-20 px-4 bg-yellow-400 scroll-mt-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase" style={{ color: '#22C55E' }}>
              懇親会参加申込
            </h2>
            <div className="w-32 h-2 mx-auto mb-6" style={{ backgroundColor: '#22C55E' }} />
            <p className="text-black text-lg font-bold">
              下記フォームよりご回答ください
            </p>
          </div>

          <RSVPForm />
        </div>
      </section>

      <MediaUploadSection />

      <section id="line-register" className="py-12 md:py-16 px-4 bg-yellow-300 scroll-mt-24">
        <div className="max-w-4xl mx-auto">
          <a
            href="https://line.me/R/ti/p/@091wotfr"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:opacity-90 transition-opacity duration-200"
          >
            <img
              src="/名称_未_設定-1.png"
              alt="麺屋希楽夢 LINE公式アカウント - 営業日、メニュー情報、SNS情報をこちらから登録"
              className="w-full h-auto border-4 border-black"
              style={{ boxShadow: '8px 8px 0 0 #000' }}
              loading="lazy"
            />
          </a>
        </div>
      </section>

      <footer className="bg-black text-white py-12 px-4 border-t-4 border-black">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-2xl font-black mb-4 uppercase">KIRAMU GOLF COMPETITION 2026</h3>
          <p className="text-white mb-6 font-bold">
            ご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
          <p className="text-sm text-white font-bold">
            希楽夢杯実行委員会
          </p>
        </div>
      </footer>
    </div>
  );
}
