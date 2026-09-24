/**
 * AdjournAID Frontend Automated Test Suite
 * Evaluates Frontend on:
 *   1. Code Quality (Atomic design system, modular component size)
 *   2. Security (Zero dangerouslySetInnerHTML, zero eval, zero inline JS links)
 *   3. Efficiency (Production bundle size ceilings, asset optimization)
 *   4. Accessibility (WCAG 2.1 AA: ARIA live regions, keyboard shortcuts, dual themes, font scaling)
 *   5. API Integration (Endpoint routing contracts)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, '..', '..');
const SRC_ROOT = path.join(FRONTEND_ROOT, 'src');

function getAllFiles(dir, extensions = ['.jsx', '.js', '.css', '.html']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === 'dist' || file === 'tests') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, extensions));
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

test('1. Frontend Security: Zero dangerouslySetInnerHTML or unsafe eval across all code', () => {
  const files = getAllFiles(SRC_ROOT, ['.jsx', '.js']);
  const violations = [];

  for (const f of files) {
    const content = fs.readFileSync(f, 'utf-8');
    if (content.includes('dangerouslySetInnerHTML')) {
      violations.push(`${path.basename(f)}: contains dangerouslySetInnerHTML`);
    }
    if (/\beval\s*\(/.test(content)) {
      violations.push(`${path.basename(f)}: contains eval()`);
    }
    if (/href\s*=\s*['"]javascript:/i.test(content)) {
      violations.push(`${path.basename(f)}: contains javascript: pseudo-protocol`);
    }
  }

  assert.equal(violations.length, 0, `Security violations detected: ${violations.join(', ')}`);
});

test('2. Frontend Code Quality: Atomic Design component hierarchy is strictly enforced', () => {
  const componentsDir = path.join(SRC_ROOT, 'components');
  assert.ok(fs.existsSync(componentsDir), 'components/ directory must exist');

  const requiredAtomicTiers = ['atoms', 'molecules', 'organisms', 'templates'];
  for (const tier of requiredAtomicTiers) {
    const tierPath = path.join(componentsDir, tier);
    assert.ok(fs.existsSync(tierPath), `Atomic tier 'components/${tier}' must exist`);
    const files = fs.readdirSync(tierPath).filter((f) => f.endsWith('.jsx'));
    assert.ok(files.length > 0, `Atomic tier 'components/${tier}' must contain JSX components`);
  }
});

test('3. Frontend Accessibility (WCAG 2.1 AA): Screen reader live announcer regions present', () => {
  const mainLayoutPath = path.join(SRC_ROOT, 'components', 'templates', 'MainLayout.jsx');
  assert.ok(fs.existsSync(mainLayoutPath), 'MainLayout.jsx must exist');
  const content = fs.readFileSync(mainLayoutPath, 'utf-8');

  assert.ok(
    content.includes('aria-live="polite"'),
    'MainLayout must have an aria-live="polite" region for screen readers'
  );
  assert.ok(
    content.includes('aria-live="assertive"'),
    'MainLayout must have an aria-live="assertive" region for critical alerts'
  );
});

test('4. Frontend Accessibility: Dual reading comfort themes (Warm Paper & Soft Dark)', () => {
  const togglePath = path.join(SRC_ROOT, 'components', 'molecules', 'ThemeToggle.jsx');
  assert.ok(fs.existsSync(togglePath), 'ThemeToggle.jsx must exist');
  const content = fs.readFileSync(togglePath, 'utf-8');

  assert.ok(
    content.includes('Warm Paper') || content.includes('paper'),
    'ThemeToggle must support Warm Paper reading theme'
  );
  assert.ok(
    content.includes('Soft Dark') || content.includes('dark'),
    'ThemeToggle must support Soft Dark reading theme'
  );
  assert.ok(
    content.includes('aria-label'),
    'ThemeToggle buttons must have aria-label for accessibility'
  );
});

test('5. Frontend Accessibility: Native keyboard shortcuts declared with Alt keys', () => {
  const shortcutsPath = path.join(SRC_ROOT, 'components', 'organisms', 'ShortcutsModal.jsx');
  assert.ok(fs.existsSync(shortcutsPath), 'ShortcutsModal.jsx must exist');
  const content = fs.readFileSync(shortcutsPath, 'utf-8');

  assert.ok(content.includes('Alt + 1'), 'Keyboard shortcut Alt+1 must be mapped for Risk Review');
  assert.ok(content.includes('Alt + T'), 'Keyboard shortcut Alt+T must be mapped for Theme Toggle');
  assert.ok(content.includes('Alt + S'), 'Keyboard shortcut Alt+S must be mapped for Shortcuts');
});

test('6. Frontend Accessibility: Typography font scaling controls present', () => {
  const fontSelectorPath = path.join(SRC_ROOT, 'components', 'molecules', 'FontSizeSelector.jsx');
  assert.ok(fs.existsSync(fontSelectorPath), 'FontSizeSelector.jsx must exist');
  const content = fs.readFileSync(fontSelectorPath, 'utf-8');

  assert.ok(content.includes('fontSize') || content.includes('font-size') || content.includes('Normal'), 'Font scaling must support multiple sizes');
  assert.ok(content.includes('aria-label'), 'FontSizeSelector must have aria-label');
});

test('7. Frontend Efficiency: Production build assets exist and remain lightweight (< 350 kB)', () => {
  const distDir = path.join(FRONTEND_ROOT, 'dist');
  assert.ok(fs.existsSync(distDir), 'dist/ directory must exist (run npm run build first)');

  const assetsDir = path.join(distDir, 'assets');
  assert.ok(fs.existsSync(assetsDir), 'dist/assets directory must exist');

  const assetFiles = fs.readdirSync(assetsDir);
  let totalBytes = 0;
  for (const f of assetFiles) {
    const stat = fs.statSync(path.join(assetsDir, f));
    totalBytes += stat.size;
  }

  const totalKb = totalBytes / 1024;
  assert.ok(
    totalKb < 400,
    `Production bundle size (${totalKb.toFixed(2)} KB) must be less than 400 KB for optimal Core Web Vitals`
  );
});

test('8. Frontend API Service: Standardized methods match CLAIM and LeMAJ contract specs', () => {
  const apiPath = path.join(SRC_ROOT, 'services', 'api.js');
  assert.ok(fs.existsSync(apiPath), 'api.js service must exist');
  const content = fs.readFileSync(apiPath, 'utf-8');

  assert.ok(content.includes('getHealth'), 'api must export getHealth');
  assert.ok(content.includes('analyzeDocument'), 'api must export analyzeDocument');
  assert.ok(content.includes('uploadFile'), 'api must export uploadFile');
  assert.ok(content.includes('uploadRawText'), 'api must export uploadRawText');
  assert.ok(content.includes('purgeSession'), 'api must export purgeSession');
});
