import { useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

const sounds = {
  success: require('@/assets/sounds/success1.mp3'),
  error: require('@/assets/sounds/error1.mp3'),
  error2: require('@/assets/sounds/error2.mp3'),
  attention: require('@/assets/sounds/atention1.mp3'),
  click: require('@/assets/sounds/click.mp3'),
  back: require('@/assets/sounds/back1.mp3'),
  init: require('@/assets/sounds/init.mp3'),
};

export function useSound() {
  const soundRef = useRef<Audio.Sound | null>(null);

  const play = useCallback(async (source: keyof typeof sounds) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(sounds[source]);
      soundRef.current = sound;
      await sound.playAsync();
    } catch {
      // Silently fail - sound is non-critical
    }
  }, []);

  const playSuccess = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await play('success');
  }, [play]);

  const playError = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    await play('error');
  }, [play]);

  const playAttention = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await play('attention');
  }, [play]);

  const playClick = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await play('click');
  }, [play]);

  const playBack = useCallback(async () => {
    await play('back');
  }, [play]);

  return { playSuccess, playError, playAttention, playClick, playBack, play };
}
