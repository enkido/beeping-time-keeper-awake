import EventEmitter from '../lib/EventEmitter';
import { initAudio, playBeep } from '../utils/soundUtils';

class AudioService {
  private eventEmitter: EventEmitter;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
    console.log('[AudioService] Initializing AudioService...');
    
    try {
      initAudio(); // Initialize audio context. Should ideally be called after a user gesture.
      console.log('[AudioService] Audio context initialized successfully or was already active.');
    } catch (error) {
      console.error('[AudioService] Error initializing audio context:', error);
      // Potentially notify the user or set a flag that audio might not work
    }
    
    this.registerEventHandlers();
  }

  private registerEventHandlers(): void {
    console.log('[AudioService] Registering event handlers...');

    this.eventEmitter.on('timeReached', (data) => {
      console.log('[AudioService] Event "timeReached" received with data:', data);
      try {
        playBeep(880, 300, 1.0);
        console.log('[AudioService] Beep played for "timeReached" event.');
      } catch (error) {
        console.error('[AudioService] Error playing beep for "timeReached":', error);
      }
    });

    this.eventEmitter.on('stopwatchStarted', (data) => {
      console.log('[AudioService] Event "stopwatchStarted" received with data:', data);
      try {
        // Optional: Play a sound for stopwatch started
        playBeep(440, 100, 0.25); // A softer, shorter beep for start
        console.log('[AudioService] Beep played for "stopwatchStarted" event.');
      } catch (error) {
        console.error('[AudioService] Error playing beep for "stopwatchStarted":', error);
      }
    });
    
    // Example for other events if needed in the future
    // this.eventEmitter.on('stopwatchStopped', (data) => {
    //   console.log('[AudioService] Event "stopwatchStopped" received with data:', data);
    //   // Potentially play a sound
    // });

    // this.eventEmitter.on('stopwatchReset', () => {
    //   console.log('[AudioService] Event "stopwatchReset" received.');
    //   // Potentially play a sound
    // });

    console.log('[AudioService] Event handlers registered.');
  }

  // Optional: Method to unregister handlers if the service needs to be cleaned up
  public cleanup(): void {
    console.log('[AudioService] Cleaning up AudioService and unregistering event handlers...');
    // It's good practice to remove listeners, especially if AudioService instances are created/destroyed multiple times.
    // To implement this properly, the handlers passed to `on` should be stored if they are anonymous
    // or `off` needs to be called with the exact same function reference.
    // For simplicity, if we assume AudioService is a singleton or lives as long as the app, this might be omitted.
    // However, for robustness:
    // Example: (this would require storing the handler references)
    // this.eventEmitter.off('timeReached', this.handleTimeReached); 
    // this.eventEmitter.off('stopwatchStarted', this.handleStopwatchStarted);
    // For the current implementation with anonymous functions in `on`,
    // we would need to refactor `registerEventHandlers` to use named methods or store the anonymous ones.
    // This is a simplified example for now. A full cleanup would require `off` for all registered events.
    // If EventEmitter's `off` method supports removing all listeners for an event, or all listeners altogether, that could be used.
    // Assuming the current EventEmitter `off` requires the specific handler:
    // This is a placeholder for a more robust cleanup.
  }
}

export default AudioService;
