
// Audio context for playing beep sounds
let audioContext: AudioContext | null = null;

export const initAudio = (): void => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error('Web Audio API is not supported in this browser', e);
    }
  }
};

export const playBeep = (frequency = 800, duration = 200, volume = 0.5): void => {
  try {
    if (!audioContext) {
      initAudio();
    }
    
    if (audioContext) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set beep properties
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.value = volume;
      
      // Start and stop the beep
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    }
  } catch (e) {
    console.error('Error playing beep sound:', e);
  }
};
