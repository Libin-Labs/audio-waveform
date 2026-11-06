# @lp-labs/audio-waveform

Build headless, multiresolution min/max peaks from finite samples you already have. This package
does not decode audio, read files, schedule workers, or access browser APIs.

## Install and quick start

```sh
npm install @lp-labs/audio-waveform
```

```js
import { createWaveform, getWaveformPeaks } from '@lp-labs/audio-waveform';

const waveform = createWaveform([0, 0.5, -0.25, 1, 0], { samplesPerPeak: 2 });
console.log(getWaveformPeaks(waveform, 1, 5, 0));
// [{ start: 1, end: 2, min: 0.5, max: 0.5 }, ...]
```

## API

- `createWaveform(samples, options?)` copies and validates an array-like sequence of finite numeric
  samples, then creates successive peak levels. The default first bucket contains 256 samples;
  each subsequent level combines neighboring buckets.
- `getWaveformPeaks(waveform, start, end, levelIndex?)` returns peaks overlapping the half-open
  sample range `[start, end)`. Returned `start`/`end` are clipped to that query range. A coarse
  peak's min/max can include samples outside the clipped bounds when a bucket only partly overlaps.
- `WaveformOptions`, `Waveform`, `WaveformLevel`, and `WaveformPeak` are exported types.

Options are bounded: up to 10,000,000 samples, `samplesPerPeak` from 1 to 1,000,000, and one to 64
levels. Empty input yields an empty base level. A request for an invalid range/level throws
`RangeError`; malformed inputs or non-finite samples throw `TypeError`.

## Limits and customization

Samples are not clamped or assumed normalized; peaks retain the supplied finite values. Choose a
bucket size and level for your display resolution. The API only computes peaks synchronously in
memory; it does not promise streaming, decoding, worker use, or a particular rendering cadence.
The output is plain numeric data and requires no runtime or peer dependencies.

ESM, CommonJS, and TypeScript declarations are included. TypeScript and Prettier are development-only.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
