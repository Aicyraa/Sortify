import * as path from 'node:path';
import { parseArgs } from 'node:util';
import type { FlagsMap } from './types.ts';
import organize from './organizer.ts';
import dryRun from './dryRun.ts';
import undo from './undo.ts';

// Refactor, Move syntax, change code, and make a consistent code style across the project. This is the main entry point of the application, which parses command-line arguments and calls the appropriate functions based on the options provided. It supports organizing files, performing a dry run, and undoing the last organization action.
const flagsMap: FlagsMap = {
   sort: (folder: string) => organize(folder),
   test: (folder: string) => dryRun(folder),
   undo: (folder: string) => undo(folder),
};

(async (args: string[]): Promise<void> => {
   try {
      const { values, positionals } = parseArgs({
         args,
         options: {
            sort: { type: 'boolean' },
            test: { type: 'boolean' },
            undo: { type: 'boolean' },
         },
         allowPositionals: true,
      });

      const flag: string | undefined = Object.entries(values)
         .filter(([key, value]) => value === true)
         .map(([key]) => key)[0];

      if (flag == null) {
         console.error('No flag provided. Use --sort, --test, or --undo.');
         process.exit(1);
      }

      const folder: string = path.resolve(positionals[0] ?? '.');
      const action = flagsMap[flag as keyof FlagsMap];
      action(folder);
   } catch (error) {
      if ( error instanceof TypeError && error.message.includes('Unknown option ')) {
         console.error(`Invalid Flag: ${error.message}`);
         process.exit(1);
      }
    
      throw error;
   }
})(process.argv.slice(2));
