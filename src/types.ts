export interface Flags {
  sort: { 
    type: 'boolean' 
  },
  'dry-run': { 
    type: 'boolean' 
  },
  undo: { 
    type: 'boolean' 
  }
}

export type commands = '--sort' | '--dry-run' | '--undo'