import { http, HttpResponse } from 'msw';
import { TelemetryRequestDTO } from '../types';

export const handlers = [
  // Mock the Telemetry Ingestion API
  http.post('/api/sensors/telemetry', async ({ request }) => {
    const data = await request.json() as TelemetryRequestDTO;
    
    // Simulate Business Logic: Moisture below 20% triggers irrigation
    if (data.moistureLevel < 20) {
      return HttpResponse.json({
        status: 'ALERT',
        message: 'Moisture critically low. Dispatching irrigation Sales Order.',
        pumpDispatched: true
      }, { status: 201 });
    }

    return HttpResponse.json({
      status: 'OK',
      message: 'Telemetry logged successfully.',
      pumpDispatched: false
    }, { status: 200 });
  }),

  // Mock Master Data Farmer Retrieval API
  http.get('/api/master-data/farmers', () => {
    return HttpResponse.json([
      { id: 1, name: 'John Doe', type: 'Farmer', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', type: 'Vendor', email: 'jane@agrisupplies.com' }
    ], { status: 200 });
  })
];
