#!/usr/bin/env node

import { Command, OptionValues } from 'commander';
import { Fig } from './fig';
import { Level, Logger } from './logger';
import { version } from '../package.json';

const program = new Command();

program.name('fig-cli')
    .version(version)
    .description('Fig is a utility that generates feature images for website articles. The images can be used for sharing the article on social media.')
    .requiredOption('-t, --title <title>', 'Article\'s title')
    .requiredOption('-d, --date <date>', 'Article\'s published Date')
    .requiredOption('-a, --author <author>', 'Article\'s Author\'s name')
    .requiredOption('-h, --html-template <path to HTML file>', 'Path to HTML template for your feature image')
    .requiredOption('-i, --author-image <path to image>', 'Path to article\'s author\'s image')
    .requiredOption('-c, --css <path to CSS file>', 'Path to CSS to use for your feature image')
    .option('-o, --output <name and path to output>', 'Name and path of the output file, append with .jpg or .png')
    .option('-v, --verbose', 'Turns on verbose logging')

program.parse(process.argv);

const options: OptionValues = program.opts();
const logLevel: Level = options.verbose ? Level.ALL : Level.INFO;
const fig: Fig = new Fig(logLevel);
const logger = new Logger(logLevel);

logger.debug(JSON.stringify(options));
fig.generateImage({
    title: options.title,
    date: options.date,
    author: options.author,
    pathToAuthorImage: options.authorImage,
    pathToHtmlTemplate: options.htmlTemplate,
    pathToCss: options.css,
    output: options.output});