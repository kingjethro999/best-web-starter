#!/usr/bin/env node

import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import os from 'os';

// Version and config constants
const VERSION = '0.1.0';
const CONFIG_FILE = path.join(os.homedir(), '.webrc');

// Detect package manager preference
function detectPackageManager() {
    try {
        execSync('yarn --version', { stdio: 'ignore' });
        return 'yarn';
    } catch (e) {
        try {
            execSync('pnpm --version', { stdio: 'ignore' });
            return 'pnpm';
        } catch (e) {
            return 'npm';
        }
    }
}

// Load user configuration
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        }
    } catch (error) {
        console.warn(chalk.yellow('Warning: Could not load config file. Using defaults.'));
    }
    return {
        packageManager: detectPackageManager(),
        defaultTemplate: 'react',
        gitInit: true,
        plugins: []
    };
}

// Save user configuration
function saveConfig(config) {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        console.log(chalk.green('Configuration saved successfully.'));
    } catch (error) {
        console.error(chalk.red('Error saving configuration:'), error.message);
    }
}

// Logger class
class Logger {
    constructor(level = 'info') {
        this.level = level;
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
    }

    error(message) {
        if (this.levels[this.level] >= this.levels.error) {
            console.error(chalk.red(`ERROR: ${message}`));
        }
    }

    warn(message) {
        if (this.levels[this.level] >= this.levels.warn) {
            console.warn(chalk.yellow(`WARNING: ${message}`));
        }
    }

    info(message) {
        if (this.levels[this.level] >= this.levels.info) {
            console.log(chalk.blue(`INFO: ${message}`));
        }
    }

    debug(message) {
        if (this.levels[this.level] >= this.levels.debug) {
            console.log(chalk.gray(`DEBUG: ${message}`));
        }
    }

    success(message) {
        console.log(chalk.green(`SUCCESS: ${message}`));
    }
}

// Initialize logger
const logger = new Logger();

// Plugin system
class PluginManager {
    constructor() {
        this.plugins = {};
    }

    register(name, plugin) {
        this.plugins[name] = plugin;
        logger.debug(`Plugin "${name}" registered`);
    }

    getPlugin(name) {
        return this.plugins[name];
    }

    getAllPlugins() {
        return Object.keys(this.plugins);
    }

    applyPlugin(name, context) {
        const plugin = this.getPlugin(name);
        if (plugin && typeof plugin.apply === 'function') {
            logger.info(`Applying plugin: ${name}`);
            return plugin.apply(context);
        } else {
            logger.warn(`Plugin "${name}" not found or not properly formatted`);
            return Promise.resolve();
        }
    }
}

const pluginManager = new PluginManager();

// Register built-in plugins
pluginManager.register('styling', {
    name: 'Styling Libraries',
    description: 'Add popular styling libraries to your project',
    apply: async (context) => {
        let inquirer;
        try {
            inquirer = await import('inquirer');
        } catch (err) {
            inquirer = require('inquirer');
        }

        const promptMethod = inquirer.prompt || inquirer.default.prompt;

        const answers = await promptMethod([
            {
                type: 'checkbox',
                name: 'libraries',
                message: 'Select styling libraries to install:',
                choices: [
                    { name: 'Tailwind CSS', value: 'tailwindcss' },
                    { name: 'styled-components', value: 'styled-components' },
                    { name: 'Sass', value: 'sass' },
                    { name: 'Material-UI', value: '@mui/material @emotion/react @emotion/styled' },
                    { name: 'Chakra UI', value: '@chakra-ui/react @emotion/react @emotion/styled framer-motion' }
                ]
            }
        ]);

        if (answers.libraries.length > 0) {
            const spinner = ora('Installing styling libraries...').start();

            try {
                for (const lib of answers.libraries) {
                    const installCmd = `${context.packageManager} ${context.packageManager === 'yarn' ? 'add' : 'install'} ${lib}`;
                    execSync(installCmd, { cwd: context.appDir, stdio: 'ignore' });

                    if (lib === 'tailwindcss') {
                        execSync('npx tailwindcss init -p', { cwd: context.appDir, stdio: 'ignore' });
                    }
                }
                spinner.succeed('Styling libraries installed successfully');
            } catch (error) {
                spinner.fail('Failed to install styling libraries');
                logger.error(error.message);
            }
        }
    }
});

