import * as path from "path";
import Mocha from "mocha";
import { Glob } from "glob";

export async function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
  });

  const testsRoot = path.resolve(__dirname, "..");

  try {
    // Glob test files
    const jsFiles = new Glob("**/**.test.js", { cwd: testsRoot });

    for await (const jsFile of jsFiles) {
      mocha.addFile(path.resolve(testsRoot, jsFile));
    }
    mocha.run((failures: number) => {
      if (failures > 0) {
        throw new Error(`${failures} tests failed.`);
      }
      return;
    });
  } catch (err) {
    console.error(err);
  }
}
