import * as path from 'node:path';
import { parseArgs } from 'node:util';
import type { FlagsMap } from './types.ts';
import { organize, preview } from './organizer.ts';
import undo from './undo.ts';
import { logError, logInfo, logDivider, logHeader } from './logger.ts';

// ─── Help ─────────────────────────────────────────────────────────────────────

function printHelp(): void {
   logHeader('\n  Sortify — File Organizer\n');
   logDivider();
   logInfo('Usage:  sortify [folder] <flag>\n');
   logInfo('Flags:');
   logInfo('  --sort      Move files into categorized subfolders');
   logInfo('  --preview   Preview what would be moved (dry run)');
   logInfo('  --undo      Restore a previously sorted folder');
   logInfo('  --help      Show this help message');
   logDivider();
   logInfo('Examples:');
   logInfo('  sortify ~/Downloads --sort');
   logInfo('  sortify ~/Downloads --preview');
   logInfo('  sortify --undo\n');
}

// ─── Flag Map ─────────────────────────────────────────────────────────────────

const flagsMap: FlagsMap = {
   sort: folder => organize(folder),
   preview: folder => preview(folder),
   undo: folder => undo(folder),
};

// ─── Entry Point ─────────────────────────────────────────────────────────────

(async (args: string[]): Promise<void> => {
   try {
      const { values, positionals } = parseArgs({
         args,
         options: {
            sort: { type: 'boolean' },
            preview: { type: 'boolean' },
            undo: { type: 'boolean' },
            help: { type: 'boolean' },
         },
         allowPositionals: true,
      });

      if (values.help) {
         printHelp();
         process.exit(0);
      }

      const activeFlags = (
         Object.entries(values) as [keyof typeof values, boolean | undefined][]
      )
         .filter(([, value]) => value === true)
         .map(([key]) => key);

      if (activeFlags.length === 0) {
         printHelp();
         process.exit(1);
      }

      if (activeFlags.length > 1) {
         logError(
            `Only one flag can be used at a time. Got: ${activeFlags.map(f => `--${f}`).join(', ')}`,
         );
         process.exit(1);
      }

      const flag = activeFlags[0] as keyof FlagsMap;
      const folder = path.resolve(positionals[0] ?? '.');
      const action = flagsMap[flag];

      await action(folder);
   } catch (error) {
      if (
         error instanceof TypeError &&
         error.message.includes('Unknown option')
      ) {
         logError(`Unknown flag — ${error.message}`);
         logInfo('Run with --help to see available flags.');
         process.exit(1);
      }

      throw error;
   }
})(process.argv.slice(2));
