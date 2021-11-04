import fs from 'fs';
import os from 'os';
import path from 'path';
import moment from 'moment';
import slugify from 'slugify';
import puppeteer from 'puppeteer';
import { Browser, Page, Viewport } from 'puppeteer';
import { Logger, Level } from './logger';

export class Fig {

    readonly DEFAULT_TEMPLATE_DIR = '.fig/template';
    readonly DEFAULT_HTML_TEMPLATE = 'template.html';
    readonly DEFAULT_CSS_TEMPLATE = 'style.css';
    readonly DEFAULT_AUTHOR_IMAGE = 'author.jpg';
    readonly DEFAULT_OUTPUT_FORMAT = 'jpg';
    readonly TEMP_DIRECTORY: string = 'tmp';
    readonly OUTPUT_DIRECTORY: string = 'out';
    readonly VIEWPORT: Viewport = {
        width: 1200,
        height: 600,
        deviceScaleFactor: 1
    };

    logger: Logger

    constructor(logLevel: Level = Level.INFO) {
        this.logger = new Logger(logLevel);
    }

    async generateImage({ title, date, author, pathToAuthorImage, pathToHtmlTemplate, pathToCss, output }: Options): Promise<string> {
        
        try {
            this.makeDirectory(`${__dirname}/${this.TEMP_DIRECTORY}`);
            const defaultDir = `${this.getHomeDirectory()}/${this.DEFAULT_TEMPLATE_DIR}`;
            const htmlTemplateFile = this.copyResourceToTmp(pathToHtmlTemplate, `${defaultDir}/${this.DEFAULT_HTML_TEMPLATE}`);
            const authorImageFile = this.copyResourceToTmp(pathToAuthorImage, `${defaultDir}/${this.DEFAULT_AUTHOR_IMAGE}`);
            const cssFile = this.copyResourceToTmp(pathToCss, `${defaultDir}/${this.DEFAULT_CSS_TEMPLATE}`);

            const html = this.buildHtml(htmlTemplateFile, authorImageFile, cssFile, title, date, author);
            const titleSlug = `${slugify(title, { replacement: '_', remove: /[*+~.()'"!?:@]/g, lower: true })}`;    
            const htmlFile = this.writeResourceToTmp(titleSlug, html);
            const outputDirectory = this.getOutpuDirectory(output);
            const outputFilename = this.getOutputFilename(titleSlug, output);
            const outputFilepath = `${outputDirectory}/${outputFilename}`;
            await this.generateFeatureImage(htmlFile, outputFilepath);
            return outputFilepath;
        } catch (e) {
            this.logger.error(`Error generating image: ${e}`);
            return null;
        }
    }

    private getOutputFilename(titleSlug: string, outputFile: string): string {
        let outputFilename: string;

        if (outputFile) {
            outputFilename = path.basename(outputFile);
        } else {
            outputFilename = `${titleSlug}.${this.DEFAULT_OUTPUT_FORMAT}`;
        }
        return outputFilename;
    }

    private getOutpuDirectory(outputFile: string): string {
        let output: string;

        if (outputFile) {
            output = path.dirname(outputFile);
        } else {
            output = `${__dirname}/${this.OUTPUT_DIRECTORY}`;
        }
        this.makeDirectory(output);
        return output;
    }

    private async generateFeatureImage(htmlFile: string, outputFilePath: string) {
        let browser: Browser = null;
        
        try {
            browser = await puppeteer.launch({ headless: true });
            const page: Page = await browser.newPage();
            await page.setViewport(this.VIEWPORT)
            await page.goto(`file://${htmlFile}`);
            await page.screenshot({ path: outputFilePath})
        } catch(e) {
            this.logger.error(`Error generating feature image: ${e}`);
        } finally {
            await browser.close();
        }
    }

    private makeDirectory(directory: string) {
        try {
            this.logger.debug(`Making directory: ${directory}`);
            fs.mkdirSync(`${directory}`);
        } catch (e) {
            this.logger.debug(e);
        }
    }

    private getHomeDirectory(): string {
        return os.homedir();
    }

    private copyResourceToTmp(pathToFile: string, defaultPathToFile: string): string {
        const file = pathToFile != null ? pathToFile : defaultPathToFile;
        const pathToTempFile: string = `${__dirname}/${this.TEMP_DIRECTORY}/${path.basename(file)}`;
        this.logger.debug(`Copying ${file} to ${pathToTempFile}`);
        fs.copyFileSync(file, pathToTempFile);
        return pathToTempFile;
    }

    private writeResourceToTmp(filename: string, data: string): string {
        let pathToTempFile = `${__dirname}/${this.TEMP_DIRECTORY}/${filename}.html`;
        fs.writeFileSync(pathToTempFile, data);
        return pathToTempFile;
    }

    private buildHtml(htmlFile: string, authorImageFile: string, cssFile: string, title: string, dateStr: string, 
        author: string): string {
        const date = moment(dateStr);
        const html = fs.readFileSync(`${htmlFile}`).toString()
            .replace('[[TITLE]]', title)
            .replace('[[AUTHOR]]', author)
            .replace('[[DATE]]', date.format('MMM Do'));
        return html;
    }
}

export interface Options {
    title: string;
    date: string;
    author: string;
    pathToAuthorImage: string;
    pathToHtmlTemplate: string;
    pathToCss: string;
    output: string
}