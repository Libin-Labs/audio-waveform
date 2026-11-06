import test from 'node:test';
import assert from 'node:assert/strict';
import { createWaveform, getWaveformPeaks } from '../dist/esm/index.js';

test('builds successively coarser finite peaks and clips queried bounds', () => {
  const waveform = createWaveform([0, 0.5, -0.25, 1, 0], { samplesPerPeak: 2 });
  assert.deepEqual(
    waveform.levels.map((level) => level.peaks.length),
    [3, 2, 1],
  );
  assert.deepEqual(getWaveformPeaks(waveform, 1, 5), [
    { start: 1, end: 2, min: 0, max: 0.5 },
    { start: 2, end: 4, min: -0.25, max: 1 },
    { start: 4, end: 5, min: 0, max: 0 },
  ]);
  assert.deepEqual(getWaveformPeaks(waveform, 0, 5, 1), [
    { start: 0, end: 4, min: -0.25, max: 1 },
    { start: 4, end: 5, min: 0, max: 0 },
  ]);
});

test('handles empty, negative, and partial buckets', () => {
  const empty = createWaveform([]);
  assert.equal(empty.sampleCount, 0);
  assert.deepEqual(getWaveformPeaks(empty, 0, 0), []);
  const waveform = createWaveform([-8, -3, -6], { samplesPerPeak: 2 });
  assert.deepEqual(waveform.levels[0].peaks, [
    { start: 0, end: 2, min: -8, max: -3 },
    { start: 2, end: 3, min: -6, max: -6 },
  ]);
});

test('rejects invalid samples, options, and ranges', () => {
  assert.throws(() => createWaveform([0, Number.NaN]), TypeError);
  assert.throws(() => createWaveform([0], { samplesPerPeak: 0 }), RangeError);
  const waveform = createWaveform([0]);
  assert.throws(() => getWaveformPeaks(waveform, -1, 0), RangeError);
  assert.throws(() => getWaveformPeaks(waveform, 0, 2), RangeError);
  assert.throws(() => getWaveformPeaks(waveform, 0, 1, 1), RangeError);
});