pluginManager.register('stateManagement', {
    name: 'State Management',
    description: 'Add state management libraries to your project',
    apply: async (context) => {
        let inquirer;
        try {
            inquirer = await import('inquirer');
        } catch (err) {
            inquirer = require('inquirer');
        }

        const promptMethod = inquirer.prompt || inquirer.default.prompt;

        const answers = await promptMethod([
            {
                type: 'checkbox',
                name: 'libraries',
                message: 'Select state management libraries:',
                choices: [
                    { name: 'Redux Toolkit', value: '@reduxjs/toolkit react-redux' },
                    { name: 'MobX', value: 'mobx mobx-react-lite' },
                    { name: 'Zustand', value: 'zustand' },
                    { name: 'Recoil', value: 'recoil' },
                    { name: 'Context API (no installation needed)', value: 'context-api' }
                ]
            }
        ]);

        if (answers.libraries.length > 0) {
            const spinner = ora('Installing state management libraries...').start();

            try {
                for (const lib of answers.libraries) {
                    if (lib !== 'context-api') {
                        const installCmd = `${context.packageManager} ${context.packageManager === 'yarn' ? 'add' : 'install'} ${lib}`;
                        execSync(installCmd, { cwd: context.appDir, stdio: 'ignore' });
                    }
                }
                spinner.succeed('State management libraries installed successfully');
            } catch (error) {
                spinner.fail('Failed to install state management libraries');
                logger.error(error.message);
            }
        }
    }
});

