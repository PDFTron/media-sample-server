const config = require('../config.json');
const AWS = require('aws-sdk');
const promisify = require('util').promisify;

const s3 = new AWS.S3({
  endpoint:'https://s3.us-west-2.amazonaws.com',
  accessKeyId: config.aws_key,
  secretAccessKey: config.aws_secret,
});
const listObjectsPromise = promisify(s3.listObjectsV2.bind(s3));

class S3 {
  constructor() {
    this.client = s3;
    this.filesBucket = `${config.env}-video-demo-files`;
  }

  upload(params) {
    return new Promise((resolve, reject) => s3.upload(params, (err, res) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(res);
    }));
  }

  getSignedUrl(options, action = 'getObject') {
    return s3.getSignedUrlPromise(action, {
      Expires: 3600,
      ...options,
    });
  }

  async listObjects(options) {
    try {
      const response = await listObjectsPromise(options);
      const {
        IsTruncated,
        NextContinuationToken,
      } = response;
      if (!IsTruncated || !NextContinuationToken) return response;
      const {
        Contents: nextContents = [],
        KeyCount: nextKeyCount = 0,
      } = await this.listObjects({ ...options, ContinuationToken: NextContinuationToken });
      response.Contents = response.Contents.concat(nextContents);
      response.KeyCount += nextKeyCount;
      return response;
    } catch (err) {
      console.error(err);
      return {};
    }
  }
  
  async getFiles() {
    const { Contents:files = [] } = await this.listObjects({
      Bucket: 'pdftron-media-demo-files',
    });
    return files;
  }
}

const sharedS3 = new S3();
module.exports = sharedS3;