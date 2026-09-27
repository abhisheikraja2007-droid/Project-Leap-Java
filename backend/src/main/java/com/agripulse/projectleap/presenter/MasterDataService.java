package com.agripulse.projectleap.presenter;

import com.agripulse.projectleap.model.Account;
import com.agripulse.projectleap.model.Contact;
import com.agripulse.projectleap.model.Product;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MasterDataService {

    private final Map<Long, Contact> contactStore = new ConcurrentHashMap<>();
    private final Map<Long, Product> productStore = new ConcurrentHashMap<>();
    private final Map<Long, Account> accountStore = new ConcurrentHashMap<>();
    private long contactIdSeq = 100;
    private long productIdSeq = 100;

    public MasterDataService() {
        initDefaultSeedData();
    }

    private void initDefaultSeedData() {
        // Seed initial Contact Master
        Contact marcus = Contact.builder()
                .id(1L)
                .contactCode("AGR-C-8812")
                .name("Marcus Vance")
                .organization("Green Valley Agri Corp")
                .type(Contact.ContactType.FARMER)
                .email("marcus.vance@valleyagri.com")
                .mobile("+1 (555) 234-8901")
                .address("Parcel 12-B, Highway 44, Des Moines, IA 50309")
                .terms("1,200 Acres")
                .taxId("FSA-994-012")
                .build();
        contactStore.put(1L, marcus);

        Contact helena = Contact.builder()
                .id(2L)
                .contactCode("AGR-C-4091")
                .name("Helena Brandt")
                .organization("BioNutrient Solutions LLC")
                .type(Contact.ContactType.SUPPLIER)
                .email("h.brandt@bionutrient.com")
                .mobile("+1 (555) 872-4412")
                .address("800 Agri-Commerce Way, Omaha, NE 68102")
                .terms("Net 30 Days")
                .taxId("NE-4429-BN")
                .build();
        contactStore.put(2L, helena);

        Contact apex = Contact.builder()
                .id(3L)
                .contactCode("AGR-C-3389")
                .name("Apex Pivot & Pump Systems")
                .organization("Irrigation Hardware & Telemetry")
                .type(Contact.ContactType.VENDOR)
                .email("orders@apexpivots.com")
                .mobile("+1 (555) 431-9080")
                .address("120 Industrial Pkwy, Lincoln, NE 68508")
                .terms("Net 45 Days")
                .taxId("VND-091-APX")
                .build();
        contactStore.put(3L, apex);

        // Seed Product Master
        Product urea = Product.builder()
                .id(1L)
                .sku("SKU-FERT-UREA46")
                .productName("High-Yield Urea 46-0-0")
                .type(Product.ProductType.GOODS)
                .category("Fertilizer")
                .salesPrice(new BigDecimal("850.00"))
                .cost(new BigDecimal("620.00"))
                .unitOfMeasure("ton")
                .marginPercentage(new BigDecimal("27.10"))
                .build();
        productStore.put(1L, urea);

        Product probe = Product.builder()
                .id(2L)
                .sku("SKU-IOT-PRB-V3")
                .productName("Smart Soil Moisture Probe v3")
                .type(Product.ProductType.GOODS)
                .category("IoT Hardware")
                .salesPrice(new BigDecimal("320.00"))
                .cost(new BigDecimal("210.00"))
                .unitOfMeasure("unit")
                .marginPercentage(new BigDecimal("34.40"))
                .build();
        productStore.put(2L, probe);

        Product consulting = Product.builder()
                .id(3L)
                .sku("SKU-SRV-VRD-ANN")
                .productName("Variable Rate Drip Advisory Package")
                .type(Product.ProductType.SERVICE)
                .category("Agronomy Consulting")
                .salesPrice(new BigDecimal("45.00"))
                .cost(new BigDecimal("18.00"))
                .unitOfMeasure("acre")
                .marginPercentage(new BigDecimal("60.00"))
                .build();
        productStore.put(3L, consulting);

        // Seed Chart of Accounts
        accountStore.put(1000L, Account.builder().id(1000L).accountCode("1000").name("ASSETS").type(Account.AccountType.ASSET).balance(new BigDecimal("2840920.00")).build());
        accountStore.put(2000L, Account.builder().id(2000L).accountCode("2000").name("LIABILITIES").type(Account.AccountType.LIABILITY).balance(new BigDecimal("418200.00")).build());
        accountStore.put(4000L, Account.builder().id(4000L).accountCode("4000").name("INCOME & REVENUE").type(Account.AccountType.REVENUE).balance(new BigDecimal("1450800.00")).build());
        accountStore.put(5000L, Account.builder().id(5000L).accountCode("5000").name("DIRECT AGRI-EXPENSES").type(Account.AccountType.EXPENSE).balance(new BigDecimal("684310.00")).build());
    }

    public List<Contact> getAllContacts() {
        return new ArrayList<>(contactStore.values());
    }

    public Contact addContact(Contact contact) {
        long id = ++contactIdSeq;
        contact.setId(id);
        if (contact.getContactCode() == null) {
            contact.setContactCode("AGR-C-" + (1000 + id));
        }
        contactStore.put(id, contact);
        return contact;
    }

    public List<Product> getAllProducts() {
        return new ArrayList<>(productStore.values());
    }

    public Product addProduct(Product product) {
        long id = ++productIdSeq;
        product.setId(id);
        product.calculateMargin();
        productStore.put(id, product);
        return product;
    }

    public List<Account> getChartOfAccounts() {
        return new ArrayList<>(accountStore.values());
    }
}
