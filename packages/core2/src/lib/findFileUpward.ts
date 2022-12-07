import * as path from "node:path";
import * as fs from "node:fs/promises";

import { castArray } from "./castArray";

type LocateFileUpwardConfig = {
	startDir?: string;
	stopDir?: string;
};

export const locateFileUpward = async (
	filePathOrPaths: string | readonly string[],
	{
		startDir = process.cwd(),
		stopDir = path.resolve("/"),
	}: LocateFileUpwardConfig = {},
): Promise<string> => {
	const filePaths = castArray(filePathOrPaths);

	try {
		for (const filePath of filePaths) {
			const resolvedFilePath = path.resolve(startDir, filePath);

			try {
				await fs.access(resolvedFilePath);

				return resolvedFilePath;
			} catch {
				continue;
			}
		}
	} catch {
		// noop
	}

	if (startDir === stopDir) {
		throw new Error(
			`Could not locate \`${filePathOrPaths}\` between \`${startDir}\` and \`${stopDir}\`.`,
		);
	}

	return locateFileUpward(filePathOrPaths, {
		startDir: path.resolve(startDir, ".."),
		stopDir,
	});
};
