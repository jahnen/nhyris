const ErrorHandler = require("./error-handler");

class ServerUtils {
  static async checkServerStatus(url, timeout = 3000) {
    return ErrorHandler.handleAsyncError(
      "ServerUtils.checkServerStatus",
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const res = await fetch(url, {
            method: "HEAD",
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          return res.status === 200;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      false
    );
  }

  static async waitFor(milliseconds) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }

  static async waitForServerWithExponentialBackoff(
    url,
    maxAttempts = 10,
    initialDelay = 2000,
    maxDelay = 10000,
    backoffFactor = 1.5,
    statusCallback = null
  ) {
    let currentDelay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (attempt > 1) {
        await this.waitFor(currentDelay);
      }

      const isUp = await this.checkServerStatus(url);
      if (isUp) {
        const msg = `Server responded on attempt ${attempt} after ${currentDelay}ms delay`;
        console.log(msg);
        if (statusCallback) statusCallback(msg);
        return true;
      }

      currentDelay = Math.min(currentDelay * backoffFactor, maxDelay);

      const msg = `Server check attempt ${attempt}/${maxAttempts} failed. Next delay: ${currentDelay}ms`;
      console.log(msg);
      if (statusCallback) statusCallback(msg);
    }

    return false;
  }

  static async waitForServerWithJitter(
    url,
    maxAttempts = 10,
    baseDelay = 100,
    maxDelay = 3000
  ) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (attempt > 1) {
        const jitter = Math.random() * 0.3;
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt - 2) * (1 + jitter),
          maxDelay
        );
        await this.waitFor(delay);
      }

      const isUp = await this.checkServerStatus(url);
      if (isUp) {
        return true;
      }
    }

    return false;
  }

  static async waitForServerSmart(
    url,
    strategy = "exponential",
    statusCallback = null
  ) {
    switch (strategy) {
      default:
      case "exponential":
        return await this.waitForServerWithExponentialBackoff(
          url,
          10,
          1000,
          5000,
          1.5,
          statusCallback
        );
      case "jitter":
        return await this.waitForServerWithJitter(url);
    }
  }
}

module.exports = ServerUtils;
