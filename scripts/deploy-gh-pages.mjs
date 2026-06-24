import { execSync } from 'child_process';
import { mkdirSync, cpSync, writeFileSync, rmSync } from 'fs';
import { resolve } from 'path';

const TMP = '/tmp/gh-pages-deploy';
const DIST = resolve(import.meta.dirname, '../dist');
const REMOTE = execSync('git remote get-url origin').toString().trim();

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP);
cpSync(DIST, TMP, { recursive: true });
writeFileSync(`${TMP}/.nojekyll`, '');

execSync(`git init && git checkout -b gh-pages`, { cwd: TMP });
execSync(`git config user.email "deploy@rebornmc" && git config user.name "Deploy"`, { cwd: TMP });
execSync(`git add -A && git commit -m "Deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ)"`, { cwd: TMP });
execSync(`git remote add origin ${REMOTE}`, { cwd: TMP });
execSync(`git push -f origin gh-pages`, { cwd: TMP, stdio: 'inherit' });

rmSync(TMP, { recursive: true, force: true });
console.log('\nDéployé sur gh-pages avec succès.');
