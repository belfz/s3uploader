const { DEFAULT_AWS_REGION } =  require("./constants");

module.exports = [
  {
    header: "s3uploader",
    content: "A script to create an S3 Bucket (of given name) and upload selected files."
  },
  {
    header: "Options",
    optionList: [
      {
        name: "bucket",
        alias: "b",
        typeLabel: "{underline string}",
        description: "The name of the bucket to create (or to use existing one). Required."
      },
      {
        name: "parallel",
        alias: "p",
        typeLabel: "{underline (flag - on or off)}",
        description: "Whether to parallelize file upload. Defaults to false (sequential upload)."
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
];
