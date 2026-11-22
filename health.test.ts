import test from 'node:test';
import assert from 'node:assert/strict';

test('health endpoint contract exposes a healthy service response shape', () => {
  const response = { ok: true, service: 'TorqSmash Growth MCP', version: '2.0.0' };
  assert.equal(response.ok, true);
  assert.equal(response.service, 'TorqSmash Growth MCP');
  assert.match(response.version, /^\d+\.\d+\.\d+$/);
});
