
import React, { useEffect, useState } from 'react';
import { initAudio, playBeep } from '@/utils/soundUtils';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface AudioInitializerProps {
  audioInitialized: boolean;
  setAudioInitialized: (value: boolean) => void;
}

const AudioInitializer: React.FC<AudioInitializerProps> = ({ 
  audioInitialized, 
  setAudioInitialized 
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Initialize audio context aggressively on app load
  useEffect(() => {
    console.log('Initializing audio on app load');
    // Try to initialize audio immediately
    const initialized = initAudio();
    setAudioInitialized(initialized);
    
    // For Android compatibility, initialize audio again after a small delay
    const timeoutId = setTimeout(() => {
      const initialized = initAudio();
      setAudioInitialized(initialized);
      console.log('Delayed audio initialization:', initialized);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [setAudioInitialized]);
  
  // Try to initialize audio on any user interaction
  useEffect(() => {
    console.log('Setting up user interaction listeners for audio');
    const interactionEvents = ['click', 'touchstart', 'keydown'];
    
    const handleUserInteraction = () => {
      console.log('User interaction detected - initializing audio');
      const initialized = initAudio();
      setAudioInitialized(initialized);
      
      // Play a test beep with very low volume (almost silent)
      try {
        const testAudio = new Audio();
        testAudio.volume = 0.01; // Very low volume
        testAudio.play().catch(() => {}); // Ignore errors
      } catch (e) {
        // Ignore errors
      }
    };
    
    // Add listeners for user interaction events
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction);
    });
    
    // Clean up listeners on unmount
    return () => {
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [setAudioInitialized]);

  const handleAudioInit = () => {
    console.log('Manual audio initialization requested');
    const success = initAudio();
    setAudioInitialized(success);
    
    if (success) {
      // Play a test beep
      playBeep(440, 100, 0.1);
      toast({
        title: "Audio aktiviert",
        description: "Audio wurde initialisiert. Beeps sollten jetzt funktionieren.",
      });
    }
  };

  return (
    <>
      <button
        className="text-sm px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-md"
        onClick={handleAudioInit}
      >
        Audio aktivieren
      </button>
      
      {/* Special button that covers the whole screen for first touch on Android */}
      {isMobile && !audioInitialized && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => {
            handleAudioInit();
            // Remove the overlay after initialization
            setAudioInitialized(true);
          }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xs text-center">
            <h3 className="text-lg font-semibold mb-2">Audio aktivieren</h3>
            <p className="mb-4">Bitte tippen Sie auf den Bildschirm, um die Audiofunktion zu aktivieren.</p>
            <button className="bg-amber-500 text-white px-4 py-2 rounded-md">
              Hier tippen
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AudioInitializer;
