export interface WaveformOptions {
  samplesPerPeak?: number;
  maxLevels?: number;
}

export interface WaveformPeak {
  start: number;
  end: number;
  min: number;
  max: number;
}

export interface WaveformLevel {
  bucketSize: number;
  peaks: readonly WaveformPeak[];
}

export interface Waveform {
  sampleCount: number;
  levels: readonly WaveformLevel[];
}

function positiveInteger(value: number, name: string, maximum: number): number {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new RangeError(`${name} must be a positive safe integer no greater than ${maximum}.`);
  }
  return value;
}

export function createWaveform(
  samples: ArrayLike<number>,
  options: WaveformOptions = {},
): Waveform {
  if (samples === null || typeof samples !== 'object' || !Number.isSafeInteger(samples.length)) {
    throw new TypeError('samples must be an array-like collection with a safe integer length.');
  }
  if (samples.length < 0 || samples.length > 10_000_000) {
    throw new RangeError('samples.length must be from 0 to 10000000.');
  }
  const firstBucket = positiveInteger(options.samplesPerPeak ?? 256, 'samplesPerPeak', 1_000_000);
  const maxLevels = positiveInteger(options.maxLevels ?? 32, 'maxLevels', 64);
  const input = new Float64Array(samples.length);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = samples[index];
    if (typeof sample !== 'number' || !Number.isFinite(sample)) {
      throw new TypeError(`Sample ${index} must be a finite number.`);
    }
    input[index] = sample;
  }

  const levels: WaveformLevel[] = [];
  let bucketSize = firstBucket;
  let peaks: WaveformPeak[] = [];
  for (let start = 0; start < input.length; start += bucketSize) {
    const end = Math.min(input.length, start + bucketSize);
    let min = Infinity;
    let max = -Infinity;
    for (let index = start; index < end; index += 1) {
      min = Math.min(min, input[index]!);
      max = Math.max(max, input[index]!);
    }
    peaks.push({ start, end, min, max });
  }
  levels.push({ bucketSize, peaks });

  while (peaks.length > 1 && levels.length < maxLevels) {
    const previous = peaks;
    bucketSize *= 2;
    peaks = [];
    for (let index = 0; index < previous.length; index += 2) {
      const first = previous[index]!;
      const second = previous[index + 1];
      peaks.push({
        start: first.start,
        end: second?.end ?? first.end,
        min: second ? Math.min(first.min, second.min) : first.min,
        max: second ? Math.max(first.max, second.max) : first.max,
      });
    }
    levels.push({ bucketSize, peaks });
  }
  return { sampleCount: input.length, levels };
}

export function getWaveformPeaks(
  waveform: Waveform,
  start: number,
  end: number,
  levelIndex = 0,
): WaveformPeak[] {
  if (!waveform || !Number.isSafeInteger(waveform.sampleCount) || waveform.sampleCount < 0) {
    throw new TypeError('waveform must be created by createWaveform.');
  }
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    start > end ||
    end > waveform.sampleCount
  ) {
    throw new RangeError('Range must satisfy 0 <= start <= end <= sampleCount.');
  }
  if (!Number.isSafeInteger(levelIndex) || levelIndex < 0 || levelIndex >= waveform.levels.length) {
    throw new RangeError('levelIndex must identify an available waveform level.');
  }
  const peaks = waveform.levels[levelIndex]!.peaks;
  if (start === end) return [];
  return peaks
    .filter((peak) => peak.end > start && peak.start < end)
    .map((peak) => ({ ...peak, start: Math.max(start, peak.start), end: Math.min(end, peak.end) }));
}
