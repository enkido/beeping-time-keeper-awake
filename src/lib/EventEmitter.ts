interface Handler {
  (data?: any): void;
}

interface EventHandlers {
  [eventName: string]: Handler[];
}

class EventEmitter {
  private handlers: EventHandlers = {};

  public on(eventName: string, handler: Handler): void {
    if (!this.handlers[eventName]) {
      this.handlers[eventName] = [];
    }
    this.handlers[eventName].push(handler);
    console.log(`[EventEmitter] Registered handler for event: ${eventName}. Total handlers: ${this.handlers[eventName].length}`);
  }

  public off(eventName: string, handler: Handler): void {
    if (!this.handlers[eventName]) {
      console.log(`[EventEmitter] No handlers for event: ${eventName}, cannot unregister.`);
      return;
    }

    const originalLength = this.handlers[eventName].length;
    this.handlers[eventName] = this.handlers[eventName].filter(
      (registeredHandler) => registeredHandler !== handler
    );

    if (this.handlers[eventName].length < originalLength) {
      console.log(`[EventEmitter] Unregistered handler for event: ${eventName}. Remaining handlers: ${this.handlers[eventName].length}`);
    } else {
      console.log(`[EventEmitter] Handler not found for event: ${eventName}, no change in handlers.`);
    }

    if (this.handlers[eventName].length === 0) {
      delete this.handlers[eventName];
      console.log(`[EventEmitter] All handlers removed for event: ${eventName}. Event entry deleted.`);
    }
  }

  public emit(eventName: string, data?: any): void {
    console.log(`[EventEmitter] Emitting event: "${eventName}"`, data !== undefined ? { data } : '');
    if (!this.handlers[eventName]) {
      console.log(`[EventEmitter] No handlers for event: "${eventName}", emission skipped.`);
      return;
    }

    console.log(`[EventEmitter] Invoking ${this.handlers[eventName].length} handler(s) for event: "${eventName}"`);
    this.handlers[eventName].forEach((handler, index) => {
      try {
        // console.log(`[EventEmitter] Invoking handler #${index + 1} for event: "${eventName}"`);
        handler(data);
      } catch (error) {
        console.error(`[EventEmitter] Error in handler #${index + 1} for event "${eventName}":`, error);
      }
    });
  }
}

// Export the class for use in other modules
export default EventEmitter;
