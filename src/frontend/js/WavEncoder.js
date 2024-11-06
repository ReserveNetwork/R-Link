// WavEncoder.js

/**
 * Encodes audio samples into a WAV file format
 * @param {Float32Array|number[]} samples - Audio samples to encode
 * @param {number} [sampleRate=8000] - Sample rate in Hz
 * @param {number} [numChannels=1] - Number of audio channels
 * @returns {ArrayBuffer} WAV file data as ArrayBuffer
 */
export const encodeWav = (samples, sampleRate = 8000, numChannels = 1) => {
    // Create buffer for WAV file (44 bytes header + audio data)
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true); // file length
    writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);                     // sub-chunk size
    view.setUint16(20, 1, true);                      // audio format (1 = PCM)
    view.setUint16(22, numChannels, true);            // number of channels
    view.setUint32(24, sampleRate, true);             // sample rate
    view.setUint32(28, sampleRate * numChannels * 2, true); // byte rate
    view.setUint16(32, numChannels * 2, true);        // block align
    view.setUint16(34, 16, true);                     // bits per sample

    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);     // data chunk length

    // write the PCM samples
    floatTo16BitPcm(view, 44, samples);

    return buffer;
};

/**
 * Writes a string to a DataView at specified offset
 * @param {DataView} view - DataView to write to
 * @param {number} offset - Offset in bytes
 * @param {string} string - String to write
 */
const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
};

/**
 * Converts float audio samples to 16-bit PCM
 * @param {DataView} output - DataView to write PCM data to
 * @param {number} offset - Offset in bytes
 * @param {Float32Array|number[]} input - Input audio samples
 */
const floatTo16BitPcm = (output, offset, input) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
};