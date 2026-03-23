#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { createRequire } from 'module';
import { checkEnv } from './utils/envCheck.js';
import { checkNodeModulesSize } from './utils/sizeCheck.js';

const require = createRequire(import.meta.url);
const { version, description } = require('./package.json');

program
  .name('health-check')
  .description(chalk.cyan(description))
  .version(version, '-v, --version', 'Display the current version');

// ─── Command: env ────────────────────────────────────────────────────────────
program
  .command('env')
  .description('Validate .env file against .env.example keys')
  .option('-e, --example <path>', 'Path to the example env file', '.env.example')
  .option('-l, --local <path>', 'Path to the local env file', '.env')
  .action(async (options) => {
    await checkEnv(options.example, options.local);
  });

// ─── Command: size ───────────────────────────────────────────────────────────
program
  .command('size')
  .description('Calculate the total size of the node_modules folder')
  .option('-d, --dir <path>', 'Path to the node_modules directory', './node_modules')
  .action(async (options) => {
    await checkNodeModulesSize(options.dir);
  });

// ─── Command: all ────────────────────────────────────────────────────────────
program
  .command('all')
  .description('Run all health checks (env + size)')
  .action(async () => {
    console.log(chalk.bold.cyan('\n╔══════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║      Project Health Report       ║'));
    console.log(chalk.bold.cyan('╚══════════════════════════════════╝\n'));
    await checkEnv('.env.example', '.env');
    console.log();
    await checkNodeModulesSize('./node_modules');
    console.log();
  });

// Show help if no command is provided
program.addHelpText('afterAll', `
${chalk.bold('Examples:')}
  $ health-check env
  $ health-check env --example .env.staging
  $ health-check size
  $ health-check all
`);

program.parse(process.argv);

// If no arguments, print help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
