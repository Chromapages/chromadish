import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./services/geminiService', () => ({
  generateFoodMockup: vi.fn().mockResolvedValue('generated-base64')
}));

vi.mock('./utils/fileUtils', () => ({
  fileToBase64: vi.fn(),
  processImageForGemini: vi.fn().mockResolvedValue({
    base64: 'source-base64',
    mimeType: 'image/png'
  })
}));

describe('critical generation flow', () => {
  it('completes upload -> generate -> export without errors', async () => {
    const user = userEvent.setup();
    const linkClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const { container } = render(<App />);
    const uploadInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    expect(uploadInput).toBeTruthy();

    const file = new File(['fake-image'], 'dish.png', { type: 'image/png' });
    await user.upload(uploadInput, file);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    await waitFor(() => {
      expect(generateButton).toBeEnabled();
    });

    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /export/i }));
    expect(screen.getByText('Export Image')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /download/i }));

    await waitFor(() => {
      expect(linkClickSpy).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Export Image')).not.toBeInTheDocument();
    });

    linkClickSpy.mockRestore();
  });
});
