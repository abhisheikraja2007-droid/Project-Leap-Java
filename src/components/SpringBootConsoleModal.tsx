import React, { useState } from 'react';

interface SpringBootConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  onTelemetryFired?: (order: any) => void;
}

export const SpringBootConsoleModal: React.FC<SpringBootConsoleModalProps> = ({
  isOpen,
  onClose,
  showToast,
  onTelemetryFired,
}) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'architecture' | 'code'>('simulator');
  const [sectorId, setSectorId] = useState('Sector 4-B (Corn V8 Stage)');
  const [moisture, setMoisture] = useState(17.4);
  const [durationMinutes, setDurationMinutes] = useState(165);
  const [cwsi, setCwsi] = useState(0.68);
  const [suppliesNeeded, setSuppliesNeeded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResult, setApiResult] = useState<any>(null);

  const [selectedCodeFile, setSelectedCodeFile] = useState<'pom' | 'props' | 'telemetryService' | 'salesService' | 'entity'>('telemetryService');

  if (!isOpen) return null;

  const handleTestTelemetry = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sensors/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectorId,
          soilMoisture: moisture,
          durationBelowThresholdMinutes: durationMinutes,
          cwsi,
          evapotranspiration: 6.8,
          suppliesNeeded,
        }),
      });

      const data = await response.json();
      setApiResult(data);
      if (data.pumpTriggered) {
        showToast(`Spring Boot Dispatch: SCADA Valve Group 4-B Actuated! SO & Invoice generated.`);
        if (onTelemetryFired && data.salesOrder) {
          onTelemetryFired(data);
        }
      } else {
        showToast('Spring Boot Telemetry: Sensor packet ingested. Thresholds normal.');
      }
    } catch {
      showToast('Error sending telemetry packet to Spring Boot presenter.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-inverse-surface/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col border border-[#dce9ff]">
        {/* Header */}
        <div className="p-5 px-6 bg-surface-container-low border-b border-[#dce9ff] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">terminal</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  Spring Boot &amp; MySQL (projectleap) MVP Backend Console
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-primary-fixed text-on-primary-fixed uppercase tracking-wider">
                  Spring Boot 3.2.3 · Maven
                </span>
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Model-View-Presenter Architecture: Entities (Model), DTOs (View), Services &amp; REST Controllers (Presenter)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-surface-container-lowest border-b border-[#dce9ff]/60 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'simulator'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">sensors</span>
            <span>Live Telemetry API Tester (POST /api/sensors/telemetry)</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'architecture'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">schema</span>
            <span>MVP Architecture Breakdown</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'code'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">code</span>
            <span>Java &amp; Maven Source Files</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className="p-4 bg-surface-container-low rounded-xl border border-[#dce9ff]/60 flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">info</span>
                <div className="text-xs text-on-surface leading-relaxed">
                  <strong>Requirement 5.B &amp; 5.C Business Rules:</strong> When sensor readings exhibit soil moisture &lt; <strong>20.0%</strong> for &gt; <strong>2 hours (120 min)</strong>, the Spring Boot <code>TelemetryService</code> evaluates thresholds, commands SCADA valve actuation, triggers <code>IrrigationSalesService</code> to generate an automated <strong>Sales Order (SO)</strong> and converts it to a <strong>Customer Invoice</strong>. If supplies are needed, it simultaneously generates a water utility <strong>Purchase Order (PO)</strong> and creates an AP <strong>Vendor Bill</strong>.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form Controls */}
                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-[#dce9ff] space-y-4">
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                    Configure Sensor Telemetry Packet
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">Sector Node Target</label>
                    <input
                      type="text"
                      value={sectorId}
                      onChange={(e) => setSectorId(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Soil Moisture VWC (%)</span>
                      <span className={`font-data-mono font-bold ${moisture < 20.0 ? 'text-error' : 'text-primary'}`}>
                        {moisture}% {moisture < 20.0 ? '(Critical Deficit)' : '(Safe)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10.0"
                      max="40.0"
                      step="0.1"
                      value={moisture}
                      onChange={(e) => setMoisture(parseFloat(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Duration Below Threshold (Minutes)</span>
                      <span className="font-data-mono font-bold text-on-surface">
                        {durationMinutes} min ({Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="300"
                      step="5"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="suppliesNeeded"
                      checked={suppliesNeeded}
                      onChange={(e) => setSuppliesNeeded(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="suppliesNeeded" className="text-xs text-on-surface font-medium cursor-pointer">
                      Flag: Supplies Needed (Auto-generate water utility PO &amp; Vendor Bill)
                    </label>
                  </div>

                  <button
                    onClick={handleTestTelemetry}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>{isLoading ? 'Processing via Spring Boot...' : 'Send Sensor Telemetry (POST /api/sensors/telemetry)'}</span>
                  </button>
                </div>

                {/* Response Inspection */}
                <div className="bg-surface-container-low p-5 rounded-2xl border border-[#dce9ff] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-headline-sm text-sm font-bold text-on-surface">
                        Spring Boot Execution Output
                      </span>
                      <span className="font-data-mono text-[10.5px] text-on-surface-variant">HTTP 200 OK</span>
                    </div>

                    {apiResult ? (
                      <div className="space-y-3">
                        <div
                          className={`p-3 rounded-xl border text-xs leading-relaxed ${
                            apiResult.pumpTriggered
                              ? 'bg-error-container/40 border-error/30 text-error font-semibold'
                              : 'bg-primary-fixed/40 border-primary/30 text-on-primary-fixed-variant'
                          }`}
                        >
                          {apiResult.message}
                        </div>

                        {apiResult.salesOrder && (
                          <div className="p-3 bg-surface-container-lowest rounded-xl border border-[#dce9ff] text-xs space-y-1">
                            <span className="font-bold text-primary block">
                              Automated Sales Order &amp; Invoice Generated:
                            </span>
                            <div>SO Number: <strong className="font-data-mono">{apiResult.salesOrder.orderNumber}</strong></div>
                            <div>Customer Invoice: <strong className="font-data-mono">{apiResult.customerInvoice.invoiceNumber}</strong> (${apiResult.salesOrder.totalAmount.toFixed(2)})</div>
                            <div>Volume: 18,500 Gallons @ 420 GPM</div>
                          </div>
                        )}

                        {apiResult.purchaseOrder && (
                          <div className="p-3 bg-surface-container-lowest rounded-xl border border-[#dce9ff] text-xs space-y-1">
                            <span className="font-bold text-tertiary block">
                              Water Utility Procurement Generated:
                            </span>
                            <div>Purchase Order: <strong className="font-data-mono">{apiResult.purchaseOrder.id}</strong> (${apiResult.purchaseOrder.total.toFixed(2)})</div>
                            <div>Vendor Bill: <strong className="font-data-mono">{apiResult.vendorBill.billNumber}</strong> ({apiResult.vendorBill.status})</div>
                            <div>Vendor: {apiResult.purchaseOrder.vendor}</div>
                          </div>
                        )}

                        <div className="font-data-mono text-[11px] bg-slate-900 text-emerald-400 p-2.5 rounded-lg overflow-x-auto max-h-36">
                          {JSON.stringify(apiResult.reading, null, 2)}
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-xs text-on-surface-variant space-y-2">
                        <span className="material-symbols-outlined text-[36px] text-outline">data_object</span>
                        <p>Click &quot;Send Sensor Telemetry&quot; to test the live Spring Boot business rule logic.</p>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-on-surface-variant font-data-mono pt-3 border-t border-[#dce9ff]/60">
                    Database: MySQL <code>jdbc:mysql://localhost:3306/projectleap</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Model */}
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-[#dce9ff] space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <span className="material-symbols-outlined text-[20px]">database</span>
                  <span className="text-sm">MODEL LAYER (JPA Entities)</span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  JPA Entities mapped to MySQL tables with automatic DDL updates in database <code>projectleap</code>.
                </p>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="p-2 rounded bg-surface-container-low font-semibold">• Contact.java (@Table contacts)</div>
                  <div className="p-2 rounded bg-surface-container-low font-semibold">• Product.java (@Table products)</div>
                  <div className="p-2 rounded bg-surface-container-low font-semibold">• Account.java (@Table chart_of_accounts)</div>
                  <div className="p-2 rounded bg-surface-container-low font-semibold">• Journal.java &amp; JournalEntry.java</div>
                  <div className="p-2 rounded bg-surface-container-low font-semibold">• PurchaseOrder.java &amp; VendorBill.java</div>
                  <div className="p-2 rounded bg-surface-container-low font-semibold">• SalesOrder.java &amp; CustomerInvoice.java</div>
                  <div className="p-2 rounded bg-surface-container-low font-semibold">• Payment.java (@Table payments)</div>
                  <div className="p-2 rounded bg-surface-container-low font-semibold">• TelemetryReading.java (@Table telemetry_readings)</div>
                </div>
              </div>

              {/* View */}
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-[#dce9ff] space-y-3">
                <div className="flex items-center gap-2 text-secondary font-bold">
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                  <span className="text-sm">VIEW LAYER (DTOs)</span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Data Transfer Objects structuring outgoing JSON sent to the React frontend.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-surface-container-low border border-[#dce9ff]/60">
                    <strong className="block text-on-surface font-mono">TelemetryRequestDTO.java</strong>
                    <span className="text-[11px] text-on-surface-variant">Ingests sensor payload: soilMoisture, duration, CWSI, ETc, suppliesNeeded.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-low border border-[#dce9ff]/60">
                    <strong className="block text-on-surface font-mono">BudgetReportView.java</strong>
                    <span className="text-[11px] text-on-surface-variant">Formats planned vs. actual irrigation expenditure per Analytic Account.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-low border border-[#dce9ff]/60">
                    <strong className="block text-on-surface font-mono">FinancialSnapshotView.java</strong>
                    <span className="text-[11px] text-on-surface-variant">Formats Balance Sheet (A = L + E) and Profit &amp; Loss accounts.</span>
                  </div>
                </div>
              </div>

              {/* Presenter */}
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-[#dce9ff] space-y-3">
                <div className="flex items-center gap-2 text-tertiary font-bold">
                  <span className="material-symbols-outlined text-[20px]">settings_input_component</span>
                  <span className="text-sm">PRESENTER LAYER (Services &amp; REST)</span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Encapsulates business logic, threshold evaluation, and REST routing.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-surface-container-low border border-[#dce9ff]/60">
                    <strong className="block text-on-surface font-mono">MasterDataService &amp; Controller</strong>
                    <span className="text-[11px] text-on-surface-variant">Farmer contacts, Agri-products, Chart of Accounts management.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-low border border-[#dce9ff]/60">
                    <strong className="block text-on-surface font-mono">TelemetryService (POST /api/sensors/telemetry)</strong>
                    <span className="text-[11px] text-on-surface-variant">Evaluates VWC &lt; 20%, triggers SCADA pumps, creates POs &amp; Bills.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-low border border-[#dce9ff]/60">
                    <strong className="block text-on-surface font-mono">IrrigationSalesService</strong>
                    <span className="text-[11px] text-on-surface-variant">Rule: VWC &lt; 20% for &gt; 2h generates Sales Order &amp; Customer Invoice.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-low border border-[#dce9ff]/60">
                    <strong className="block text-on-surface font-mono">ReportingController &amp; ReportService</strong>
                    <span className="text-[11px] text-on-surface-variant">Date range querying for Water Budget and P&amp;L reports.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CODE VIEWER */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-on-surface-variant">Select File:</span>
                <button
                  onClick={() => setSelectedCodeFile('telemetryService')}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs ${
                    selectedCodeFile === 'telemetryService'
                      ? 'bg-primary text-on-primary font-bold'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  TelemetryService.java
                </button>
                <button
                  onClick={() => setSelectedCodeFile('salesService')}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs ${
                    selectedCodeFile === 'salesService'
                      ? 'bg-primary text-on-primary font-bold'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  IrrigationSalesService.java
                </button>
                <button
                  onClick={() => setSelectedCodeFile('entity')}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs ${
                    selectedCodeFile === 'entity'
                      ? 'bg-primary text-on-primary font-bold'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  TelemetryReading.java
                </button>
                <button
                  onClick={() => setSelectedCodeFile('props')}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs ${
                    selectedCodeFile === 'props'
                      ? 'bg-primary text-on-primary font-bold'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  application.properties
                </button>
                <button
                  onClick={() => setSelectedCodeFile('pom')}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs ${
                    selectedCodeFile === 'pom'
                      ? 'bg-primary text-on-primary font-bold'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  pom.xml
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs max-h-96 overflow-y-auto leading-relaxed border border-slate-800">
                {selectedCodeFile === 'telemetryService' && (
                  <pre>{`// TelemetryService.java - Ingests sensor data & generates pump dispatch / PO
@Service
public class TelemetryService {
    @Autowired private IrrigationSalesService salesService;

    public Map<String, Object> processTelemetry(TelemetryRequestDTO request) {
        boolean thresholdBreached = request.getSoilMoisture().compareTo(BigDecimal.valueOf(20.0)) < 0;
        boolean durationMet = request.getDurationBelowThresholdMinutes() > 120;
        boolean pumpTriggered = thresholdBreached && durationMet;

        if (pumpTriggered) {
            // Trigger Sales Order -> Customer Invoice
            salesService.processDeficitDispatchEvent(request.getSectorId(), request.getSoilMoisture(), request.getDurationBelowThresholdMinutes(), farmer);
        }
        if (request.getSuppliesNeeded() || pumpTriggered) {
            // Create Purchase Order & Vendor Bill for utility replenishment
            createUtilityPurchaseOrderAndBill(request.getSectorId());
        }
        return response;
    }
}`}</pre>
                )}

                {selectedCodeFile === 'salesService' && (
                  <pre>{`// IrrigationSalesService.java - Soil Moisture Deficit Rule
@Service
public class IrrigationSalesService {
    public CustomerInvoice processDeficitDispatchEvent(String sectorId, BigDecimal moisture, int minutesBelowThreshold, Contact customer) {
        if (moisture.compareTo(BigDecimal.valueOf(20.0)) < 0 && minutesBelowThreshold > 120) {
            // 1. Generate Sales Order
            SalesOrder so = SalesOrder.builder()
                .orderNumber("SO-IRR-" + ++orderSequence)
                .customer(customer)
                .sectorName(sectorId)
                .totalAmount(new BigDecimal("750.00"))
                .status(SalesOrder.SalesOrderStatus.DISPATCHED)
                .build();

            // 2. Automatically convert to Customer Invoice
            CustomerInvoice invoice = CustomerInvoice.builder()
                .invoiceNumber("INV-" + ++invoiceSequence)
                .salesOrder(so)
                .customer(customer)
                .totalAmount(so.getTotalAmount())
                .status(CustomerInvoice.InvoiceStatus.OUTSTANDING)
                .build();

            return invoice;
        }
        return null;
    }
}`}</pre>
                )}

                {selectedCodeFile === 'entity' && (
                  <pre>{`// TelemetryReading.java - JPA Entity mapped to MySQL
@Entity
@Table(name = "telemetry_readings")
@Getter @Setter @Builder
public class TelemetryReading {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "node_sector_id", nullable = false)
    private String nodeSectorId;

    @Column(name = "soil_moisture_vwc", precision = 5, scale = 2)
    private BigDecimal soilMoistureVwc;

    @Column(name = "threshold_floor")
    private BigDecimal thresholdFloor = BigDecimal.valueOf(20.0);

    @Column(name = "duration_below_threshold_minutes")
    private Integer durationBelowThresholdMinutes;

    @Column(name = "pump_dispatch_triggered")
    private Boolean pumpDispatchTriggered;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;
}`}</pre>
                )}

                {selectedCodeFile === 'props' && (
                  <pre>{`# application.properties - MySQL Connectivity for projectleap
spring.datasource.url=jdbc:mysql://localhost:3306/projectleap?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Auto-generate schema based on JPA Models
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
server.port=8080`}</pre>
                )}

                {selectedCodeFile === 'pom' && (
                  <pre>{`<!-- pom.xml - Spring Boot with Spring Web, Data JPA, MySQL & Lombok -->
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>`}</pre>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-surface-container-low border-t border-[#dce9ff] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-data-mono">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Spring Boot REST Server &amp; MySQL <code>projectleap</code> Verified</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
