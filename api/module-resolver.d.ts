/**
 * Resolves a path alias to its actual path
 * @param path The path to resolve
 * @returns The resolved path
 */
export function resolvePathAlias(path: string): string;

/**
 * Imports a module with path alias resolution
 * @param path The path to import
 * @returns A promise that resolves to the imported module
 */
export function importWithAliases(path: string): Promise<any>; 