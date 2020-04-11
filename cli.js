#!/usr/bin/env node

const fs = require("fs");
const util = require("util");
const path = require("path");
const AWS = require("aws-sdk");
const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");
const logUpdate = require("log-update");
const commandLineOptions = require("./src/commandLineOptions");
const commandLineInstructions = require("./src/commandLineInstructions");
const S3UploaderError = require("./src/S3UploadError");
const { accessKeyId, secretAccessKey } = require("./.awskey");

const getBucketName = bucketName => {
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

    const managedUpload = s3.upload(params, err => {
      if (err) {
        const { code, message } = err;
  
        reject(new S3UploaderError(message));
      }

      resolve();
    });

    managedUpload.on("httpUploadProgress", ev => {
      const { loaded, total } = ev;
      logUpdate(`uploading ${filePath}: ${(loaded / total * 100).toFixed(2)}%`);
      if (loaded === total) {
        logUpdate.done();
      }
    });
  });
};

const logic = async (options) => {
  const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey
  });

  const { bucket, parallel, region, src } = options;

  try {
    const name = getBucketName(bucket);
    console.log("attempting to create a bucket...");
    await createBucket(s3, name, region);
    const files = getListOfFiles(src);
    console.log("about to upload", files);
    if (parallel) {
      console.log("WARNING! Parallel upload enabled.")
      await Promise.all(files.map(filePath => uploadSimple(s3, name, filePath)));
    } else {
      for (filePath of files) {
        await uploadSimple(s3, name, filePath);
      }
    }
    console.log("done, all files uploaded!");
    return 0;
  } catch (err) {
    console.log(`error: ${err.message}`);
    return 1;
  }
};

const main = async () => {
  const options = commandLineArgs(commandLineOptions);

  const usage = commandLineUsage(commandLineInstructions);

  if (options.help) {
    console.log(usage);
    process.exit(0);
  }

  const exitCode = await logic(options);
  process.exit(exitCode);
};

main();
