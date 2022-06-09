const generateAudioRedactCommand = (url, intervals, uuid) => {
  let redactCommand = '';
    
  intervals.forEach(interval => {
     const { start, end } = interval;
     redactCommand += `afade=t=out:st=${start}:d=0.1:enable='between(t,${start},${end})', afade=t=in:st=${end}:d=0.1:enable='between(t,${end},${end + 0.1})', `;
  });
  
  redactCommand = redactCommand.slice(0, -2);

  return [
    '-i',
    url,
    '-af',
    redactCommand,
    '-c:v',
    'copy',
    `./tmp/${uuid}.mp3`,
  ];
};

const generateVideoRedactCommand = (url, intervals, uuid) => {
  let args = [];
  let canvasArgs = '';
  
  intervals.forEach((interval, index) => {
    args.push('-i', 'black.png');
  });

  args.push('-filter_complex');

  intervals.forEach((interval, index) => {
      canvasArgs += `[${index + 2}:v][${!index ? '0:v' : 'tmp'}]scale2ref[scaled][ref]; [ref][scaled] overlay=enable=\'between(t,${interval.start},${interval.end})\' [tmp]`;

      if (index !== intervals.length - 1) {
          canvasArgs += ';';
      }
  });
  
  args.push(canvasArgs, '-preset', 'fast', '-map', '[tmp]', '-map', '1:a:0');
  return [
    '-i',
    url,
    '-i',
    url,
    ...args,
    `./tmp/${uuid}.mp4`,
  ];
};

module.exports = {
  generateAudioRedactCommand,
  generateVideoRedactCommand,
}