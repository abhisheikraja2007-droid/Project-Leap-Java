package com.agripulse.projectleap.presenter;

import com.agripulse.projectleap.model.Contact;
import com.agripulse.projectleap.model.CustomerInvoice;
import com.agripulse.projectleap.model.SalesOrder;
import com.agripulse.projectleap.repository.CustomerInvoiceRepository;
import com.agripulse.projectleap.repository.SalesOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class IrrigationSalesService {

    private final SalesOrderRepository salesOrderRepository;
    private final CustomerInvoiceRepository customerInvoiceRepository;

    @Autowired
    public IrrigationSalesService(SalesOrderRepository salesOrderRepository,
                                  CustomerInvoiceRepository customerInvoiceRepository) {
        this.salesOrderRepository = salesOrderRepository;
        this.customerInvoiceRepository = customerInvoiceRepository;
    }

    /**
     * Business Rule Implementation:
     * Generates a Sales Order for irrigation dispatch when soil moisture < 20%
     * for > 2 hours (120 minutes), and then automatically converts this to a Customer Invoice.
     */
    public CustomerInvoice processDeficitDispatchEvent(String sectorId, BigDecimal currentMoisture, int minutesBelowThreshold, Contact customer) {
        if (currentMoisture.compareTo(BigDecimal.valueOf(20.0)) < 0 && minutesBelowThreshold > 120) {
            
            // 1. Generate Sales Order for automated precision irrigation dispatch
            long nextOrderId = salesOrderRepository.count() + 8920;
            String soNumber = "SO-IRR-" + nextOrderId;
            
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

            salesOrder = salesOrderRepository.save(salesOrder);

            // 2. Automatically convert the dispatched Sales Order to a Customer Invoice
            long nextInvoiceId = customerInvoiceRepository.count() + 4820;
            String invNumber = "INV-" + nextInvoiceId;
            
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

            invoice = customerInvoiceRepository.save(invoice);
            
            salesOrder.setStatus(SalesOrder.SalesOrderStatus.INVOICED);
            salesOrderRepository.save(salesOrder);

            return invoice;
        }

        return null;
    }

    public List<SalesOrder> getAllSalesOrders() {
        return salesOrderRepository.findAll();
    }

    public List<CustomerInvoice> getAllInvoices() {
        return customerInvoiceRepository.findAll();
    }
}
