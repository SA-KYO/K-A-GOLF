import { useEffect, useState } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function Countdown() {
  const targetDate = new Date('2026-03-03T00:00:00').getTime();

  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
  const [prevSeconds, setPrevSeconds] = useState<number>(timeLeft.seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      setPrevSeconds(timeLeft.seconds);
      setTimeLeft(newTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft.seconds]);

  return (
    <div className="relative">
      <style>{`
        @keyframes steam {
          0% {
            opacity: 0.7;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 0.4;
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) scale(1.5);
          }
        }

        @keyframes numberFlip {
          0% {
            transform: rotateX(0deg);
          }
          50% {
            transform: rotateX(90deg);
          }
          100% {
            transform: rotateX(0deg);
          }
        }

        @keyframes slideUp {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .steam {
          animation: steam 2s ease-in-out infinite;
        }

        .number-flip {
          animation: numberFlip 0.6s ease-in-out;
        }

        .slide-up {
          animation: slideUp 2s ease-in-out infinite;
        }

        .neo-brutal-card {
          box-shadow: 6px 6px 0 0 var(--shadow-color);
          transition: all 0.2s ease;
        }

        .neo-brutal-card:hover {
          transform: translate(2px, 2px);
          box-shadow: 4px 4px 0 0 var(--shadow-color);
        }
      `}</style>

      <div className="flex justify-center gap-2 md:gap-8 text-center relative">
        <div className="flex flex-col items-center relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <div className="steam text-2xl">💨</div>
          </div>
          <div className="bg-yellow-400 border-4 border-black neo-brutal-card p-3 md:p-6 min-w-[70px] md:min-w-[100px]">
            <div className={`text-3xl md:text-5xl font-black ${prevSeconds !== timeLeft.seconds ? 'number-flip' : ''}`} style={{ color: 'var(--forest)' }}>
              {timeLeft.days}
            </div>
          </div>
          <div className="text-sm md:text-base font-black mt-3 text-black uppercase tracking-wider">日</div>
        </div>

        <div className="flex flex-col items-center relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <div className="steam text-2xl" style={{ animationDelay: '0.3s' }}>💨</div>
          </div>
          <div className="bg-yellow-400 border-4 border-black neo-brutal-card p-3 md:p-6 min-w-[70px] md:min-w-[100px]">
            <div className={`text-3xl md:text-5xl font-black ${prevSeconds !== timeLeft.seconds ? 'number-flip' : ''}`} style={{ color: 'var(--forest)' }}>
              {timeLeft.hours}
            </div>
          </div>
          <div className="text-sm md:text-base font-black mt-3 text-black uppercase tracking-wider">時間</div>
        </div>

        <div className="flex flex-col items-center relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <div className="steam text-2xl" style={{ animationDelay: '0.6s' }}>💨</div>
          </div>
          <div className="bg-yellow-400 border-4 border-black neo-brutal-card p-3 md:p-6 min-w-[70px] md:min-w-[100px]">
            <div className={`text-3xl md:text-5xl font-black ${prevSeconds !== timeLeft.seconds ? 'number-flip' : ''}`} style={{ color: 'var(--forest)' }}>
              {timeLeft.minutes}
            </div>
          </div>
          <div className="text-sm md:text-base font-black mt-3 text-black uppercase tracking-wider">分</div>
        </div>

        <div className="flex flex-col items-center relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <div className="steam text-2xl" style={{ animationDelay: '0.9s' }}>💨</div>
          </div>
          <div className="bg-yellow-400 border-4 border-black neo-brutal-card p-3 md:p-6 min-w-[70px] md:min-w-[100px]">
            <div className={`text-3xl md:text-5xl font-black ${prevSeconds !== timeLeft.seconds ? 'number-flip' : ''}`} style={{ color: 'var(--forest)' }}>
              {timeLeft.seconds}
            </div>
          </div>
          <div className="text-sm md:text-base font-black mt-3 text-black uppercase tracking-wider">秒</div>
        </div>
      </div>
    </div>
  );
}
