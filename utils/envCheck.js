import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

/**
 * Parses a .env-style file and returns a Set of defined, non-empty keys.
 * Skips blank lines and comments (#).
 */
function parseEnvFile(filePath) {
  const keys = new Set();
  const content = fs.readFileSync(filePath, 'utf-8');

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();

    if (key) keys.add({ key, value });
  }

  return keys;
}

/**
 * Reads a .env file and returns a Map of key → value for non-empty values.
 */
function parseLocalEnv(filePath) {
  const entries = new Map();
  const content = fs.readFileSync(filePath, 'utf-8');

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();

    if (key) entries.set(key, value);
  }

  return entries;
}

/**
 * Main env check runner. Compares .env.example keys against .env.
 */
export async function checkEnv(examplePath, localPath) {
  const resolvedExample = path.resolve(process.cwd(), examplePath);
  const resolvedLocal = path.resolve(process.cwd(), localPath);

  const spinner = ora(`Checking environment variables...`).start();

  // ── Validate file existence ──────────────────────────────────────────────
  if (!fs.existsSync(resolvedExample)) {
    spinner.fail(chalk.red(`Could not find ${chalk.bold(examplePath)} in the current directory.`));
    console.log(chalk.dim('  Tip: Create a .env.example file with the required keys for your project.'));
    return;
  }

  if (!fs.existsSync(resolvedLocal)) {
    spinner.fail(chalk.red(`Could not find ${chalk.bold(localPath)} in the current directory.`));
    console.log(chalk.dim(`  Tip: Create a ${localPath} file by copying ${examplePath} and filling in the values.`));
    return;
  }

  spinner.text = 'Parsing environment files...';

  let exampleKeys;
  let localEntries;

  try {
    exampleKeys = parseEnvFile(resolvedExample);
    localEntries = parseLocalEnv(resolvedLocal);
  } catch (err) {
    spinner.fail(chalk.red(`Failed to parse env files: ${err.message}`));
    return;
  }

  spinner.succeed(chalk.green(`Parsed ${chalk.bold(examplePath)} — found ${chalk.bold(exampleKeys.size)} key(s) to validate.\n`));

  // ── Compare keys ─────────────────────────────────────────────────────────
  const missing = [];
  const empty = [];
  const valid = [];

  for (const { key } of exampleKeys) {
    if (!localEntries.has(key)) {
      missing.push(key);
    } else if (!localEntries.get(key)) {
      empty.push(key);
    } else {
      valid.push(key);
    }
  }

  // ── Print results ─────────────────────────────────────────────────────────
  console.log(chalk.bold.underline('  Environment Variable Report:'));
  console.log();

  if (valid.length > 0) {
    for (const key of valid) {
      console.log(`  ${chalk.green('✔')}  ${chalk.green(key)}`);
    }
  }

  if (empty.length > 0) {
    for (const key of empty) {
      console.log(`  ${chalk.yellow('⚠')}  ${chalk.yellow(key)} ${chalk.dim('(defined but empty)')}`);
    }
  }

  if (missing.length > 0) {
    for (const key of missing) {
      console.log(`  ${chalk.red('✖')}  ${chalk.red(key)} ${chalk.dim('(missing from .env)')}`);
    }
  }

  console.log();

  // ── Summary ───────────────────────────────────────────────────────────────
  const total = exampleKeys.size;
  const passCount = valid.length;

  if (missing.length === 0 && empty.length === 0) {
    console.log(chalk.bgGreen.black.bold(` ✔ All ${total} variable(s) are present and set. `));
  } else {
    const issues = missing.length + empty.length;
    console.log(
      chalk.bgRed.white.bold(` ✖ ${issues} issue(s) found `) +
        chalk.dim(` (${passCount}/${total} variables OK)`)
    );
    if (missing.length > 0) {
      console.log(chalk.red(`\n  ${missing.length} key(s) are missing from ${localPath}.`));
    }
    if (empty.length > 0) {
      console.log(chalk.yellow(`  ${empty.length} key(s) are defined but have no value.`));
    }
  }
}
