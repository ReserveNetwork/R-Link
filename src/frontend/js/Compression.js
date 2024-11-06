// compression.js
import pako from 'pako';

/**
 * Compresses an array of frames using pako deflate
 * @param {string[]} frames - Array of frames to compress
 * @returns {Uint8Array} Compressed data
 */
export const compressFrames = (frames) => {
    const jsonString = JSON.stringify(frames);
    const encodedString = new TextEncoder().encode(jsonString);
    return pako.deflate(encodedString);
};

/**
 * Decompresses frames from compressed data
 * @param {Uint8Array} compressedData - Compressed frame data
 * @returns {string[]} Array of decompressed frames
 */
export const decompressFrames = (compressedData) => {
    try {
        const decompressed = pako.inflate(compressedData);
        console.log(decompressed);
        const decodedString = new TextDecoder().decode(decompressed);
        console.log(decodedString);
        return JSON.parse(decodedString);
    } catch (error) {
        console.error('Error decompressing frames: ', error);
        return [];
    }
};

/**
 * Saves and compresses frames
 * @param {string[]} frames - Array of frames to save
 * @returns {Uint8Array} Compressed data
 */
export const saveCompressedFrames = (frames) => {
    return compressFrames(frames);
};

/**
 * Loads and decompresses frames
 * @param {Uint8Array} frames - Compressed frame data
 * @returns {string[]} Array of decompressed frames
 */
export const loadCompressedFrames = (frames) => {
    if (!frames) {
        return [];
    }

    try {
        return decompressFrames(frames);
    } catch (error) {
        console.error('Error loading compressed frames: ', error);
        return [];
    }
};

/**
 * Compresses audio chunks
 * @param {Uint8Array} audioChunks - Audio data to compress
 * @returns {string} Base64 encoded compressed data
 */
const compressAudioChunks = (audioChunks) => {
    const jsonString = JSON.stringify(audioChunks);
    const encodedString = new TextEncoder().encode(jsonString);
    const compressed = pako.deflate(encodedString);
    return bytesToBase64(compressed);
};

/**
 * Decompresses audio chunks
 * @param {string} compressedData - Compressed audio data
 * @returns {Uint8Array} Decompressed audio data
 */
const decompressAudioChunks = (compressedData) => {
    const decompressed = pako.inflate(base64ToBytes(compressedData));
    const decodedString = new TextDecoder().decode(decompressed);
    return JSON.parse(decodedString);
};

/**
 * Saves compressed audio to localStorage
 * @param {string} audioChunks - Compressed audio data
 */
export const saveCompressedAudio = (audioChunks) => {
    try {
        localStorage.setItem('compressedAudio', audioChunks);
    } catch (error) {
        console.error('Error saving compressed audio: ', error);
    }
};

/**
 * Loads compressed audio from localStorage
 * @returns {string} Compressed audio data
 */
export const loadCompressedAudio = () => {
    try {
        const compressed = localStorage.getItem('compressedAudio');
        return compressed || '';
    } catch (error) {
        console.error('Error loading compressed audio: ', error);
        return '';
    }
};

/**
 * Compresses audio blob (placeholder for future implementation)
 * @param {Blob} audioBlob - Audio blob to compress
 * @returns {Promise<Blob>} Compressed audio blob
 */
const compressAudio = async (audioBlob) => audioBlob;

/**
 * Converts blob to base64 string
 * @param {Blob} blob - Blob to convert
 * @returns {Promise<string>} Base64 string
 */
export const blobToBase64 = async (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
});

/**
 * Converts base64 string to blob
 * @param {string} base64 - Base64 string to convert
 * @param {string} type - MIME type of the blob
 * @returns {Blob} Converted blob
 */
const base64ToBlob = (base64, type) => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], {type});
};

/**
 * Converts base64 string to byte array
 * @param {string} base64 - Base64 string to convert
 * @returns {Uint8Array} Byte array
 */
export const base64ToBytes = (base64) => {
    const binString = atob(base64);
    const len = binString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binString.charCodeAt(i);
    }
    return bytes;
};

/**
 * Converts byte array to base64 string
 * @param {Uint8Array} bytes - Byte array to convert
 * @returns {string} Base64 string
 */
export const bytesToBase64 = (bytes) => {
    const binString = Array.from(bytes, byte => 
        String.fromCodePoint(byte)
    ).join('');
    return btoa(binString);
};

/**
 * Converts binary data to Uint8Array
 * @param {ArrayBuffer} binary - Binary data to convert
 * @returns {Uint8Array} Byte array
 */
export const binaryToUint8Array = (binary) => {
    const bytes = new Uint8Array(binary.byteLength);
    const view = new DataView(binary);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = view.getUint8(i);
    }
    return bytes;
};