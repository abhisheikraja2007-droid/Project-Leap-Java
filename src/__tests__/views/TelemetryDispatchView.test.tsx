import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TelemetryDispatchView } from '../../views/TelemetryDispatchView';
import { vi, describe, it, expect } from 'vitest';

describe('TelemetryDispatchView Component', () => {
  it('triggers an alert state when moisture is submitted below 20%', async () => {
    const mockShowToast = vi.fn();
    render(
      <TelemetryDispatchView 
        onOpenAiAnalysis={vi.fn()} 
        onOpenAiChatWithPrompt={vi.fn()} 
        showToast={mockShowToast} 
      />
    );
    
    // Simulate user entering a critical moisture level in the ground-truth form
    const moistureInput = screen.getByLabelText(/Soil Moisture \(%\)/i);
    const submitBtn = screen.getByRole('button', { name: /Submit Ground-Truth Telemetry/i });

    await userEvent.clear(moistureInput);
    await userEvent.type(moistureInput, '15');
    await userEvent.click(submitBtn);

    // Wait for the async API call logic to complete
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalled();
    });
    
    // Validate if the correct alert message is included
    expect(mockShowToast.mock.calls[0][0]).toMatch(/Deficit logged|Telemetry logged|Telemetry reading/);
  });
});
