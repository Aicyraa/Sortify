import * as path from "node:path"
import { parseArgs } from "node:util"
import organize from "./organizer.ts";

((args: string[]): void => {
console.log(args)
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
  
  if (values.sort) {
    
    organize(folder)
  }
  if (values.undo) Undo(folder)
  if (values['dry-run']) DryRun(folder)

})(process.argv.slice(2))

function DryRun(folder: string): void {
  console.log('2')
}

function Undo(folder: string): void {
  console.log('3')
}