import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const plistPath = path.join(root, 'ios', 'App', 'App', 'Info.plist');

describe('ios platform', () => {
  it('ios directory exists', () => {
    assert.ok(fs.existsSync(path.join(root, 'ios')), 'run: npx cap add ios');
  });

  it('Info.plist includes required usage descriptions', () => {
    const xml = fs.readFileSync(plistPath, 'utf8');
    assert.match(xml, /NSMicrophoneUsageDescription/);
    assert.match(xml, /NSSpeechRecognitionUsageDescription/);
    assert.match(xml, /NSMotionUsageDescription/);
  });

  it('supports iPhone and iPad orientations', () => {
    const xml = fs.readFileSync(plistPath, 'utf8');
    assert.match(xml, /UISupportedInterfaceOrientations~ipad/);
    assert.match(xml, /UIInterfaceOrientationPortrait/);
  });
});
