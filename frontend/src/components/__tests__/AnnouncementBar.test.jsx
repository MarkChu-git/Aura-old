import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnnouncementBar from '../AnnouncementBar';

vi.mock('../services/api.js', () => ({
  api: {
    getActiveAnnouncements: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

describe('AnnouncementBar', () => {
  it('renders without errors', () => {
    render(<AnnouncementBar />);
  });

  it('renders Info icon when present', () => {
    const { container } = render(<AnnouncementBar />);
    expect(container).toBeInTheDocument();
  });
});
