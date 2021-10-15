import chalk from "chalk";
import ora from "ora";

export const purple = chalk.hex("8c76fc");
export const error = chalk.hex("FF6868");
export const warning = chalk.hex("F3AD38");
export const underline = chalk.underline;
export const bold = chalk.bold;
export const dim = chalk.dim;
export const cyan = chalk.cyan;

export const spinner = ora;

export const writeError = (msg: string, prefix = "Error!"): void =>
  console.error(`${error(prefix)} ${msg}`);

export const writeWarning = (msg: string, prefix = "Warning!"): void =>
  console.warn(`${warning(prefix)} ${msg}`);

export const writeCheck = (msg: string): void => {
  ora().succeed(msg); // using the same check as Ora for coherence
};
