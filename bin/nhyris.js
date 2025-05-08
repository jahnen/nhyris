#!/usr/bin/env node

import { Command } from "commander";
import { initCommand } from "../commands/init.js";
import { buildCommand } from "../commands/build.js";
import { runCommand } from "../commands/run.js";

const program = new Command();
program.name("nhyris").description("CLI for Shiny Electron apps");

program.addCommand(initCommand);
program.addCommand(buildCommand);
program.addCommand(runCommand);

program.parse();
