import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewVideoBrief } from '../src/services/video-service.js';

test('video brief review clearly declares text-only limitations', () => {
  const result = reviewVideoBrief({ description: 'A sports car jumps over a row of obstacles in BeamNG.drive.' });
  assert.match(result.analysisScope, /Text-only/);
  assert.ok(result.reviewChecklist.length >= 5);
});
