import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../../components/Header';
import { vi } from 'vitest';

describe('Header Component', () => {
  it('renders roles and calls setUserRole on toggle', async () => {
    const mockSetUserRole = vi.fn();
    const mockOpenAiChat = vi.fn();
    
    render(
      <Header 
        userRole="Field Operator" 
        setUserRole={mockSetUserRole} 
        openAiChat={mockOpenAiChat} 
      />
    );
    
    expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
    
    const agronomyBtn = screen.getByRole('button', { name: /Agronomy Director/i });
    await userEvent.click(agronomyBtn);
    
    expect(mockSetUserRole).toHaveBeenCalledWith('Agronomy Director');
  });
});
