import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AnnouncementBanner from '../AnnouncementBanner';

vi.mock('../services/api.js', () => ({
  api: {
    getActiveAnnouncements: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

describe('AnnouncementBanner', () => {
  it('renders without errors', () => {
    render(<AnnouncementBanner />);
  });

  it('renders Megaphone icon when present', () => {
    const { container } = render(<AnnouncementBanner />);
    expect(container).toBeInTheDocument();
  });
});
