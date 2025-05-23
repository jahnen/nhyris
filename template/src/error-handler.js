// Error Handling System
class ErrorHandler {
  static logError(context, error, metadata = {}) {
    const errorInfo = {
      context,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    console.error(`[${context}] Error:`, errorInfo);

    // TODO: Integrate with error reporting service in the future
    // this.reportToService(errorInfo);
  }

  static async handleAsyncError(context, asyncFn, fallbackValue = null) {
    try {
      return await asyncFn();
    } catch (error) {
      this.logError(context, error);
      return fallbackValue;
    }
  }

  static handleSyncError(context, syncFn, fallbackValue = null) {
    try {
      return syncFn();
    } catch (error) {
      this.logError(context, error);
      return fallbackValue;
    }
  }
}

module.exports = ErrorHandler;
