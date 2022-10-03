import { config } from "./config.ts";
import { BaseHandler } from "https://deno.land/std@0.158.0/log/handlers.ts";
import * as colors from "https://deno.land/std@0.158.0/fmt/colors.ts";
import {
  getLogger,
  LogLevels,
  LogRecord,
  setup,
} from "https://deno.land/std@0.158.0/log/mod.ts";

class ConsoleHandler extends BaseHandler {
  handle(logRecord: LogRecord): void {
    if (this.level > logRecord.level) return;

    const msg = this.format(logRecord);
    if (logRecord.level >= 40) {
      console.error(msg);
    } else if (logRecord.level >= 30) {
      console.warn(msg);
    } else {
      console.log(msg);
    }
  }
}

const handlers: Record<string, BaseHandler> = {};

if (config.log.console.enabled) {
  handlers.console = new ConsoleHandler(config.log.console.level, {
    formatter(logRecord) {
      let level = logRecord.levelName;
      if (config.log.console.colors) {
        switch (logRecord.level) {
          case LogLevels.DEBUG:
            level = colors.dim(level);
            break;
          case LogLevels.INFO:
            level = colors.blue(level);
            break;
          case LogLevels.WARNING:
            level = colors.yellow(level);
            break;
          case LogLevels.ERROR:
            level = colors.red(level);
            break;
          case LogLevels.CRITICAL:
            level = colors.bold(colors.red(level));
            break;
          default:
            break;
        }
      }

      let msg = `${level}: ${logRecord.msg}`;
      if (config.log.console.timestamps) {
        msg = `[${new Date().toISOString()}] ${msg}`;
      }
      return msg;
    },
  });
}

await setup({
  handlers,
  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console"],
    },
  },
});

export const logger = getLogger();
