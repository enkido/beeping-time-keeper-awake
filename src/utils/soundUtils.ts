
// Audio context for playing beep sounds
let audioContext: AudioContext | null = null;
let audioInitialized = false;
let audioElement: HTMLAudioElement | null = null;

// Initialize the audio system with multiple approaches
export const initAudio = (): boolean => {
  console.log('Initializing audio system...');
  
  if (!audioContext) {
    try {
      // Create Web Audio API context
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('Audio context created:', audioContext.state);
      
      // Try to resume it immediately (might need user interaction)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('AudioContext resumed on init');
        }).catch(err => {
          console.error('Failed to resume AudioContext:', err);
        });
      }
      
      // Also initialize the audio element for fallback
      audioElement = new Audio();
      audioElement.src = 'data:audio/mp3;base64,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';
      audioElement.load();
      console.log('Audio element created for fallback playback');
      
      // Flag as initialized
      audioInitialized = true;
      return true;
    } catch (e) {
      console.error('Failed to initialize audio system:', e);
      return false;
    }
  }
  
  return audioInitialized;
};

// Higher volume, multiple sound types for better chance of being heard
export const playBeep = (frequency = 880, duration = 300, volume = 1.0): void => {
  try {
    console.log(`🔊 PLAYING BEEP: freq=${frequency}, duration=${duration}ms, volume=${volume}`);
    
    // Try all available methods to maximize chances of sound playing
    playWebAudioBeep(frequency, duration, volume);
    playAudioElementBeep(volume);
    playOscillatorBeep(volume);
    
  } catch (e) {
    console.error('Error in playBeep:', e);
  }
};

// Method 1: Web Audio API oscillator
function playWebAudioBeep(frequency: number, duration: number, volume: number) {
  if (!audioContext) {
    initAudio();
    if (!audioContext) return;
  }
  
  try {
    // Make sure context is running
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(err => console.error('Failed to resume context:', err));
    }
    
    // Create oscillator
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set properties
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;
    
    // Start and stop the beep
    const startTime = audioContext.currentTime;
    oscillator.start(startTime);
    oscillator.stop(startTime + duration / 1000);
    
    console.log('Web Audio oscillator beep started');
  } catch (e) {
    console.error('Web Audio oscillator beep failed:', e);
  }
}

// Method 2: HTML Audio Element
function playAudioElementBeep(volume: number) {
  try {
    if (!audioElement) {
      audioElement = new Audio();
      audioElement.src = 'data:audio/mp3;base64,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';
      audioElement.load();
    }
    
    audioElement.volume = volume;
    
    const playPromise = audioElement.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('Audio element beep played successfully');
      }).catch(error => {
        console.error('Audio element beep failed:', error);
      });
    }
  } catch (e) {
    console.error('Audio element beep error:', e);
  }
}

// Method 3: Direct oscillator
function playOscillatorBeep(volume: number) {
  try {
    // Create a new audio context specifically for this beep
    const tempContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const tempOscillator = tempContext.createOscillator();
    const tempGain = tempContext.createGain();
    
    // Set properties
    tempOscillator.type = 'square'; // Square wave is more noticeable
    tempOscillator.frequency.value = 1000; // High frequency
    tempGain.gain.value = volume;
    
    // Connect
    tempOscillator.connect(tempGain);
    tempGain.connect(tempContext.destination);
    
    // Play
    tempOscillator.start();
    tempOscillator.stop(tempContext.currentTime + 0.3);
    
    console.log('Direct oscillator beep played');
    
    // Clean up after playing
    setTimeout(() => {
      tempContext.close().catch(err => console.error('Error closing temp context:', err));
    }, 500);
  } catch (e) {
    console.error('Direct oscillator beep error:', e);
  }
}
