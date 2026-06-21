import chalk from 'chalk';
import ora, { type Ora } from 'ora';
import { SingleBar, Presets } from 'cli-progress';

// ─── Spinner State ────────────────────────────────────────────────────────────

let spinner: Ora | null = null;

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Pause execution for `ms` milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Spinner Controls ─────────────────────────────────────────────────────────

export function startSpinner(text: string): void {
  spinner = ora({ text, color: 'cyan' }).start();
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

// ─── Progress Bar ─────────────────────────────────────────────────────────────

/**
 * Runs `items` through `callback` one-by-one with a progress bar
 * and a per-step sleep so the bar is actually visible.
 */
export async function withProgressBar<T>(
  items:       T[],
  label:       string,
  stepDelayMs: number,
  callback:    (item: T, index: number) => void,
): Promise<void> {
  const bar = new SingleBar(
    {
      format: `  ${chalk.cyan(label)} ${chalk.gray('|')}${chalk.cyan('{bar}')}${chalk.gray('|')} {percentage}%  {value}/{total} files`,
      barCompleteChar:   '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    },
    Presets.shades_classic,
  );

  bar.start(items.length, 0);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item !== undefined) {
      callback(item, i);
    }
    bar.increment();
    await sleep(stepDelayMs);
  }

  bar.stop();
}

// ─── Log Functions ────────────────────────────────────────────────────────────

export function logSuccess(text: string): void {
  console.log(chalk.green(`[+] ${text}`));
}

export function logError(text: string): void {
  console.log(chalk.red(`[x] ${text}`));
}

export function logWarn(text: string): void {
  console.log(chalk.yellow(`[!] ${text}`));
}

export function logInfo(text: string): void {
  console.log(chalk.blue(`[i] ${text}`));
}

export function logDetail(text: string): void {
  console.log(chalk.gray(`    ${text}`));
}

export function logHeader(text: string): void {
  console.log(chalk.bold.cyan(text));
}

export function logSummary(text: string): void {
  console.log(chalk.bold.green(text));
}

export function logDivider(): void {
  console.log(chalk.gray('  ' + '-'.repeat(52)));
}

export function logPrompt(text: string): void {
  process.stdout.write(chalk.cyan(`[?] ${text}`));
}