import { parse } from "https://deno.land/std@0.158.0/encoding/yaml.ts";
import { deepAssign } from "https://deno.land/std@0.158.0/_util/deep_assign.ts";
import { assert } from "https://deno.land/std@0.158.0/_util/assert.ts";
import {
  LevelName,
  LogLevelNames,
} from "https://deno.land/std@0.158.0/log/levels.ts";

interface DNSRecord {
  user?: string;
  pass?: string;
  zone: string;
}

export interface ConfigOptions {
  listen_address: string | boolean;
  apiToken: string;
  records: Record<string, DNSRecord>;
  log: {
    console: {
      enabled: boolean;
      level: LevelName;
      timestamps: boolean;
      colors: boolean;
    };
  };
}

class Config implements ConfigOptions {
  listen_address = ":8080";
  apiToken = '';
  records = {  };
  log = {
    console: {
      enabled: true,
      level: "INFO" as LevelName,
      timestamps: true,
      colors: true,
    },
  };

  constructor() {
    const configArgIndex = Deno.args.findIndex((arg) => arg === "--config");
    if (configArgIndex >= 0) {
      const configFile = Deno.args[configArgIndex + 1];
      try {
        this.parse(configFile);
      } catch (e) {
        console.error(`ERROR parsing ${configFile}:`, e.message);
        Deno.exit(1);
      }
    } else {
      try {
        this.parse("config.yaml");
      } catch (e) {
        // fail silent cause no config-argument was given
      }
    }
    try {
      this.validate();
    } catch (e) {
      console.error(e.message);
      Deno.exit(1);
    }
  }

  protected parse(file: string) {
    const config = parse(Deno.readTextFileSync(file));
    deepAssign(this, config);
  }

  protected validate() {
    // TODO more validation. json schema?
    assert(
      LogLevelNames.includes(this.log.console.level),
      `Unknown loglevel "${this.log.console.level}". Supported values: ${
        LogLevelNames.join(", ")
      }.`,
    );
  }
}

export const config = new Config();
