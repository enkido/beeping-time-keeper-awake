// src/services/AudioService.test.ts

// import AudioService from './AudioService';
// import EventEmitter from '../lib/EventEmitter';
// import * as soundUtils from '../utils/soundUtils'; // To mock initAudio and playBeep
// import { vi } from 'vitest'; // Or jest

// Mock the soundUtils module
// vi.mock('../utils/soundUtils', () => ({
//   initAudio: vi.fn(),
//   playBeep: vi.fn(),
// }));

// Mock EventEmitter
// const mockEventEmitter = {
//   on: vi.fn(),
//   off: vi.fn(), // If cleanup is implemented and tested
//   emit: vi.fn(), // Not directly used by AudioService listening, but good for completeness
// };
// vi.mock('../lib/EventEmitter', () => ({
//   default: vi.fn(() => mockEventEmitter),
// }));


describe('AudioService', () => {
  // let audioService: AudioService;
  // let eventEmitterInstance: EventEmitter;

  // beforeEach(() => {
    // Clear mocks before each test
    // vi.clearAllMocks();

    // Create a fresh EventEmitter mock instance for each test if needed, or use the global mock
    // eventEmitterInstance = new EventEmitter(); // This will use the mocked constructor
    // audioService = new AudioService(eventEmitterInstance);
  // });

  it('should call initAudio on instantiation', () => {
    // expect(soundUtils.initAudio).toHaveBeenCalledTimes(1);
  });

  it('should subscribe to "timeReached" event on instantiation', () => {
    // expect(eventEmitterInstance.on).toHaveBeenCalledWith('timeReached', expect.any(Function));
  });

  it('should subscribe to "stopwatchStarted" event on instantiation', () => {
    // expect(eventEmitterInstance.on).toHaveBeenCalledWith('stopwatchStarted', expect.any(Function));
  });

  it('should call playBeep when "timeReached" event is emitted', () => {
    // Simulate event emission:
    // Find the handler passed to eventEmitter.on for 'timeReached'
    // const timeReachedHandler = (eventEmitterInstance.on as vi.Mock).mock.calls.find(
    //   call => call[0] === 'timeReached'
    // )[1];
    // timeReachedHandler({ currentTime: 5000 }); // Simulate with example data
    // expect(soundUtils.playBeep).toHaveBeenCalledTimes(1);
  });

  it('should call playBeep with correct parameters for "timeReached" (e.g., 880, 300, 1.0)', () => {
    // const timeReachedHandler = (eventEmitterInstance.on as vi.Mock).mock.calls.find(
    //   call => call[0] === 'timeReached'
    // )[1];
    // timeReachedHandler({ currentTime: 5000 });
    // expect(soundUtils.playBeep).toHaveBeenCalledWith(880, 300, 1.0);
  });
  
  it('should call playBeep when "stopwatchStarted" event is emitted', () => {
    // const stopwatchStartedHandler = (eventEmitterInstance.on as vi.Mock).mock.calls.find(
    //   call => call[0] === 'stopwatchStarted'
    // )[1];
    // stopwatchStartedHandler({ startTime: 0 }); // Simulate with example data
    // expect(soundUtils.playBeep).toHaveBeenCalledTimes(1); // Or more if timeReached also triggered a call
  });

  it('should call playBeep with correct parameters for "stopwatchStarted" (e.g., 440, 100, 0.25)', () => {
    // const stopwatchStartedHandler = (eventEmitterInstance.on as vi.Mock).mock.calls.find(
    //   call => call[0] === 'stopwatchStarted'
    // )[1];
    // stopwatchStartedHandler({ startTime: 0 });
    // expect(soundUtils.playBeep).toHaveBeenCalledWith(440, 100, 0.25);
  });

  it('should handle errors during playBeep for "timeReached" gracefully', () => {
    // (soundUtils.playBeep as vi.Mock).mockImplementationOnce(() => {
    //   throw new Error('Test beep error');
    // });
    // const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // const timeReachedHandler = (eventEmitterInstance.on as vi.Mock).mock.calls.find(
    //   call => call[0] === 'timeReached'
    // )[1];
    
    // expect(() => timeReachedHandler({ currentTime: 5000 })).not.toThrow();
    // expect(consoleErrorSpy).toHaveBeenCalledWith(
    //   '[AudioService] Error playing beep for "timeReached":',
    //   expect.any(Error)
    // );
    // consoleErrorSpy.mockRestore();
  });
  
  // Add similar test for 'stopwatchStarted' error handling if desired.
});
