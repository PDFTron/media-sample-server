const { v4: uuidv4 } = require('uuid');

module.exports = ({
  server, Joi, Boom, helpers, fs, cmd, s3,
}) => {
  const intervalSchema = Joi.object({
    start: Joi.number().min(0).required(),
    end: Joi.number().required(),
  });

  const videoRedactIntervalSchema = Joi.object({
    start: Joi.number().min(0).required(),
    end: Joi.number().required(),
    shouldRedactAudio: Joi.boolean(),
    shouldRedactVideo: Joi.boolean(),
  });

  server.route({
    method: 'POST',
    path: '/audio/redact',
    config: {
      validate: {
        payload: {
          url: Joi.string().required(),
          intervals: Joi.array().items(intervalSchema).required(),
        },
        failAction: (request, h, err) => {
          return Boom.badRequest(err);
        }
      }
    },
    handler: async (request) => {
      const {
        payload: {
          url,
          intervals,
        }
      } = request;
      
      const uuid = uuidv4();
      const redactCommand = helpers.generateAudioRedactCommand(url, intervals, uuid);

      await cmd({
        cmd: 'ffmpeg', 
        args: redactCommand,
        onError: (err) => {
          console.log(err);
        },
      });

      return new Promise((resolve) => {
        fs.readFile(`./tmp/${uuid}.mp3`, (err, data) => {
          resolve(data);
        });
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/video/redact',
    config: {
      validate: {
        payload: {
          url: Joi.string().required(),
          intervals: Joi.array().items(videoRedactIntervalSchema).required(),
        },
        failAction: (request, h, err) => {
          return Boom.badRequest(err);
        }
      }
    },
    handler: async (request) => {
      const {
        payload: {
          url,
          intervals,
        }
      } = request;
      
      const uuid = uuidv4();
      const audioUUID = uuidv4();
      const audioRedactionIntervals = intervals.filter(interval => interval.shouldRedactAudio);

      if (audioRedactionIntervals.length) {
        const audioRedactCommand = helpers.generateAudioRedactCommand(url, audioRedactionIntervals, audioUUID);

        await cmd({
          cmd: 'ffmpeg', 
          args: audioRedactCommand,
          onError: (err) => {
            console.log(err);
          },
        });
      }

      const videoRedactionIntervals = intervals.filter(interval => interval.shouldRedactVideo);

      const redactCommand = videoRedactionIntervals.length ? 
        helpers.generateVideoRedactCommand(
          url,
          videoRedactionIntervals,
          uuid,
          audioRedactionIntervals.length ? audioUUID : null,
        ) : helpers.generateVideoReplaceAudioStreamCommand(url, uuid, audioUUID);

      await cmd({
        cmd: 'ffmpeg', 
        args: redactCommand,
        onError: (err) => {
          console.log(err);
        },
      });

      return new Promise((resolve) => {
        fs.readFile(`./tmp/${uuid}.mp4`, (err, data) => {
          resolve(data);
        });
      });
    }
  });
};