const util = require("util");
const AWS = require("aws-sdk");
const commandLineArgs = require("command-line-args");
const S3UploaderError = require("./S3UploadError");
const { accessKeyId, secretAccessKey } = require("./.awskey");

const getBucketName = (options) => {
  if (options.bucketName) {
    return options.bucketName;
  }
  
  throw new S3UploaderError("missing '--bucketName' (or '-b') CLI parameter!");
};

const createBucket = (s3, bucketName, location) => {
  const params = {
    Bucket: bucketName,
    CreateBucketConfiguration: {
      LocationConstraint: location
    }
  };

  return util.promisify(s3.createBucket.bind(s3))(params).catch(err => {
    const { code, message } = err;
    
    switch (code) {
      case "BucketAlreadyOwnedByYou":
        console.log(`bucket ${bucketName} already exists...`);
        break;
      default:
        return Promise.reject(new S3UploaderError(message));
    }
  });
};

const logic = async (options) => {
  const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey
  });

  try {
    const bucketName = getBucketName(options);
    const region = options.region;
    console.log("attempting to create a bucket...");
    await createBucket(s3, bucketName, region);
    console.log("got the bucket");
    return 0;
  } catch (err) {
    console.log(`error: ${err.message}`);
    return 1;
  }
};

const main = async () => {
  const options = commandLineArgs([
    { name: "bucketName", alias: "b", type: String },
    { name: "region", alias: "r", type: String, defaultValue: "eu-central-1" }
  ]);

  const exitCode = await logic(options);
  process.exit(exitCode);
};

main();
