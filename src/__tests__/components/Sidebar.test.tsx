import React from 'react';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../../components/Sidebar';
import { vi } from 'vitest';

describe('Sidebar Component', () => {
  it('renders all navigation links properly', () => {
    const mockSetActiveTab = vi.fn();
    const mockOpenAiChat = vi.fn();

    render(
      <Sidebar 
        activeTab="dashboard" 
        setActiveTab={mockSetActiveTab} 
        openAiChat={mockOpenAiChat} 
      />
    );
    
    expect(screen.getByText(/Operations Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Telemetry & Dispatch/i)).toBeInTheDocument();
    expect(screen.getByText(/Financials & Orders/i)).toBeInTheDocument();
  });
});
