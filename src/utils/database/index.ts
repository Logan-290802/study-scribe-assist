
import { checkDatabaseTables } from './structureCheck';
import { testDatabaseOperations } from './operationsTest';
import type { 
  DatabaseStructureResults, 
  DatabaseOperationsResults, 
  TableInfo, 
  ColumnInfo 
} from './types';

export {
  checkDatabaseTables,
  testDatabaseOperations
};

export type {
  DatabaseStructureResults,
  DatabaseOperationsResults,
  TableInfo,
  ColumnInfo
};
