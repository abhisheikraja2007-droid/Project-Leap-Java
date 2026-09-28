package com.agripulse.projectleap.service;



import com.agripulse.projectleap.model.*;
import com.agripulse.projectleap.dto.TelemetryRequestDTO;
import com.agripulse.projectleap.repository.TelemetryRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TelemetryService {

    private final IrrigationSalesService salesService;
    private final MasterDataService masterDataService;
    private final TelemetryRepository telemetryRepository;
    private final Map<String, PurchaseOrder> purchaseOrders = new ConcurrentHashMap<>();
    private final Map<String, VendorBill> vendorBills = new ConcurrentHashMap<>();
    private long poSequence = 842;
    private long billSequence = 930;

    public TelemetryService(IrrigationSalesService salesService, MasterDataService masterDataService, TelemetryRepository telemetryRepository) {
        this.salesService = salesService;
        this.masterDataService = masterDataService;
        this.telemetryRepository = telemetryRepository;
    }

    /**
     * Ingests sensor readings, evaluates sensor thresholds, generates automated pump dispatch triggers.
     * Triggers IrrigationSalesService (Sales Order -> Customer Invoice) when moisture < 20% for > 2 hours.
     * If supplies are needed, automatically creates a Purchase Order (PO) for water utility supplies
     * and processes a Vendor Bill.
     */
    public Map<String, Object> processTelemetry(TelemetryRequestDTO request) {
        String sector = request.getSectorId() != null ? request.getSectorId() : "Sector 4-B (Corn V8 Stage)";
        BigDecimal moisture = request.getSoilMoisture() != null ? request.getSoilMoisture() : new BigDecimal("17.40");
        int durationMinutes = request.getDurationBelowThresholdMinutes() != null ? request.getDurationBelowThresholdMinutes() : 165;
        BigDecimal cwsi = request.getCwsi() != null ? request.getCwsi() : new BigDecimal("0.68");
        BigDecimal etc = request.getEvapotranspiration() != null ? request.getEvapotranspiration() : new BigDecimal("6.80");

        boolean thresholdBreached = moisture.compareTo(BigDecimal.valueOf(20.0)) < 0;
        boolean durationMet = durationMinutes > 120; // > 2 hours
        boolean pumpTriggered = thresholdBreached && durationMet;

        // Persist reading in Telemetry model
        TelemetryReading reading = TelemetryReading.builder()
                .nodeSectorId(sector)
                .soilMoistureVwc(moisture)
                .durationBelowThresholdMinutes(durationMinutes)
                .cropWaterStressIndex(cwsi)
                .evapotranspirationMmDay(etc)
                .hydraulicPressurePsi(new BigDecimal("42.0"))
                .hydraulicFlowGpm(420)
                .pumpDispatchTriggered(pumpTriggered)
                .triggeredValveGroup(pumpTriggered ? "VALVE-GRP-4B" : null)
                .timestamp(LocalDateTime.now())
                .build();
        telemetryRepository.save(reading);

        Map<String, Object> response = new HashMap<>();
        response.put("reading", reading);
        response.put("pumpTriggered", pumpTriggered);
        response.put("message", pumpTriggered
                ? "CRITICAL DEFICIT DETECTED: Soil moisture " + moisture + "% < 20.0% for " + durationMinutes + " min. SCADA Valve Group 4-B Actuated (420 GPM @ 42 PSI)."
                : "Telemetry verified within monitored threshold limits.");

        // 1. Trigger Sales Order & Customer Invoice if moisture < 20% for > 2 hours
        if (pumpTriggered) {
            Contact farmer = masterDataService.getAllContacts().stream()
                    .filter(c -> c.getType() == Contact.ContactType.FARMER)
                    .findFirst()
                    .orElse(Contact.builder().name("Marcus Vance").email("marcus@valleyagri.com").build());

            CustomerInvoice invoice = salesService.processDeficitDispatchEvent(sector, moisture, durationMinutes, farmer);
            if (invoice != null) {
                response.put("salesOrderNumber", invoice.getSalesOrder().getOrderNumber());
                response.put("customerInvoiceNumber", invoice.getInvoiceNumber());
                response.put("dispatchServiceAmount", invoice.getTotalAmount());
            }
        }

        // 2. If supplies are needed, trigger Purchase Order (PO) for water utility/hardware supplies and process Vendor Bill
        if (Boolean.TRUE.equals(request.getSuppliesNeeded()) || pumpTriggered) {
            Contact vendor = masterDataService.getAllContacts().stream()
                    .filter(c -> c.getType() == Contact.ContactType.VENDOR || c.getType() == Contact.ContactType.SUPPLIER)
                    .findFirst()
                    .orElse(Contact.builder().name("Apex Pivot & Pump Systems").email("orders@apexpivots.com").build());

            String poNum = "PO-2025-0" + (++poSequence);
            PurchaseOrder po = PurchaseOrder.builder()
                    .poNumber(poNum)
                    .vendor(vendor)
                    .orderDate(LocalDate.now())
                    .deliveryRequiredDate(LocalDate.now().plusDays(3))
                    .analyticCostCenter(sector + " Irrigation Upgrade")
                    .specification("Emergency Solenoid Spares and Auxiliary Pumping Allocation")
                    .totalAmount(new BigDecimal("4320.00"))
                    .status(PurchaseOrder.POStatus.BILL_READY)
                    .paymentTerms("Net 30 Days")
                    .createdAt(LocalDateTime.now())
                    .build();
            purchaseOrders.put(poNum, po);

            String billNum = "BILL-2025-0" + (++billSequence);
            VendorBill bill = VendorBill.builder()
                    .billNumber(billNum)
                    .purchaseOrder(po)
                    .vendor(vendor)
                    .billDate(LocalDate.now())
                    .dueDate(LocalDate.now().plusDays(30))
                    .totalAmount(po.getTotalAmount())
                    .status(VendorBill.BillStatus.AWAITING_APPROVAL)
                    .build();
            vendorBills.put(billNum, bill);

            response.put("purchaseOrderCreated", poNum);
            response.put("vendorBillGenerated", billNum);
            response.put("procurementAmount", po.getTotalAmount());
        }

        return response;
    }

    public List<TelemetryReading> getRecentReadings() {
        return telemetryRepository.findAll();
    }
}


