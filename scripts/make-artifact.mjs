// Версия для публикации как артефакт: dist/artifact.html
// Каркас (<!doctype>, <html>, <head>, <body>) добавляется при публикации, поэтому здесь его нет;
// ссылка «download» в артефакте не работает — заменяем её на обычную ссылку в новой вкладке.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'dist/index.html'), 'utf8');

const title = html.match(/<title>([\s\S]*?)<\/title>/)[1];
const style = html.match(/<style>([\s\S]*?)<\/style>/)[1];
let body = html.match(/<body>([\s\S]*)<\/body>/)[1];

body = body.replace('href="arbor-latina.pdf" download>Скачать PDF для печати (A5)', 'href="arbor-latina.pdf" target="_blank" rel="noopener">Открыть PDF для печати (A5)');

const out = `<title>${title}</title>\n<style>${style}</style>\n${body}`;
fs.writeFileSync(path.join(ROOT, 'dist/artifact.html'), out);
console.log(`dist/artifact.html: ${(Buffer.byteLength(out) / 1024 / 1024).toFixed(2)} МБ`);
