import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Audio } from 'expo-av';

interface MusicContextProps {
  isPlaying: boolean;
  volume: number;
  toggleMusic: () => void;
  setVolume: (value: number) => void;
}

const MusicContext = createContext<MusicContextProps>({
  isPlaying: false,
  volume: 0.01,
  toggleMusic: () => {},
  setVolume: () => {},
});

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolumeState] = useState(0.01);

  useEffect(() => {
    let isMounted = true;
    let localSound: Audio.Sound;

    const loadMusic = async () => {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          require('../assets/ambient_music/music.wav'),
          { shouldPlay: true, isLooping: true, volume }
        );
        localSound = newSound;
        if (isMounted) setSound(localSound);
      } catch (err) {
        console.log('Erro ao tocar música ambiente:', err);
      }
    };

    loadMusic();

    return () => {
      isMounted = false;
      if (localSound) {
        localSound.unloadAsync().catch(() => {}); // garante que não dê erro
      }
    };
  }, []);

  const toggleMusic = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const setVolume = async (value: number) => {
    setVolumeState(value);
    if (sound) await sound.setVolumeAsync(value);
  };

  return (
    <MusicContext.Provider value={{ isPlaying, volume, toggleMusic, setVolume }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);
