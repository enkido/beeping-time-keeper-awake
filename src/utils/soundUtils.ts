
// Audio context for playing beep sounds
let audioContext: AudioContext | null = null;
let audioInitialized = false;

export const initAudio = (): boolean => {
  if (!audioContext) {
    try {
      // Create new audio context
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioInitialized = true;
      console.log('Audio context initialized successfully');
      return true;
    } catch (e) {
      console.error('Web Audio API is not supported in this browser', e);
      return false;
    }
  }
  
  // Make sure to resume if suspended
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      console.log('AudioContext resumed successfully');
    }).catch(err => {
      console.error('Failed to resume AudioContext:', err);
    });
  }
  
  return audioInitialized;
};

// Alternative beep implementation using built-in Audio object
// This works more reliably across browsers
export const playBeep = (frequency = 800, duration = 200, volume = 1.0): void => {
  try {
    // First try using Web Audio API
    if (audioInitialized || initAudio()) {
      if (!audioContext) {
        throw new Error('Audio context not available');
      }
      
      // Resume audio context if it's suspended (browsers require user interaction)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('AudioContext resumed successfully');
          generateBeep(audioContext, frequency, duration, volume);
        }).catch(err => {
          console.error('Failed to resume AudioContext:', err);
          fallbackBeep();
        });
      } else {
        generateBeep(audioContext, frequency, duration, volume);
      }
    } else {
      // Fallback to Audio object if Web Audio API initialization failed
      fallbackBeep();
    }
  } catch (e) {
    console.error('Error in playBeep:', e);
    fallbackBeep();
  }
};

function generateBeep(context: AudioContext, frequency: number, duration: number, volume: number) {
  console.log(`Generating beep with Web Audio API: freq=${frequency}, duration=${duration}, volume=${volume}`);
  
  try {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Set beep properties
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.value = volume;
    
    // Start and stop the beep
    const startTime = context.currentTime;
    oscillator.start(startTime);
    oscillator.stop(startTime + duration / 1000);
    
    console.log('Beep started');
  } catch (e) {
    console.error('Error generating beep with Web Audio API:', e);
    fallbackBeep();
  }
}

function fallbackBeep() {
  console.log('Using fallback Audio beep method');
  try {
    // Create and play a short beep sound using Audio object
    const audio = new Audio('data:audio/wav;base64,UklGRnQGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU8GAAAAAP//AAAAAP//AAAA//8A/wD///8AAAD//wAAAAD/AAD/AP//////AAD/AP//AAD//wD/AP///wD/AP//////AP///wD//wD/AP///wD/AP//AAD//wAA//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAA//8AAP////8AAP////8AAP//AAD//wAA//8AAP//AAAAAAAAAAAAAAAA//8AAP//AAAAAAAA//8AAAAA//8AAP//AAAAAAAAAAAAAAAAAAAAAP//AAAAAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//AAAAAAAAAAAAAAAA//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAA/wD/AAAAAAD/AAAAAAAAAAD/AAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8A/wAAAAAAAAAAAAAAAAAAAP8A/wAAAAAA/wAAAAAAAAAAAAD/AAAAAAAAAAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAAAAD/AAAAAAAAAAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAAAAAAAAP8AAAAAAAAAAAAA//8AAAAAAAAAAP//AAD//wAA//8AAAAA//8AAAAAAAD//wAA//8AAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAA//8AAP//AAD//wAA//8AAAAA//8AAP//AAAAAAAAAAAAAAAAAAAAAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAAAAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAAAAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAAAAAAAAAAAAAAAAAAAA');
    audio.volume = 1.0; // Maximum volume
    audio.play().catch(e => {
      console.error('Failed to play fallback audio:', e);
    });
  } catch (e) {
    console.error('Fallback audio method failed:', e);
  }
}

// Function to test if audio is working
export const testBeep = () => {
  console.log('Testing beep...');
  playBeep(440, 500, 1.0); // A4 note, 500ms, max volume
};
