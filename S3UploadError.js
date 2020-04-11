class S3UploaderError extends Error {
  constructor (message) {
    super(message);
    this.name = "S3UploaderError";
  }
}

module.exports = S3UploaderError;
