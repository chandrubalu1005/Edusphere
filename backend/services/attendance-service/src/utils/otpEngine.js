const crypto = require('crypto');

/**
 * Enterprise 25-second strict boundary OTP engine.
 * No grace periods, no rollover windows.
 */
class OtpEngine {
  constructor(rotationSeconds = 25) {
    this.rotationSeconds = rotationSeconds;
  }

  getCurrentBucket() {
    return Math.floor(Date.now() / 1000 / this.rotationSeconds);
  }

  getTimeRemaining() {
    const currentSeconds = Math.floor(Date.now() / 1000);
    return this.rotationSeconds - (currentSeconds % this.rotationSeconds);
  }

  generateCode(secret, purpose) {
    const bucket = this.getCurrentBucket();
    return this.generateCodeForBucket(secret, purpose, bucket);
  }

  generateCodeForBucket(secret, purpose, bucket) {
    const data = `${secret}:${purpose}:${bucket}`;
    const hash = crypto.createHmac('sha256', secret).update(data).digest('hex');
    // Extract a 6 digit number from the hash deterministically
    const intVal = parseInt(hash.substring(0, 8), 16);
    let code = (intVal % 1000000).toString();
    return code.padStart(6, '0');
  }

  verify(code, secret, purpose) {
    const bucket = this.getCurrentBucket();
    const expected = this.generateCodeForBucket(secret, purpose, bucket);
    return code === expected;
  }
}

module.exports = new OtpEngine(25);
