/**
 * Registers resolve hooks so `import "server-only"` / `require("server-only")`
 * map to the local stub during `tsx --test` (Amadeus adapter modules use it).
 */

import Module from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const stubPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "stubs",
  "server-only.js",
);
const stubUrl = pathToFileURL(stubPath).href;

// CJS path used by tsx when compiling TypeScript that imports server-only.
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveServerOnlyStub(
  request,
  parent,
  isMain,
  options,
) {
  if (request === "server-only") {
    return stubPath;
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

// ESM resolve hook for native ESM imports.
Module.register(
  `data:text/javascript,${encodeURIComponent(`
    export async function resolve(specifier, context, nextResolve) {
      if (specifier === "server-only") {
        return { shortCircuit: true, url: ${JSON.stringify(stubUrl)} };
      }
      return nextResolve(specifier, context);
    }
  `)}`,
  pathToFileURL("./"),
);
