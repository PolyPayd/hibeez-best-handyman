import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

function nextIndex() {
  const files = fs.existsSync(outDir) ? fs.readdirSync(outDir) : [];
  const nums = files
    .map((f) => f.match(/^screenshot-(\d+)/))
    .filter(Boolean)
    .map((m) => parseInt(m[1], 10));
  return nums.length ? Math.max(...nums) + 1 : 1;
}

const browser = await puppeteer.launch({
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

// Force scroll-triggered reveal animations to their finished state, and force
// every lazy-loaded image to load eagerly, so the full-page screenshot shows
// the real, completed page rather than mid-animation / unloaded images.
await page.evaluate(async () => {
  document.querySelectorAll('.reveal').forEach((el) => {
    el.classList.add('is-visible');
    el.style.transitionDelay = '0s';
    el.style.opacity = '1';
    el.style.transform = 'none';
  });

  const imgs = Array.from(document.querySelectorAll('img'));
  imgs.forEach((img) => { img.loading = 'eager'; });

  // position:fixed elements (sticky mobile CTA bar, sticky header) can be
  // mis-painted by Chromium's full-page screenshot compositing. The header
  // is sticky (fine to keep), but hide the fixed bottom CTA bar for the
  // full-page shot — verify it separately with a normal viewport screenshot.
  document.querySelectorAll('.mobile-cta-bar').forEach((el) => { el.style.display = 'none'; });

  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    })
  );

  window.scrollTo(0, 0);
});
await new Promise((r) => setTimeout(r, 150));

const idx = nextIndex();
const filename = label ? `screenshot-${idx}-${label}.png` : `screenshot-${idx}.png`;
const outPath = path.join(outDir, filename);

await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Saved: ${outPath}`);
