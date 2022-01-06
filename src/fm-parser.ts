import matter from "gray-matter";
import fs from "fs";
import { Logger, Level } from "./logger";

export class FmParser {
  logger: Logger;

  constructor(logLevel: Level = Level.INFO) {
    this.logger = new Logger(logLevel);
  }

  parse(file: string): Metadata {
    const content = this.loadFileContents(file);

    if (!content) {
      throw new Error(`File ${file} failed to load!`);
    }
    let parsed = matter(content).data;

    if (!parsed) {
      throw new Error("Frontmatter parsing failed!");
    }
    this.logger.debug(`Frontmatter data: ${JSON.stringify(parsed)}`);

    return {
      title: parsed.title,
      date: parsed.date,
      author: parsed.author,
    };
  }

  private loadFileContents(file: string): string {
    let contents: string = null;

    try {
      this.logger.debug(`Reading file contents of ${file}`);
      contents = fs.readFileSync(file, "utf8").toString();
    } catch (e) {
      this.logger.error(`Error loading ${file}: ${e}`);
    }
    return contents;
  }
}

export interface Metadata {
  title: string;
  date: string;
  author: string;
}
