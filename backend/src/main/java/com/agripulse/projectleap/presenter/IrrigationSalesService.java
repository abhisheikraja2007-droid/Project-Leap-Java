package com.agripulse.projectleap.presenter;

import com.agripulse.projectleap.model.Contact;
import com.agripulse.projectleap.model.CustomerInvoice;
import com.agripulse.projectleap.model.SalesOrder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class IrrigationSalesService {

    private final Map<String, SalesOrder> salesOrders = new ConcurrentHashMap<>();
    private final Map<String, CustomerInvoice> invoices = new ConcurrentHashMap<>();
    private long orderSequence = 8920;
    private long invoiceSequence = 4820;

    /**
     * Business Rule Implementation:
     * Generates a Sales Order for irrigation dispatch when soil moisture < 20%
     * for > 2 hours (120 minutes), and then automatically converts this to a Customer Invoice.
     */
    public CustomerInvoice processDeficitDispatchEvent(String sectorId, BigDecimal currentMoisture, int minutesBelowThreshold, Contact customer) {
        if (currentMoisture.compareTo(BigDecimal.valueOf(20.0)) < 0 && minutesBelowThreshold > 120) {
            // 1. Generate Sales Order for automated precision irrigation dispatch
            String soNumber = "SO-IRR-" + (++orderSequence);
            SalesOrder salesOrder = SalesOrder.builder()
                    .orderNumber(soNumber)
                    .customer(customer)
                    .sectorName(sectorId)
                    .serviceDescription("Automated Emergency Root Zone Irrigation Dispatch (VWC < 20.0% for " + minutesBelowThreshold + " mins)")
                    .waterVolumeGallons(18500)
                    .totalAmount(new BigDecimal("750.00")) // Base irrigation advisory dispatch fee
                    .status(SalesOrder.SalesOrderStatus.DISPATCHED)
                    .dispatchedAt(LocalDateTime.now())
                    .build();

            salesOrders.put(soNumber, salesOrder);

            // 2. Automatically convert the dispatched Sales Order to a Customer Invoice
            String invNumber = "INV-" + (++invoiceSequence);
            CustomerInvoice invoice = CustomerInvoice.builder()
                    .invoiceNumber(invNumber)
                    .salesOrder(salesOrder)
                    .customer(customer)
                    .invoiceDate(LocalDate.now())
                    .dueDate(LocalDate.now().plusDays(30))
                    .totalAmount(salesOrder.getTotalAmount())
                    .status(CustomerInvoice.InvoiceStatus.OUTSTANDING)
                    .createdAt(LocalDateTime.now())
                    .build();

            salesOrder.setStatus(SalesOrder.SalesOrderStatus.INVOICED);
            invoices.put(invNumber, invoice);

            return invoice;
        }

        return null;
    }

    public List<SalesOrder> getAllSalesOrders() {
        return new ArrayList<>(salesOrders.values());
    }

    public List<CustomerInvoice> getAllInvoices() {
        return new ArrayList<>(invoices.values());
    }
}
