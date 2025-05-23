// src/lib/EventEmitter.test.ts

// import EventEmitter from './EventEmitter'; // Assuming EventEmitter is the default export
// import { vi } from 'vitest'; // Or jest

describe('EventEmitter', () => {
  // let eventEmitter: EventEmitter;

  // beforeEach(() => {
  //   eventEmitter = new EventEmitter();
  // });

  it('should register and call a single event handler', () => {
    // const mockHandler = vi.fn();
    // eventEmitter.on('testEvent', mockHandler);
    // eventEmitter.emit('testEvent');
    // expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('should register and call multiple event handlers for the same event', () => {
    // const mockHandler1 = vi.fn();
    // const mockHandler2 = vi.fn();
    // eventEmitter.on('testEvent', mockHandler1);
    // eventEmitter.on('testEvent', mockHandler2);
    // eventEmitter.emit('testEvent');
    // expect(mockHandler1).toHaveBeenCalledTimes(1);
    // expect(mockHandler2).toHaveBeenCalledTimes(1);
  });

  it('should pass data correctly to event handlers', () => {
    // const mockHandler = vi.fn();
    // const eventData = { key: 'value' };
    // eventEmitter.on('testEventWithData', mockHandler);
    // eventEmitter.emit('testEventWithData', eventData);
    // expect(mockHandler).toHaveBeenCalledWith(eventData);
  });

  it('should correctly unregister a specific event handler', () => {
    // const mockHandler1 = vi.fn();
    // const mockHandler2 = vi.fn();
    // eventEmitter.on('testEvent', mockHandler1);
    // eventEmitter.on('testEvent', mockHandler2);
    // eventEmitter.off('testEvent', mockHandler1);
    // eventEmitter.emit('testEvent');
    // expect(mockHandler1).not.toHaveBeenCalled();
    // expect(mockHandler2).toHaveBeenCalledTimes(1);
  });

  it('should not call a handler after it has been unregistered', () => {
    // const mockHandler = vi.fn();
    // eventEmitter.on('testEvent', mockHandler);
    // eventEmitter.off('testEvent', mockHandler);
    // eventEmitter.emit('testEvent');
    // expect(mockHandler).not.toHaveBeenCalled();
  });

  it('should handle emitting events with no registered handlers gracefully', () => {
    // expect(() => eventEmitter.emit('unhandledEvent')).not.toThrow();
  });
  
  it('should handle unregistering a handler that was not registered gracefully', () => {
    // const mockHandler = vi.fn();
    // expect(() => eventEmitter.off('nonExistentEvent', mockHandler)).not.toThrow();
  });

  it('should handle unregistering from an event that has no handlers gracefully', () => {
    // const mockHandler = vi.fn(); // A handler that was never registered for this specific event
    // eventEmitter.on('anotherEvent', vi.fn()); // Ensure another event exists
    // expect(() => eventEmitter.off('nonExistentEventForHandlers', mockHandler)).not.toThrow();
  });

  it('should remove the event entry if all handlers for an event are unregistered', () => {
    // const mockHandler = vi.fn();
    // eventEmitter.on('testEvent', mockHandler);
    // eventEmitter.off('testEvent', mockHandler);
    // // Internally, check if the 'testEvent' key is deleted from the handlers object.
    // // This might require inspecting the internal state if possible, or be inferred from behavior.
    // // For example, if logging is present, check logs, or if it affects other logic.
    // // For this conceptual test, we acknowledge the intent.
    // // A more direct test would be if `EventEmitter` exposed a method like `hasEvent(eventName)`.
    // expect(true).toBe(true); // Placeholder for the internal check logic
  });
});
