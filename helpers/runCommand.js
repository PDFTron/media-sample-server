const spawn = require('await-spawn')

module.exports = async({
  cmd,
  args,
  onError,
}) => {
  try {
    let x = await spawn(cmd, args);
  } catch (e) {
    onError(e);
  }
}