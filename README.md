# Media Sample Server

Sample server for below [WebViewer](https://www.pdftron.com/documentation/web/) add-ons:

- [WebViewer Audio](https://github.com/XodoDocs/WebViewer-audio)
- [WebViewer Video](https://github.com/XodoDocs/WebViewer-video)

The Media Sample Server allows for utilization of [ffmpeg](https://ffmpeg.org/) commands in conjunction with WebViewer to allow for greater functionality. Currently redaction of audio and video frames are supported.

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/), [npm](https://www.npmjs.com/get-npm) and [ffmpeg](https://ffmpeg.org/download.html).

## Commands

- `npm i` - Installs the pre-requisites required to run the server
- `node ./index.js` - Starts the local dev server

## How to use

Below is an example of how to use the server with WebViewer Video. Sample code of how WebViewer-Video could be integrated into your application can be found [here](https://github.com/pdftron/WebViewer-video-sample).

For further information on integrating the server with your application, please check this [link](https://www.pdftron.com/documentation/web/guides/video/video-redaction/) or 
[link](https://www.pdftron.com/documentation/web/guides/audio/audio-redaction/).

```javascript
import WebViewer from '@pdftron/webviewer';
import { initializeVideoViewer } from '@pdftron/webviewer-video';
WebViewer({
    path: '/webviewer/lib',
  },
  viewer.current,
).then(async instance => {
  // Extends WebViewer to allow loading HTML5 videos (.mp4, ogg, webm).
  const {
      UI,
      loadVideo,
  } = await initializeVideoViewer(
      instance,
      {
        license: '---- Insert commercial license key here after purchase ----',
        `---- Other settings ----`,
      }
  );
  // Load a video at a specific url. Can be a local or public link
  // If local it needs to be relative to lib/ui/index.html.
  // Or at the root. (eg '/video.mp4')
  // Dash file url
  const videoUrl = 'https://pdftron.s3.amazonaws.com/downloads/pl/video/video.mp4';
  loadVideo(videoUrl);

  UI.updateElement('redactVideoButton', {
    onClick: async redactAnnotations => {
      console.log(redactAnnotations);

      const response = await fetch('http://localhost:3001/video/redact', {
        method: 'POST',
        body: JSON.stringify({
          intervals: redactAnnotations.map(annotation => ({
            start: annotation.startTime,
            end: annotation.endTime,
            shouldRedactAudio: annotation.shouldRedactAudio || annotation.redactionType === 'audioRedaction',
            shouldRedactVideo: annotation.redactionType !== 'audioRedaction',
          })),
          url: 'https://pdftron.s3.amazonaws.com/downloads/pl/video/video.mp4',
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });

      const videoBuffer = await response.arrayBuffer();

      const newVideoBlob = new Blob([videoBuffer], { type: 'video/mp4' });
      loadVideo(URL.createObjectURL(newVideoBlob));
      return videoBuffer;
    }
  });
});
```