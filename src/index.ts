import * as path from "node:path"
import { parseArgs } from "node:util"
import organize from "./organizer.ts";
import dryRun from "./dryRun.ts"

((args: string[]): void => {

  const options = {
    sort: { type: 'boolean' },
    'dry-run': { type: 'boolean' },
    undo: { type: 'boolean' }
  } as const

  const { values, positionals } = parseArgs({ 
    args,
    options,
    allowPositionals: true
  })
  
  const folder: string = path.resolve(positionals[0] ?? '.')
  
  if (values.sort) organize(folder)
  if (values.undo) undo(folder)
  if (values['dry-run']) dryRun(folder)

})(process.argv.slice(2))

