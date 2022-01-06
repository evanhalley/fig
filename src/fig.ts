import fs from "fs";
import copyDir from "copy-dir";
import os from "os";
import path from "path";
import moment from "moment";
import slugify from "slugify";
import puppeteer from "puppeteer";
import { Browser, Page, Viewport } from "puppeteer";
import { Logger, Level } from "./logger";

export class Fig {
  readonly DEFAULT_TEMPLATE_DIR = ".fig/template";
  readonly DEFAULT_HTML_TEMPLATE = "index.html";
  readonly DEFAULT_OUTPUT_FORMAT = "jpg";
  readonly TEMP_DIRECTORY: string = "tmp";
  readonly VIEWPORT: Viewport = {
    width: 1200,
    height: 600,
    deviceScaleFactor: 1,
  };

  logger: Logger;

  constructor(logLevel: Level = Level.INFO) {
    this.logger = new Logger(logLevel);
  }

  async generateImage({ title, date, author, pathToTemplate, output }: Options): Promise<string> {
    const tempDir = `${__dirname}/${this.TEMP_DIRECTORY}`;

    try {
      this.deleteDirectory(tempDir);
      this.makeDirectory(tempDir);
      const defaultDir = `${this.getHomeDirectory()}/${this.DEFAULT_TEMPLATE_DIR}`;
      const pathToTmpTemplate = this.copyResourceToTmp(pathToTemplate, defaultDir);
      const pathToTmpHtmlTemplate = `${pathToTmpTemplate}/${this.DEFAULT_HTML_TEMPLATE}`;

      const html = this.buildHtml(pathToTmpHtmlTemplate, title, date, author);
      const titleSlug = `${slugify(title, { replacement: "_", remove: /[*+~.()'"!?:@]/g, lower: true })}`;
      const htmlFile = this.writeResourceToTmp(titleSlug, html);
      const outputDirectory = this.getOutpuDirectory(output);
      const outputFilename = this.getOutputFilename(titleSlug, output);
      const outputFilepath = `${outputDirectory}/${outputFilename}`;
      await this.generateFeatureImage(htmlFile, outputFilepath);
      return outputFilepath;
    } catch (e) {
      this.logger.error(`Error generating image: ${e}`);
      return null;
    } finally {
      this.deleteDirectory(tempDir);
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
      this.makeDirectory(output);
    } else {
      output = process.cwd();
    }
    return output;
  }

  private async generateFeatureImage(htmlFile: string, outputFilePath: string) {
    let browser: Browser = null;

    try {
      browser = await puppeteer.launch({ headless: true });
      const page: Page = await browser.newPage();
      await page.setViewport(this.VIEWPORT);
      await page.goto(`file://${htmlFile}`);
      await page.screenshot({ path: outputFilePath });
    } catch (e) {
      this.logger.error(`Error generating feature image: ${e}`);
    } finally {
      await browser.close();
    }
  }

  private makeDirectory(directory: string) {
    try {
      if (!fs.existsSync(directory)) {
        this.logger.debug(`Making directory: ${directory}`);
        fs.mkdirSync(directory);
      }
    } catch (e) {
      this.logger.debug(e);
    }
  }

  private deleteDirectory(directory: string) {
    try {
      if (fs.existsSync(directory)) {
        this.logger.debug(`Deleting directory: ${directory}`);
        fs.rmSync(directory, { recursive: true, force: true });
      }
    } catch (e) {
      this.logger.debug(e);
    }
  }

  private getHomeDirectory(): string {
    return os.homedir();
  }

  private copyResourceToTmp(specifiedPath: string, defaultPath: string): string {
    const path = specifiedPath != null ? specifiedPath + "/" : defaultPath + "/";
    const pathToTempDir: string = `${__dirname}/${this.TEMP_DIRECTORY}/`;
    this.logger.debug(`Copying ${path} to ${pathToTempDir}`);
    copyDir.sync(path, pathToTempDir);
    //fs.copyFileSync(path, pathToTempDir);
    return pathToTempDir;
  }

  private writeResourceToTmp(filename: string, data: string): string {
    let pathToTempFile = `${__dirname}/${this.TEMP_DIRECTORY}/${filename}.html`;
    fs.writeFileSync(pathToTempFile, data);
    return pathToTempFile;
  }

  private buildHtml(htmlFile: string, title: string, dateStr: string, author: string): string {
    const date = moment(dateStr);
    const html = fs
      .readFileSync(htmlFile)
      .toString()
      .replace("[[TITLE]]", title)
      .replace("[[AUTHOR]]", author)
      .replace("[[DATE]]", date.format("MMM Do"));
    return html;
  }
}

export interface Options {
  title: string;
  date: string;
  author: string;
  pathToTemplate: string;
  output: string;
}
