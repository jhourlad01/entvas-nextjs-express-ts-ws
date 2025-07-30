// Store received events in memory (in a real app, this would be a database)
const events = [];
let invalidEventsCount = 0;

class EventService {
  /**
   * Add a new event to storage
   * @param {Object} event - The event object
   * @param {Date} receivedAt - When the event was received
   * @returns {Object} The stored event with ID
   */
  static addEvent(event, receivedAt) {
    const storedEvent = {
      ...event,
      receivedAt: receivedAt.toISOString()
    };
    events.push(storedEvent);
    return storedEvent;
  }

  /**
   * Get all events
   * @returns {Array} Array of all stored events
   */
  static getAllEvents() {
    return events;
  }

  /**
   * Get event count
   * @returns {number} Total number of events
   */
  static getEventCount() {
    return events.length;
  }

  /**
   * Get event statistics by type
   * @returns {Object} Event type counts
   */
  static getEventStatistics() {
    return events.reduce((acc, e) => {
      acc[e.eventType] = (acc[e.eventType] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Log event details
   * @param {Object} event - The event object
   * @param {Date} receivedAt - When the event was received
   * @param {string} source - Source of the request
   */
  static logEventDetails(event, receivedAt, source) {
    console.log('\n' + '='.repeat(60));
    console.log('WEBHOOK EVENT RECEIVED');
    console.log('='.repeat(60));
    console.log(`Received at: ${receivedAt.toISOString()}`);
    console.log(`Source: ${source || 'Unknown'}`);
    console.log(`Total events received: ${this.getEventCount()}`);
    
    console.log('VALIDATION PASSED');
    console.log('Event Details:');
    console.log(`   Event Type: ${event.eventType}`);
    console.log(`   User ID: ${event.userId}`);
    console.log(`   Timestamp: ${event.timestamp}`);
    
    if (event.metadata) {
      console.log('   Metadata:');
      Object.entries(event.metadata).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`);
      });
    }
    
    console.log(`   Event ID: ${this.getEventCount()}`);
    console.log(`   Stored at: ${receivedAt.toISOString()}`);
    
    // Print event statistics
    const eventTypeCounts = this.getEventStatistics();
    console.log('Event Statistics:');
    Object.entries(eventTypeCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} events`);
    });
    console.log(`   validation_errors: ${this.getInvalidEventsCount()} events`);
    
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Log validation failure
   * @param {Array} errors - Validation error details
   */
  static logValidationFailure(errors) {
    invalidEventsCount++;
    console.log('VALIDATION FAILED:');
    errors.forEach(detail => {
      console.log(`   Field: ${detail.path.join('.')} - ${detail.message}`);
    });
    console.log(`   Invalid events count: ${invalidEventsCount}`);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Get invalid events count
   * @returns {number} Total number of invalid events
   */
  static getInvalidEventsCount() {
    return invalidEventsCount;
  }
}

module.exports = EventService; 