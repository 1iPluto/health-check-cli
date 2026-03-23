import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

/**
 * Recursively calculates the total size (in bytes) of a directory.
 * Returns 0 gracefully if a file/dir cannot be accessed.
 */
function getDirSize(dirPath) {
  let totalBytes = 0;

  let entries;
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return 0;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    try {
      if (entry.isDirectory()) {
        totalBytes += getDirSize(fullPath);
      } else if (entry.isFile() || entry.isSymbolicLink()) {
        const stats = fs.statSync(fullPath);
        totalBytes += stats.size;
      }
    } catch {
      // Skip files we can't access (e.g., permission errors)
    }
  }

  return totalBytes;
}

/**
 * Converts bytes to a human-readable string with appropriate unit.
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

/**
 * Returns a color-coded chalk function based on size in MB.
 */
function getSizeColor(mb) {
  if (mb < 100) return chalk.green;
  if (mb < 500) return chalk.yellow;
  return chalk.red;
}

/**
 * Returns a short contextual message based on the size.
 */
function getSizeComment(mb) {
  if (mb < 50) return chalk.dim('Tiny — nothing to worry about.');
  if (mb < 100) return chalk.dim('Lean and clean.');
  if (mb < 250) return chalk.dim('Average size. Consider auditing with `npm ls`.');
  if (mb < 500) return chalk.yellow('Getting heavy. Run `npm dedupe` to clean up.');
  if (mb < 1000) return chalk.red('Large. Consider removing unused dependencies.');
  return chalk.red('Very large! Time for a serious audit.');
}

/**
 * Main size check runner. Calculates and displays node_modules size.
 */
export async function checkNodeModulesSize(dirPath) {
  const resolved = path.resolve(process.cwd(), dirPath);

  const spinner = ora(`Scanning ${chalk.bold(dirPath)}...`).start();

  if (!fs.existsSync(resolved)) {
    spinner.fail(chalk.red(`Directory not found: ${chalk.bold(dirPath)}`));
    console.log(chalk.dim('  Tip: Run `npm install` first to generate the node_modules folder.'));
    return;
  }

  const stats = fs.statSync(resolved);
  if (!stats.isDirectory()) {
    spinner.fail(chalk.red(`${chalk.bold(dirPath)} is not a directory.`));
    return;
  }

  const startTime = Date.now();
  const totalBytes = getDirSize(resolved);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  const mb = totalBytes / 1024 ** 2;
  const colorFn = getSizeColor(mb);
  const formattedSize = formatSize(totalBytes);

  spinner.succeed(`Scan complete in ${chalk.bold(elapsed + 's')}\n`);

  console.log(chalk.bold.underline('  node_modules Size Report:'));
  console.log();
  console.log(`  ${chalk.bold('Path:')}   ${chalk.dim(resolved)}`);
  console.log(`  ${chalk.bold('Size:')}   ${colorFn.bold(formattedSize)}`);
  console.log(`  ${chalk.bold('Status:')} ${getSizeComment(mb)}`);
  console.log();

  // ── Visual size bar ───────────────────────────────────────────────────────
  const maxBar = 30;
  const cappedMb = Math.min(mb, 1000);
  const filled = Math.round((cappedMb / 1000) * maxBar);
  const empty = maxBar - filled;
  const bar = colorFn('█'.repeat(filled)) + chalk.dim('░'.repeat(empty));

  console.log(`  [${bar}] ${colorFn.bold(formattedSize)} ${chalk.dim('/ ~1 GB scale')}`);
  console.log();
}
