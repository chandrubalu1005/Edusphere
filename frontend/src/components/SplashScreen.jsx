import { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    // 1.5s of logo entering and being visible
    const snapTimer = setTimeout(() => {
      setPhase('snap');
    }, 1500);

    // Snap animation takes about 1.5s, then we fade out the overlay
    const fadeTimer = setTimeout(() => {
      setPhase('fadeout');
    }, 3000);

    // Tell parent to remove this component completely
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3800);

    return () => {
      clearTimeout(snapTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`splash-overlay ${phase === 'fadeout' ? 'splash-fadeout' : ''}`}>
      <div className={`splash-logo-container ${phase === 'snap' ? 'thanos-snap' : ''}`}>
        <div className="splash-logo-mark">E</div>
        <div className="splash-logo-text">
          <span className="splash-title">EduSphere</span>
          <span className="splash-tagline">ENTERPRISE UNIVERSITY PLATFORM</span>
        </div>
      </div>
    </div>
  );
}
