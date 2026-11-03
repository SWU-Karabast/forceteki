import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');

rmSync(join(packageDir, 'dist'), { recursive: true, force: true });

for (const [flavor, type] of [['cjs', 'commonjs'], ['esm', 'module']]) {
    execFileSync(process.execPath, [tsc, '-p', `tsconfig.${flavor}.json`], { cwd: packageDir, stdio: 'inherit' });
    mkdirSync(join(packageDir, 'dist', flavor), { recursive: true });
    writeFileSync(join(packageDir, 'dist', flavor, 'package.json'), JSON.stringify({ type }) + '\n');
}
