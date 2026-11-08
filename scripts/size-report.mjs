// Reports package sizes in the CI summary (Spec 04). Informational only.
import { appendFileSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const files = {
  'styles.css': ['dist/styles.css'],
  'Box JavaScript': [
    'dist/components/Box/Box.js',
    'dist/components/Box/sprinkles.css.js',
  ],
};

const rows = Object.entries(files).map(([name, paths]) => {
  const source = Buffer.concat(paths.map((path) => readFileSync(path)));
  return `| ${name} | ${(source.length / 1024).toFixed(1)} KB | ${(gzipSync(source).length / 1024).toFixed(1)} KB |`;
});

const report = ['| File | Raw | Gzip |', '|---|---|---|', ...rows, ''].join(
  '\n',
);
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
}
