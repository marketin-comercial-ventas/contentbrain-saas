export interface MigrationFile {
  id: string;
  tag: string;
  sql: string;
  statements: string[];
  hash: string;
}

export interface MigrationResult {
  id: string;
  tag: string;
  status: "applied" | "skipped";
}

/**
 * Interfaz estructural mínima: compatible con el `Sql` real de postgres.js y
 * con los dobles de las pruebas unitarias. Los retornos son `unknown` porque
 * postgres.js devuelve `Helper` (thenable), no `Promise`.
 */
export interface SqlExecutor {
  (strings: TemplateStringsArray, ...values: unknown[]): unknown;
  unsafe(query: string): unknown;
}

export interface SqlTemplate extends SqlExecutor {
  begin<T>(cb: (tx: SqlExecutor) => Promise<T>): Promise<T>;
}

export declare const STATEMENT_BREAKPOINT: string;
export declare function sha256(text: string): string;
export declare function resolveJournalPath(outDir: string): string;
export declare function splitStatements(sql: string): string[];
export declare function readMigrationFiles(outDir: string): MigrationFile[];
export declare function runMigrations(
  sql: SqlTemplate,
  outDir: string,
  log?: (message: string) => void,
): Promise<MigrationResult[]>;
