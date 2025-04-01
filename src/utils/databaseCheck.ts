
// This file is now deprecated, please import from '@/utils/database' instead
import { 
  checkDatabaseTables as checkTables,
  testDatabaseOperations as testOperations,
  DatabaseStructureResults,
  DatabaseOperationsResults
} from './database';

// Re-export for backward compatibility
export const checkDatabaseTables = checkTables;
export const testDatabaseOperations = testOperations;

export type {
  DatabaseStructureResults,
  DatabaseOperationsResults
};
