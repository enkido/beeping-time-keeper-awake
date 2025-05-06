
// Audio context for playing beep sounds
let audioContext: AudioContext | null = null;
let audioInitialized = false;

export const initAudio = (): void => {
  if (!audioContext) {
    try {
      // Create new audio context
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioInitialized = true;
      console.log('Audio context initialized successfully');
    } catch (e) {
      console.error('Web Audio API is not supported in this browser', e);
    }
  }
};

export const playBeep = (frequency = 800, duration = 200, volume = 1.0): void => {
  try {
    // Make sure audio is initialized
    if (!audioInitialized) {
      initAudio();
    }
    
    if (!audioContext) {
      console.error('Audio context not available');
      return;
    }
    
    // Resume audio context if it's suspended (browsers require user interaction)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    console.log('Playing beep sound...');
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set beep properties
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.value = volume;
    
    // Start and stop the beep
    const startTime = audioContext.currentTime;
    oscillator.start(startTime);
    oscillator.stop(startTime + duration / 1000);
    
    // Add debug log to check if beep completed
    setTimeout(() => {
      console.log('Beep sound should have completed');
    }, duration + 100);
  } catch (e) {
    console.error('Error playing beep sound:', e);
  }
};

