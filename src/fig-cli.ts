#!/usr/bin/env node

import { Command } from 'commander';
import { Fig } from './fig';
import { Level, Logger } from './logger';
import { version } from '../package.json';
import { FmParser, Metadata } from './fm-parser';

const program = new Command();
program.version(version)
    .description('Fig is a utility that generates feature images for website articles. The images can be used for sharing the article on social media.');

program
    .command('fm <input>')
    .description('Generates an image by parsing metadata from the frontmatter in the input file')
    .option('-o, --output <name and path to output>', 'Name and path of the output file, append with .jpg or .png')
    .option('-v, --verbose', 'Turns on verbose logging')
    .option('-h, --html-template <path to HTML file>', 'Path to HTML template for your feature image')
    .action((input, options) => processFrontmatterInput(input, options));

program
    .command('args')
    .description('Generates an image using the options specified')
    .requiredOption('-t, --title <title>', 'Article\'s title')
    .requiredOption('-d, --date <date>', 'Article\'s published Date')
    .requiredOption('-a, --author <author>', 'Article\'s Author\'s name')
    .option('-h, --html-template <path to HTML file>', 'Path to HTML template for your feature image')
    .option('-o, --output <name and path to output>', 'Name and path of the output file, append with .jpg or .png')
    .option('-v, --verbose', 'Turns on verbose logging')
    .action((options) => processArgumentInput(options));

program.parse(process.argv);

async function processArgumentInput(options: any) {
    const logLevel: Level = options.verbose ? Level.ALL : Level.INFO;
    const fig: Fig = new Fig(logLevel);
    const logger = new Logger(logLevel);
    logger.debug(options);

    const result: string = await fig.generateImage({
        title: options.title,
        date: options.date,
        author: options.author,
        pathToTemplate: options.htmlTemplate,
        output: options.output
    });
    handleResult(logger, result);
}

async function processFrontmatterInput(input: string, options: any) {
    const logLevel: Level = options.verbose ? Level.ALL : Level.INFO;
    const fig: Fig = new Fig(logLevel);
    const logger = new Logger(logLevel);
    const fmParser: FmParser = new FmParser(logLevel);
    const metadata: Metadata = fmParser.parse(input);

    logger.debug(input);
    logger.debug(options);
    logger.debug(JSON.stringify(metadata));

    const result: string = await fig.generateImage({
        title: metadata.title,
        date: metadata.date,
        author: metadata.author,
        pathToTemplate: options.htmlTemplate,
        output: options.output
    });
    handleResult(logger, result);
}

function handleResult(logger: Logger, result: string) {

    if (result) {
        logger.info(`Feature image generated successfully: ${result}`);
    } else {
        logger.info(`Feature image failed to generate, please check errors!`);
    }
}