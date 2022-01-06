export class Logger {
  level: Level;

  constructor(level: Level) {
    this.level = level;
  }

  public debug(message: string) {
    if (this.level == Level.ALL) {
      console.debug(message);
    }
  }

  public info(message: string) {
    console.log(message);
  }

  public log(message: string) {
    this.info(message);
  }

  public error(message: string) {
    console.error(message);
  }
}

export enum Level {
  ALL,
  INFO,
}
