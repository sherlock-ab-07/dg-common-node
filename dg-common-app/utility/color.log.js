const chalk = require('chalk');

const _blackText = msg => chalk.blackBright(msg);
const _whiteText = msg => chalk.whiteBright(msg);
const _boldText = msg => chalk.bold(msg);

const success = msg => console.log(_boldText(chalk.greenBright(msg)));
const error = msg =>
  console.log(chalk.bgMagentaBright(_boldText(_whiteText(msg))));
const warn = msg => console.log(chalk.bgRedBright(_boldText(_whiteText(msg))));
const progress = msg =>
  console.log(chalk.cyanBright(_boldText(_whiteText(msg))));

const initlog = msg =>
  console.log(chalk.bgWhiteBright(_boldText(_blackText(msg))));
const config = msg =>
  console.log(chalk.bgYellowBright(_boldText(_blackText(msg))));
const device_data = msg => console.log(_boldText(msg));

module.exports = {
  success,
  device_data,
  initlog,
  config,
  warn,
  progress,
  error,
};
