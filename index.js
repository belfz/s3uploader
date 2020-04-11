const util = require("util");
const AWS = require("aws-sdk");
const { accessKeyId, secretAccessKey } = require("./.awskey");

const createBucket = (s3, bucketName, location) => {
  const params = {
    Bucket: bucketName,
    CreateBucketConfiguration: {
      LocationConstraint: location
    }
  };

  return util.promisify(s3.createBucket.bind(s3))(params).catch(err => {
    const { code = "unknown error code" } = err;
    
    switch (code) {
      case "BucketAlreadyOwnedByYou":
        console.log(`bucket ${bucketName} already exists...`);
        break;
      default:
        return Promise.reject({
          step: "1 - createBucket",
          code,
          params
        });
    }
  });
};

const logic = async (bucketName, region) => {
  const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey
  });

  try {
    console.log("attempting to create a bucket...");
    await createBucket(s3, bucketName, region);
    console.log("got the bucket");
  } catch (err) {
    console.log(`got error: ${JSON.stringify(err)}`)
  }
};

const main = async () => {
  const bucketName = "nd-test-2";
  const region = "eu-central-1"
  await logic(bucketName, region);
};

main();
