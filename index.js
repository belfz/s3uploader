const fs = require("fs");
const util = require("util");
const path = require("path");
const AWS = require("aws-sdk");
const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");
const S3UploaderError = require("./S3UploadError");
const { accessKeyId, secretAccessKey } = require("./.awskey");

const DEFAULT_AWS_REGION = "eu-central-1";

const getBucketName = (bucketName) => {
  if (bucketName) {
    return bucketName;
  }

  throw new S3UploaderError("missing '--bucketName' (or '-b') CLI parameter!");
};

const getListOfFiles = (src) => {
  if (Array.isArray(src) && src.length > 0) {
    return src;
  }

  throw new S3UploaderError("you must specify files you want to upload!");
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

const uploadSimple = (s3, bucketName, filePath) => {
  const fileName = path.basename(filePath);
  const fileStream = fs.createReadStream(filePath);

  return new Promise((resolve, reject) => {
    fileStream.once("error", reject);

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileStream
    };

    util.promisify(s3.upload.bind(s3))(params)
      .then(resolve)
      .catch(err => {
        const { code, message } = err;
  
        switch (code) {
          // TODO handle known errors
          default:
            reject(new S3UploaderError(message));
            break;
        }
      });
  });
};

const logic = async (options) => {
  const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey
  });

  const { bucketName, region, src } = options;

  try {
    const name = getBucketName(bucketName);
    console.log("attempting to create a bucket...");
    await createBucket(s3, name, region);
    const files = getListOfFiles(src);
    console.log("about to upload", files);
    await Promise.all(files.map(filePath => uploadSimple(s3, name, filePath)));
    return 0;
  } catch (err) {
    console.log(`error: ${err.message}`);
    return 1;
  }
};

const main = async () => {
  const options = commandLineArgs([
    { name: "bucketName", alias: "b", type: String },
    { name: "region", alias: "r", type: String, defaultValue: DEFAULT_AWS_REGION },
    { name: "src", type: String, multiple: true, defaultOption: true },
    { name: "help", alias: "h", type: Boolean }
  ]);

  const usage = commandLineUsage([
    {
      header: "s3uploader",
      content: "A script to create an S3 Bucket (of given name) and upload selected files."
    },
    {
      header: "Options",
      optionList: [
        {
          name: "bucketName",
          alias: "b",
          typeLabel: "{underline string}",
          description: "The name of the bucket to create (or to use existing one). Required."
        },
        {
          name: "region",
          alias: "r",
          typeLabel: "{underline string}",
          description: `The name of the AWS region. Not required, default to ${DEFAULT_AWS_REGION}.`,
        }
      ]
    },
    {
      header: "Synopsis",
      content: `$ s3uploader -b my-new-bucket file1 file2 ...
      $ s3uploader -b my-new-bucket -r eu-west-1 file1 ...
      `
    }
  ]);

  if (options.help) {
    console.log(usage);
    process.exit(0);
  }

  const exitCode = await logic(options);
  process.exit(exitCode);
};

main();
