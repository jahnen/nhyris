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
    initialDelay = 1000,
    maxDelay = 5000,
    backoffFactor = 1.5
  ) {
    let currentDelay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (attempt > 1) {
        await this.waitFor(currentDelay);
      }

      const isUp = await this.checkServerStatus(url);
      if (isUp) {
        console.log(
          `Server responded on attempt ${attempt} after ${currentDelay}ms delay`
        );
        return true;
      }

      currentDelay = Math.min(currentDelay * backoffFactor, maxDelay);

      console.log(
        `Server check attempt ${attempt}/${maxAttempts} failed. Next delay: ${currentDelay}ms`
      );
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

  static async waitForServerSmart(url, strategy = "exponential") {
    switch (strategy) {
      case "exponential":
        return await this.waitForServerWithExponentialBackoff(url);
      case "jitter":
        return await this.waitForServerWithJitter(url);
      default:
        return await this.waitForServerWithExponentialBackoff(url);
    }
  }
}

module.exports = ServerUtils;
