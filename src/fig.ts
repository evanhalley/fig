import fs from 'fs';
import path from 'path';
import moment from 'moment';
import slugify from 'slugify';
import puppeteer from 'puppeteer';
import { Browser, Page, Viewport } from 'puppeteer';
import { Logger, Level } from './logger';

export class Fig {

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

    async generateImage({ title, date, author, pathToAuthorImage, pathToHtmlTemplate, pathToCss, output }: Options) {
        this.makeDirectory(`${__dirname}/${this.TEMP_DIRECTORY}`);
        const htmlTemplateFile = this.copyResourceToTmp(pathToHtmlTemplate);
        const authorImageFile = this.copyResourceToTmp(pathToAuthorImage);
        const cssFile = this.copyResourceToTmp(pathToCss);
        const html = this.buildHtml(htmlTemplateFile, authorImageFile, cssFile, title, date, author);
        const titleSlug = `${slugify(title, { replacement: '_', remove: /[*+~.()'"!?:@]/g, lower: true })}`;    
        const htmlFile = this.writeResourceToTmp(titleSlug, html);
        const outputDirectory = this.getOutpuDirectory(output);
        const outputFilename = this.getOutputFilename(titleSlug, output);
        await this.generateFeatureImage(htmlFile, outputDirectory, outputFilename);
    }

    private getOutputFilename(titleSlug: string, outputFile: string): string {
        let outputFilename;

        if (outputFile) {
            outputFilename = path.basename(outputFile);
        } else {
            titleSlug;
        }
        return outputFilename;
    }

    private getOutpuDirectory(outputFile: string): string {
        let output;

        if (outputFile) {
            output = path.dirname(outputFile);
        } else {
            output = `${__dirname}/${this.OUTPUT_DIRECTORY}`;
        }
        this.makeDirectory(output);
        return output;
    }

    private async generateFeatureImage(htmlFile: string, outputDirectory: string, outputFile: string) {
        let browser: Browser = null;
        
        try {
            browser = await puppeteer.launch({ headless: true });
            const page: Page = await browser.newPage();
            await page.setViewport(this.VIEWPORT)
            await page.goto(`file://${htmlFile}`);
            await page.screenshot({ path: `${outputDirectory}/${outputFile}`})
        } catch(e) {
            this.logger.error(`Error generating feature image: ${e}`);
        } finally {
            await browser.close();
        }
    }

    private makeDirectory(directory) {
        try {
            this.logger.debug(`Making directory: ${directory}`);
            fs.mkdirSync(`${directory}`);
        } catch (e) {
            this.logger.debug(e);
        }
    }

    private copyResourceToTmp(pathToFile: string): string {
        let filename = path.basename(pathToFile);
        let pathToTempFile = `${__dirname}/${this.TEMP_DIRECTORY}/${filename}`;
        fs.copyFileSync(pathToFile, pathToTempFile);
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