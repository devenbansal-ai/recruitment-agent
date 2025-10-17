require("@dotenvx/dotenvx").config();

import path from "path";
import fs from "fs";
import { spawn } from "child_process";

const testDir = path.resolve(__dirname, "tests");
const pattern = /\.smoke\.test\.ts$/;

// Find all smoke test files
const files: string[] = [];
fs.readdirSync(testDir).forEach((file) => {
  if (pattern.test(file)) {
    files.push(path.join(testDir, file));
  }
});

// Run each file using ts-node
files.forEach((file) => {
  console.log(`Running ${file}...`);
  const child = spawn("ts-node", [file], { stdio: "inherit" });

  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`${file} failed with exit code ${code}`);
    }
  });
});
