# s3uploader

A simple tool to create an S3 bucket (or use an existing one, resolved by name) and upload files.

## Installation

You will need `yarn`:

```bash
$ yarn install
```

## Runtime requirements

You will need to put a `.awskey.json` file (in the same directory as `cli.js`) with the following content:
```json
{
  "accessKeyId": "<YOUR_AWS_ACCESS_KEY_ID>",
  "secretAccessKey": "<YOUR_AWS_SECRET_ACCESS_KEY>"
}
```

This file is by deafult ignored by git.

## Symlinking the tool

In order to make the tool available as global command, you can symlink it. Use:
```bash
$ yarn link
```

## Usage

To simply upload files `fileA` & `fileB` to a bucket named `my-bucket`:

```bash
$ s3uploader -b my-bucket fileA fileB
```

To specify the region (optional, defaults to `eu-central-1`):

```bash
$ s3uploader -b my-bucket -r eu-west-2 fileA fileB
```

To upload all files in parallel (optional, defaults to sequential upload strategy):

```bash
$ s3uploader -b my-bucket -p fileA fileB
```

Also, check out `s3uploader -h` to read the brief help page with examples.
