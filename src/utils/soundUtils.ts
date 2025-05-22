
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
let audioInitialized = false;
// HTMLAudioElement used as a fallback or for specific platforms like Android.
let audioElement: HTMLAudioElement | null = null;

/**
 * Initializes the audio system. This function should be called once, ideally
 * as a result of a user interaction (e.g., a button click), to comply with
 * browser autoplay policies.
 * It attempts to create a Web Audio API AudioContext and an HTMLAudioElement
 * as a fallback and for platforms requiring it (like Android for reliable playback).
 * A silent sound is played on the audioElement to "unlock" audio capabilities on some mobile browsers.
 *
 * @returns {boolean} True if audio was successfully initialized (or already was), false otherwise.
 */
export const initAudio = (): boolean => {
  console.log('Initializing audio system...');
  
  // If audio is already initialized, return true
  if (audioInitialized && audioContext) {
    return true;
  }
  
  // Attempt initialization
  try {
    // Create Web Audio API context. Uses `webkitAudioContext` for older Safari compatibility.
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass();
    console.log('Audio context created:', audioContext.state);
    
    // If the audio context is created in a suspended state, try to resume it.
    // This is common in browsers before a user interaction.
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        console.log('AudioContext resumed on init');
      }).catch(err => {
        console.error('Failed to resume AudioContext:', err);
      });
    }
    
    // Also initialize the audio element for fallback
    audioElement = new Audio();
    // Using a very short sound file for Android compatibility
    audioElement.src = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABMYW50ZQAAAAAAPAAAAAAAAAAAAAAAAgA=';
    audioElement.load();
    console.log('Audio element created for fallback playback');
    
    // Try to play a silent sound to unlock audio on Android
    const silentPlay = () => {
      if (audioElement) {
        audioElement.volume = 0.01;
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Silent audio played successfully to unlock audio API');
              audioElement!.pause();
              audioElement!.currentTime = 0;
            })
            .catch(error => {
              console.log('Silent play was prevented:', error);
            });
        }
      }
    };
    
    // Try silent play for Android
    silentPlay();
    
    // Flag as initialized
    audioInitialized = true;
    return true;
  } catch (e) {
    console.error('Failed to initialize audio system:', e);
    return false;
  }
};

// Higher volume, multiple sound types for better chance of being heard
export const playBeep = (frequency = 880, duration = 300, volume = 1.0): void => {
  try {
    console.log(`🔊 PLAYING BEEP: freq=${frequency}, duration=${duration}ms, volume=${volume}`);
    
    // Try all available methods to maximize chances of sound playing
    playWebAudioBeep(frequency, duration, volume);
    playAudioElementBeep(volume);
    
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
    gainNode.gain.value = volume * 0.5; // Lower gain to prevent clipping
    
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
    // Generate a beep data URI locally instead of using a static one that might not load
    const beepDataUri = generateBeepDataUri();
    
    // Create a new audio element for each beep to avoid playback issues
    const beepElement = new Audio(beepDataUri);
    beepElement.volume = Math.min(volume, 1.0); // Ensure volume doesn't exceed 1.0
    
    const playPromise = beepElement.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('Audio element beep played successfully');
        // Clean up to prevent memory leaks
        beepElement.onended = () => {
          beepElement.src = '';
        };
      }).catch(error => {
        console.error('Audio element beep failed:', error);
      });
    }
  } catch (e) {
    console.error('Audio element beep error:', e);
  }
}

// Generate a simple beep tone as a data URI
function generateBeepDataUri(): string {
  // Simple beep tone in WAV format
  return 'data:audio/wav;base64,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';
}
