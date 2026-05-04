/**
 * Audio Utility for playing PCM data from Gemini TTS
 */

export async function playPcmAudio(base64Data: string, sampleRate: number = 24000) {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Convert base64 to ArrayBuffer
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // PCM data is 16-bit little-endian
  const int16Buffer = new Int16Array(bytes.buffer);
  const float32Buffer = new Float32Array(int16Buffer.length);
  
  // Normalize Int16 to Float32 (-1.0 to 1.0)
  for (let i = 0; i < int16Buffer.length; i++) {
    float32Buffer[i] = int16Buffer[i] / 32768;
  }
  
  const audioBuffer = audioContext.createBuffer(1, float32Buffer.length, sampleRate);
  audioBuffer.getChannelData(0).set(float32Buffer);
  
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
  
  return source;
}
