

// get folder or files
// process it
const path = require("node:path");

((args: string[]): void => {
  // process args, get the folder, 
  // get absolute file path
  const [folder, ...command] = args
  const targetPath: string = path.resolve(folder)
  console.log(targetPath)
  
})(process.argv.slice(2));

function Sort(): void {
  // get folder or files
  // sort it
}

function DryRun(): void {
  //, get folder and file
}

function Undo(): void {
  // check logger.json
  // get folder or files
  // process it
}