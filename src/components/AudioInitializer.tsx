
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

  // Removed useEffect hooks for aggressive/automatic audio initialization.
  // Audio initialization is now primarily triggered by user interaction
  // via the button or the mobile overlay.

  const handleAudioInit = () => {
    console.log('[AudioInitializer] Manual audio initialization requested.');
    const success = initAudio(); // Call the updated initAudio from soundUtils
    setAudioInitialized(success); // Update state based on the result
    
    if (success) {
      console.log('[AudioInitializer] Audio initialized successfully via button/overlay.');
      // Play a test beep as feedback
      playBeep(440, 150, 0.2); // Slightly more noticeable test beep
      toast({
        title: "Audio Aktiviert",
        description: "Das Audiosystem ist jetzt bereit. Beep-Töne werden abgespielt.",
      });
    } else {
      console.warn('[AudioInitializer] Audio initialization failed or requires further interaction.');
      toast({
        title: "Audio Aktivierung Ausstehend",
        description: "Audio konnte nicht sofort aktiviert werden. Interaktion mit der Seite könnte erforderlich sein oder Ihr Browser unterstützt es nicht.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Button is always available if direct interaction is preferred or needed */}
      <button
        className={`text-sm px-4 py-2 rounded-md ${
          audioInitialized
            ? "bg-green-100 text-green-800 cursor-not-allowed"
            : "bg-amber-100 hover:bg-amber-200 text-amber-800"
        }`}
        onClick={!audioInitialized ? handleAudioInit : undefined}
        disabled={audioInitialized}
      >
        {audioInitialized ? "Audio Aktiviert" : "Audio Aktivieren"}
      </button>
      
      {/* Full-screen overlay for initial touch on mobile, shown only if audio is not yet initialized. */}
      {isMobile && !audioInitialized && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => {
            console.log('[AudioInitializer] Mobile overlay clicked.');
            handleAudioInit(); // Use the same handler
            // The overlay will disappear automatically if audioInitialized becomes true
            // due to the conditional rendering `!audioInitialized`.
          }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xs text-center">
            <h3 className="text-lg font-semibold mb-2">Audio Aktivieren</h3>
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
