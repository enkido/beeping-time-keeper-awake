
// src/utils/soundUtils.ts
/**
 * @file soundUtils.ts
 * This module provides utility functions for handling audio playback,
 * specifically for initializing the audio context and playing beep sounds.
 * It includes fallbacks and workarounds for browser compatibility, especially on mobile devices.
 */

// Global AudioContext instance. Initialized once by initAudio().
let audioContext: AudioContext | null = null;
// Flag to track if audio initialization has been attempted and was successful.
// This should reflect the state of audioContext (created and running).
let audioInitialized = false;
// HTMLAudioElement for fallback beep playback.
let audioElementBeep: HTMLAudioElement | null = null;

/**
 * Initializes the audio system. This function should be the sole authority
 * for creating and managing the AudioContext. It should be called as a result
 * of a user interaction (e.g., a button click) to comply with browser autoplay policies.
 *
 * @returns {boolean} True if audioContext is available and running, false otherwise.
 */
export const initAudio = (): boolean => {
  console.log('[soundUtils] Attempting to initialize audio system...');

  if (audioContext && audioContext.state === 'running') {
    console.log('[soundUtils] AudioContext already initialized and running.');
    audioInitialized = true;
    return true;
  }

  try {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.error('[soundUtils] Web Audio API not supported.');
        audioInitialized = false;
        return false;
      }
      audioContext = new AudioContextClass();
      console.log('[soundUtils] AudioContext created. Initial state:', audioContext.state);
    }

    // If context exists but is suspended, attempt to resume it.
    // This is a common scenario that requires user interaction.
    if (audioContext.state === 'suspended') {
      console.log('[soundUtils] AudioContext is suspended, attempting to resume...');
      // Note: resume() is async. The immediate state might not be 'running'.
      // This function should reflect the state *after* the attempt.
      // For now, we will not await resume() here as it might delay user feedback
      // if called from a UI handler expecting a quick return.
      // Instead, playBeep will also have a resume check.
      // The best practice is to call resume in a user gesture handler and then check state.
      // For this function, we return true if it *could* be resumed or is already running.
      // The caller (AudioInitializer) will get this boolean and can then update its state.
      audioContext.resume()
        .then(() => {
          audioInitialized = audioContext!.state === 'running';
          console.log(`[soundUtils] AudioContext resumed. New state: ${audioContext!.state}. Audio Initialized: ${audioInitialized}`);
        })
        .catch(err => {
          console.error('[soundUtils] Failed to resume AudioContext:', err);
          audioInitialized = false;
        });
    }
    
    // Update audioInitialized based on the current state after creation/resume attempt
    audioInitialized = audioContext.state === 'running';

    if (audioInitialized) {
      console.log('[soundUtils] Audio system initialized successfully. State:', audioContext.state);
    } else {
      console.log(`[soundUtils] Audio system initialization attempt complete. Context state: ${audioContext.state}. User interaction might be needed to resume.`);
    }
    // Return true if the context exists and is now running.
    return audioInitialized;

  } catch (e) {
    console.error('[soundUtils] Critical error during audio system initialization:', e);
    audioInitialized = false;
    return false;
  }
};

export const playBeep = (frequency = 880, duration = 300, volume = 1.0): void => {
  console.log(`[soundUtils] playBeep called: freq=${frequency}, duration=${duration}ms, volume=${volume}`);
  
  // Attempt to play with Web Audio API first.
  // playWebAudioBeep will now handle init/resume internally and return success/failure.
  if (playWebAudioBeep(frequency, duration, volume)) {
    console.log('[soundUtils] Beep played successfully or initiated via Web Audio API.');
  } else {
    console.warn('[soundUtils] Web Audio API beep failed or context not running. Falling back to HTMLAudioElement.');
    playAudioElementBeep(volume);
  }
};

// Internal function to play beep once context is confirmed running
// Returns true if playback was successfully initiated, false otherwise.
function _actuallyPlayWebAudioBeep(frequency: number, duration: number, volume: number): boolean {
  if (!audioContext || audioContext.state !== 'running') {
    console.error('[soundUtils] _actuallyPlayWebAudioBeep: AudioContext not running or not available.');
    return false;
  }
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume * 0.5; // Lower gain to prevent clipping
    
    const startTime = audioContext.currentTime;
    oscillator.start(startTime);
    oscillator.stop(startTime + duration / 1000);
    
    console.log('[soundUtils] Web Audio oscillator beep initiated.');
    return true;
  } catch (e) {
    console.error('[soundUtils] Error in _actuallyPlayWebAudioBeep:', e);
    return false;
  }
}

