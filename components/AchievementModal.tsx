
import React, { useEffect, useState } from 'react';
import { Achievement } from '../types';

interface Props {
  achievement: Achievement;
}

export const AchievementModal: React.FC<Props> = ({ achievement }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-12 right-12 w-80 bg-black/90 glass border border-yellow-500/50 p-4 rounded-xl shadow-2xl animate-in slide-in-from-right-full duration-700 z-50">
      <div className="flex gap-4">
        <div className="w-12 h-12 flex-shrink-0 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 border border-yellow-500/30">
          🏆
        </div>
        <div>
          <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">New Achievement</p>
          <h4 className="text-md font-bold text-white">{achievement.title}</h4>
          <p className="text-xs text-white/60 mt-1">{achievement.description}</p>
        </div>
      </div>
    </div>
  );
};
