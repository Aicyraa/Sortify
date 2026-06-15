import chalk from "chalk";
import ora, { type Ora } from "ora";

let spinner: Ora | null = null;

export function startSpinner(text: string): void {
  spinner = ora(text).start();
}


export function updateSpinner(text: string): void {
  if (spinner) spinner.text = text;
}

export function succeedSpinner(text: string): void {
  if (spinner) {
    spinner.succeed(chalk.green(text));
    spinner = null;
  } else {
    logSuccess(text);
  }
}

export function failSpinner(text: string): void {
  if (spinner) {
    spinner.fail(chalk.red(text));
    spinner = null;
  } else {
    logError(text);
  }
}

export function warnSpinner(text: string): void {
  if (spinner) {
    spinner.warn(chalk.yellow(text));
    spinner = null;
  } else {
    logWarn(text);
  }
}

export function infoSpinner(text: string): void {
  if (spinner) {
    spinner.info(chalk.blue(text));
    spinner = null;
  } else {
    logInfo(text);
  }
}

export function stopSpinner(): void {
  if (spinner) {
    spinner.stop();
    spinner = null;
  }
}

export function logSuccess(text: string): void {
  console.log(chalk.green(`✔ ${text}`));
}

export function logError(text: string): void {
  console.log(chalk.red(`✖ ${text}`));
}

export function logWarn(text: string): void {
  console.log(chalk.yellow(`⚠ ${text}`));
}

export function logInfo(text: string): void {
  console.log(chalk.blue(`ℹ ${text}`));
}

export function logDetail(text: string): void {
  console.log(chalk.gray(`  ${text}`));
}

export function logHeader(text: string): void {
  console.log(chalk.bold.cyan(text));
}


export function logSummary(text: string): void {
  console.log(chalk.bold.green(text));
}