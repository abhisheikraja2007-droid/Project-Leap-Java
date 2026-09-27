import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MasterDataView } from '../../views/MasterDataView';
import { vi } from 'vitest';

describe('MasterDataView Component', () => {
  const mockContacts = [
    {
      id: '1',
      name: 'John Doe',
      organization: 'Doe Farms',
      type: 'farmer' as const,
      email: 'john@example.com',
      phone: '123-456-7890',
      address: '123 Farm Road',
      terms: 'Net 30'
    }
  ];

  it('renders contacts and opens add contact modal', async () => {
    const mockOnAddContact = vi.fn();
    const mockShowToast = vi.fn();
    const mockOnOpenAiChatWithPrompt = vi.fn();

    render(
      <MasterDataView 
        contacts={mockContacts} 
        onAddContact={mockOnAddContact} 
        showToast={mockShowToast} 
        onOpenAiChatWithPrompt={mockOnOpenAiChatWithPrompt} 
      />
    );
    
    // Check if contact is rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // Open modal
    const addContactBtn = screen.getByRole('button', { name: /Add New Contact/i });
    await userEvent.click(addContactBtn);
    
    // Check if modal opens by looking for its header
    expect(screen.getByText('Add New Agri Contact')).toBeInTheDocument();
  });
});