// Primary Web Audio API beep function
// Returns true if beep was successfully played or initiated, false otherwise.
function playWebAudioBeep(frequency: number, duration: number, volume: number): boolean {
  // 1. Ensure AudioContext exists
  if (!audioContext) {
    console.log('[soundUtils] playWebAudioBeep: AudioContext is null. Attempting initAudio().');
    // initAudio() attempts to create and resume. It returns true if context becomes running.
    if (!initAudio() || !audioContext) { 
      console.warn('[soundUtils] playWebAudioBeep: initAudio() failed or audioContext still null. Cannot play WebAudio beep.');
      return false;
    }
    // After initAudio(), context might be running or still suspended (if resume is async and not yet complete)
    console.log(`[soundUtils] playWebAudioBeep: initAudio() called. AudioContext state: ${audioContext.state}`);
  }

  // 2. Handle suspended state (common before full user interaction or if resume in initAudio is async)
  if (audioContext.state === 'suspended') {
    console.log('[soundUtils] playWebAudioBeep: AudioContext is suspended. Attempting synchronous resume is not reliable for immediate playback.');
    // Asynchronous resume() means we can't guarantee playback in this synchronous function call.
    // Best practice is that initAudio(), called by user gesture, should resolve the suspended state.
    // If it's still suspended when playBeep is called, it implies the initial resume might still be pending
    // or requires further interaction. Forcing another resume here might also be blocked by browser.
    // Therefore, we consider this a failure for immediate synchronous Web Audio playback.
    // A non-blocking resume attempt can be made, but success for *this* call is false.
    audioContext.resume().then(() => {
      if (audioContext?.state === 'running') {
        console.log('[soundUtils] playWebAudioBeep: AudioContext resumed successfully (async). Future calls may succeed.');
      } else {
        console.warn('[soundUtils] playWebAudioBeep: AudioContext async resume attempt did not result in running state.');
      }
    }).catch(err => {
      console.error('[soundUtils] playWebAudioBeep: Error during async resume of AudioContext.', err);
    });
    console.warn('[soundUtils] playWebAudioBeep: AudioContext was suspended. Cannot guarantee synchronous WebAudio playback.');
    return false; 
  }
  
  // 3. Check if context is running
  if (audioContext.state === 'running') {
    console.log('[soundUtils] playWebAudioBeep: AudioContext is running. Proceeding with playback.');
    return _actuallyPlayWebAudioBeep(frequency, duration, volume);
  } else {
    // Covers 'closed' or any other unexpected states.
    console.error(`[soundUtils] playWebAudioBeep: AudioContext not running. State: ${audioContext.state}. Cannot play WebAudio beep.`);
    return false;
  }
}

// HTML Audio Element fallback method
function playAudioElementBeep(volume: number): void {
  console.log('[soundUtils] Attempting to play beep via HTMLAudioElement.');
  try {
    if (!audioElementBeep) {
      audioElementBeep = new Audio();
      console.log('[soundUtils] Created new HTMLAudioElement for beeps.');
    }
    
    audioElementBeep.src = generateBeepDataUri(); // Set or reset src
    audioElementBeep.volume = Math.min(Math.max(0, volume), 1.0); // Clamp volume between 0 and 1
    
    const playPromise = audioElementBeep.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('[soundUtils] HTMLAudioElement beep played successfully.');
        })
        .catch(error => {
          console.error('[soundUtils] HTMLAudioElement beep playback failed:', error);
          // If playback fails, trying to release resources or reset might be good.
          // For example, if the error is due to src issues.
          if (audioElementBeep) {
            audioElementBeep.src = ''; // Clear src to potentially help recovery on next attempt
          }
        });
    }
  } catch (e) {
    console.error('[soundUtils] Error in playAudioElementBeep setup:', e);
  }
}

// Generate a simple beep tone as a data URI
function generateBeepDataUri(): string {
  // Simple beep tone in WAV format
  return 'data:audio/wav;base64,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';
}
