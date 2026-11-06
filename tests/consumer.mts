import { createWaveform, getWaveformPeaks, type Waveform } from '@lp-labs/audio-waveform';
const waveform: Waveform = createWaveform([0, 1]);
const peaks: number = getWaveformPeaks(waveform, 0, 2).length;
// @ts-expect-error samples must be array-like numbers.
createWaveform('not samples');
void peaks;