// Enhanced guided setup with improved wizard
async function runEnhancedGuidedSetup(appName, options) {
    const spinner = ora('Preparing setup wizard...').start();

    try {
        let inquirer;
        try {
            inquirer = await import('inquirer');
        } catch (err) {
            inquirer = require('inquirer');
        }

        spinner.succeed('Setup wizard ready');

        const userConfig = loadConfig();
        const promptMethod = inquirer.prompt || inquirer.default.prompt;

        console.log(boxen(
            chalk.bold.blue('Web App Project Creator') + '\n\n' +
            chalk.white('Create web applications with best practices baked in') + '\n' +
            chalk.gray(`v${VERSION}`),
            { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'blue' }
        ));

        const context = {
            appName,
            appDir: path.join(process.cwd(), appName),
            packageManager: options.packageManager || userConfig.packageManager
        };

        const setupAnswers = await promptMethod([
            {
                type: 'list',
                name: 'framework',
                message: '🎯 Select your framework:',
                choices: [
                    { name: 'React.js (with Vite)', value: 'react-vite' },
                    { name: 'Next.js', value: 'next' },
                    { name: 'Angular', value: 'angular' },
                    { name: 'Vue.js (with Vite)', value: 'vue-vite' }
                ],
                default: 'react-vite'
            },
            {
                type: 'list',
                name: 'template',
                message: '📝 Select a template:',
                choices: (answers) => {
                    if (answers.framework === 'react-vite') {
                        return [
                            { name: 'JavaScript', value: 'javascript' },
                            { name: 'TypeScript', value: 'typescript' },
                            { name: 'JavaScript + SWC', value: 'swc' },
                            { name: 'TypeScript + SWC', value: 'typescript-swc' }
                        ];
                    } else if (answers.framework === 'next') {
                        return [
                            { name: 'Default Starter', value: 'default' },
                            { name: 'TypeScript', value: 'typescript' },
                            { name: 'App Router', value: 'app' },
                            { name: 'Pages Router', value: 'pages' }
                        ];
                    } else if (answers.framework === 'angular') {
                        return [
                            { name: 'Default', value: 'default' },
                            { name: 'Strict Mode', value: 'strict' },
                            { name: 'SSR (Server-Side Rendering)', value: 'ssr' }
                        ];
                    } else {
                        return [
                            { name: 'JavaScript', value: 'javascript' },
                            { name: 'TypeScript', value: 'typescript' },
                            { name: 'PWA', value: 'pwa' }
                        ];
                    }
                }
            },
            {
                type: 'list',
                name: 'packageManager',
                message: '📦 Select package manager:',
                choices: [
                    { name: 'npm', value: 'npm' },
                    { name: 'yarn', value: 'yarn' },
                    { name: 'pnpm', value: 'pnpm' }
                ],
                default: context.packageManager
            },
            {
                type: 'checkbox',
                name: 'features',
                message: '🛠️ Select additional features:',
                choices: [
                    { name: 'Styling Libraries - Add UI styling options', value: 'styling' },
                    { name: 'State Management - Add state management options', value: 'stateManagement' },
                    { name: 'Testing Setup - Configure testing framework', value: 'testing' },
                    { name: 'Git Integration - Initialize Git repo', value: 'git', checked: userConfig.gitInit },
                    { name: 'ESLint & Prettier - Code quality tools', value: 'linting' }
                ]
            }
        ]);

        Object.assign(context, setupAnswers);

        const savePreference = await promptMethod([
            {
                type: 'confirm',
                name: 'save',
                message: '💾 Save these preferences for future projects?',
                default: false
            }
        ]);

        if (savePreference.save) {
            const newConfig = {
                ...userConfig,
                packageManager: setupAnswers.packageManager,
                defaultFramework: setupAnswers.framework,
                gitInit: setupAnswers.features.includes('git')
            };
            saveConfig(newConfig);
        }

        spinner.text = `Creating ${context.framework} app: ${appName}`;
        spinner.start();

        try {
            let createCommand = '';

            switch (context.framework) {
                case 'react-vite':
                    createCommand = `npm create vite@latest ${appName} -- --template ${context.template === 'typescript' ? 'react-ts' : 'react'}`;
                    break;
                case 'next':
                    createCommand = `npx create-next-app@latest ${appName} ${context.template === 'typescript' ? '--typescript' : ''}`;
                    break;
                case 'angular':
                    createCommand = `npx -p @angular/cli ng new ${appName} --strict ${context.template === 'ssr' ? '--ssr' : ''}`;
                    break;
                case 'vue-vite':
                    createCommand = `npm create vite@latest ${appName} -- --template ${context.template === 'typescript' ? 'vue-ts' : 'vue'}`;
                    break;
            }

            execSync(createCommand, {
                stdio: 'ignore',
                cwd: process.cwd()
            });

            spinner.succeed(`${context.framework} app created successfully!`);

            // Install dependencies
            spinner.text = 'Installing dependencies...';
            spinner.start();
            try {
                execSync(`${context.packageManager} install`, {
                    stdio: 'ignore',
                    cwd: context.appDir
                });
                spinner.succeed('Dependencies installed successfully');
            } catch (error) {
                spinner.fail('Failed to install dependencies');
                logger.error(error.message);
                process.exit(1);
            }

            // Apply selected plugins
            for (const feature of context.features) {
                if (feature !== 'git' && pluginManager.getPlugin(feature)) {
                    await pluginManager.applyPlugin(feature, context);
                }
            }

            // Handle Git integration
            if (context.features.includes('git')) {
                spinner.text = 'Initializing Git repository...';
                spinner.start();
                try {
                    execSync('git init', { cwd: context.appDir, stdio: 'ignore' });
                    execSync('git add .', { cwd: context.appDir, stdio: 'ignore' });
                    execSync('git commit -m "Initial commit"', { cwd: context.appDir, stdio: 'ignore' });
                    spinner.succeed('Git repository initialized successfully');
                } catch (error) {
                    spinner.fail('Failed to initialize Git repository');
                    logger.error(error.message);
                }
            }

            // Start development server
            spinner.text = 'Starting development server...';
            spinner.start();
            const startCommand = `${context.packageManager} ${context.packageManager === 'yarn' ? 'dev' : 'run dev'}`;
            const child = spawn(context.packageManager, [context.packageManager === 'yarn' ? 'dev' : 'run', 'dev'], {
                cwd: context.appDir,
                stdio: 'pipe',
                shell: true
            });

            child.stdout.on('data', (data) => {
                const output = data.toString();
                if (output.includes('Local:') || output.includes('localhost:')) {
                    spinner.succeed('Development server started successfully');
                    // Extract the local URL from the output
                    const localUrl = output.match(/Local:\s+(http:\/\/[^\s]+)/)?.[1] || 'http://localhost:5173';
                    const networkUrl = output.match(/Network:\s+(http:\/\/[^\s]+)/)?.[1];

                    console.log(boxen(
                        chalk.green.bold('🎉 Project is ready!') + '\n\n' +
                        chalk.white('Your project has been created and started successfully.') + '\n' +
                        chalk.white('The development server is running at:') + '\n\n' +
                        chalk.cyan('   Local:   ') + chalk.green(localUrl) +
                        (networkUrl ? '\n' + chalk.cyan('   Network: ') + chalk.green(networkUrl) : ''),
                        { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'green' }
                    ));
                }
            });

            child.stderr.on('data', (data) => {
                logger.debug(data.toString());
            });

            child.on('error', (error) => {
                spinner.fail('Failed to start development server');
                logger.error(error.message);
                process.exit(1);
            });
        } catch (error) {
            spinner.fail('Failed to create project');
            logger.error(error.message);
            process.exit(1);
        }
    } catch (error) {
        spinner.fail('Setup wizard failed');
        logger.error(error.message);
        process.exit(1);
    }
}

// Initialize CLI
program
    .name('web')
    .description('Create web applications with best practices')
    .version(VERSION);

program
    .command('create <app-name>')
    .description('Create a new web application')
    .option('-p, --package-manager <manager>', 'Package manager to use (npm, yarn, pnpm)')
    .option('-t, --template <template>', 'Template to use (javascript, typescript)')
    .option('--skip-git', 'Skip Git initialization')
    .option('-v, --verbose', 'Enable verbose logging')
    .action((appName, options) => {
        if (options.verbose) {
            logger.level = 'debug';
        }
        runEnhancedGuidedSetup(appName, options);
    });

program.parse(process.argv);