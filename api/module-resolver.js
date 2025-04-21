import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Map of path aliases to their actual paths
const pathAliases = {
  '@shared': resolve(__dirname, '../shared')
};

// Function to resolve path aliases
export function resolvePathAlias(path) {
  for (const [alias, actualPath] of Object.entries(pathAliases)) {
    if (path.startsWith(alias)) {
      return path.replace(alias, actualPath);
    }
  }
  return path;
}

// Synchronous import function
export function importSync(path) {
  const resolvedPath = resolvePathAlias(path);
  return require(resolvedPath);
} 