import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import { globalIgnores } from "eslint/config";

const root = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: root });

const config = [
  globalIgnores([".next/**", "node_modules/**", "next-env.d.ts"]),
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default config;
