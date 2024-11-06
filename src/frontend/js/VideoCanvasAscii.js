// VideoCanvasAscii.js

/**
 * Converts pixel intensity to ASCII character
 * @param {number} intensity - Pixel intensity value
 * @param {string} asciiChars - String of ASCII characters to use
 * @returns {string} ASCII character
 */
const pixelToAsciiChar = (intensity, asciiChars) => {
  return asciiChars[Math.floor(intensity / 256 * asciiChars.length)];
};

/**
 * Converts RGB values to colored ASCII character
 * @param {number} red - Red value
 * @param {number} green - Green value
 * @param {number} blue - Blue value
 * @param {string} asciiChars - String of ASCII characters to use
 * @returns {string} HTML span element with colored ASCII character
 */
const pixelToAsciiCharColor = (red, green, blue, asciiChars) => {
  const color = `rgb(${red}, ${green}, ${blue})`;
  const colorIndex = Math.floor((red + green + blue) / 3 / 256 * asciiChars.length);
  const asciiChar = asciiChars[colorIndex];
  return `<span style="color: ${color}">${asciiChar}</span>`;
};

/**
 * Converts image data to ASCII art
 * @param {ImageData} imageData - Image data from canvas
 * @param {string} asciiChars - String of ASCII characters to use
 * @returns {string} ASCII art string
 */
const getAsciiFromImage = (imageData, asciiChars) => {
  const { width, height } = imageData;
  const pixels = imageData.data;

  let asciiImage = '';
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x++) {
      const index = ((y * width) + x) * 4;
      const intensity = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
      asciiImage += pixelToAsciiChar(intensity, asciiChars);
    }
    asciiImage += '\n';
  }

  return asciiImage;
};

/**
 * Converts image data to colored ASCII art
 * @param {ImageData} imageData - Image data from canvas
 * @param {string} asciiChars - String of ASCII characters to use
 * @returns {string} HTML string with colored ASCII art
 */
const getAsciiFromImageColor = (imageData, asciiChars) => {
  const { width, height } = imageData;
  const pixels = imageData.data;

  let asciiImage = '';
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x++) {
      const index = ((y * width) + x) * 4;
      asciiImage += pixelToAsciiCharColor(
        pixels[index],
        pixels[index + 1],
        pixels[index + 2],
        asciiChars
      );
    }
    asciiImage += '\n';
  }

  return asciiImage;
};

// Constants for font sizing and spacing
const incrementFontValue = 0.1; // The value to increment the font size with
const initFontSize = 1.0;      // Init font size for calculation
const lineSpacing = 0.25;      // Line spacing in em units
const lineHeight = 0.8;        // Line height in em units

/**
 * Calculates and sets the optimal font size for ASCII art
 * @param {HTMLPreElement} pretag - Pre element to set font size on
 * @param {number} charsPerLine - Number of characters per line
 * @param {number} charsPerColumn - Number of characters per column
 * @param {number} parentWidth - Parent element width
 * @param {number} parentHeight - Parent element height
 */
const calculateAndSetFontSize = (pretag, charsPerLine, charsPerColumn, parentWidth, parentHeight) => {
  // Create test string with one line of 'W' characters
  const filledStringLine = 'W'.repeat(charsPerLine);

  // Set initial font size
  let fontSize = initFontSize;

  // Create buffer pre element for calculations
  const preElementBuffer = document.createElement('pre');
  preElementBuffer.style.fontSize = `${fontSize}px`;
  preElementBuffer.style.fontFamily = 'monospace';
  preElementBuffer.style.letterSpacing = `${lineSpacing}em`;
  preElementBuffer.style.lineHeight = `${lineHeight}em`;
  preElementBuffer.style.position = 'absolute';

  // Fill buffer with test lines
  for (let i = 0; i < charsPerColumn; i++) {
    preElementBuffer.append(filledStringLine);
    preElementBuffer.append('\n');
  }

  // Add to DOM temporarily for measurements
  document.body.appendChild(preElementBuffer);

  // Get initial dimensions
  let preWidth = preElementBuffer.getBoundingClientRect().width;
  let preHeight = preElementBuffer.getBoundingClientRect().height;

  // Increase font size until text exceeds parent dimensions
  while (preWidth < parentWidth && preHeight < parentHeight) {
    fontSize += incrementFontValue;
    preElementBuffer.style.fontSize = `${fontSize}px`;
    preWidth = preElementBuffer.getBoundingClientRect().width;
    preHeight = preElementBuffer.getBoundingClientRect().height;
  }

  // Clean up buffer element
  preElementBuffer.remove();

  // Set final font size (one step back)
  fontSize -= incrementFontValue;
  pretag.style.fontSize = `${fontSize}px`;

  // Debug logging
  console.log('calculateAndSetFontSize', {
    fontSize,
    parentHeight,
    preHeight,
    parentWidth,
    preWidth
  });
};

/**
 * Converts canvas to image URL
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @returns {HTMLImageElement} Image element with canvas data
 */
const canvasImgToUrl = (canvas) => {
  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
};

/**
 * Converts video frame to image URL
 * @param {HTMLVideoElement} video - Video element
 * @returns {HTMLImageElement} Image element with video frame
 */
const videoImgToUrl = (video) => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvasImgToUrl(canvas);
};

// Export all functions and constants
export {
  getAsciiFromImage,
  calculateAndSetFontSize,
  getAsciiFromImageColor,
  lineSpacing,
  canvasImgToUrl,
  videoImgToUrl,
  lineHeight,
};