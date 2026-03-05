import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    globalCompositeOperation: 'source-over',
    fillStyle: '#ffffff'
  }))
});

Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: vi.fn(() => 'data:image/png;base64,exported-image')
});

class MockImage {
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;
  width = 800;
  height = 600;
  crossOrigin = '';

  set src(_value: string) {
    setTimeout(() => {
      this.onload?.();
    }, 0);
  }
}

vi.stubGlobal('Image', MockImage);
