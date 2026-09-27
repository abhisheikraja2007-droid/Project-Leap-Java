package com.agripulse.projectleap.presenter;

import com.agripulse.projectleap.model.Account;
import com.agripulse.projectleap.model.Contact;
import com.agripulse.projectleap.model.Product;
import com.agripulse.projectleap.repository.AccountRepository;
import com.agripulse.projectleap.repository.ContactRepository;
import com.agripulse.projectleap.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class MasterDataService {

    private final ContactRepository contactRepository;
    private final ProductRepository productRepository;
    private final AccountRepository accountRepository;

    @Autowired
    public MasterDataService(ContactRepository contactRepository,
                             ProductRepository productRepository,
                             AccountRepository accountRepository) {
        this.contactRepository = contactRepository;
        this.productRepository = productRepository;
        this.accountRepository = accountRepository;
    }

    @PostConstruct
    private void initDefaultSeedData() {
        if (contactRepository.count() == 0) {
            // Seed initial Contact Master
            Contact marcus = Contact.builder()
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
            contactRepository.save(marcus);

            Contact helena = Contact.builder()
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
            contactRepository.save(helena);

            Contact apex = Contact.builder()
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
            contactRepository.save(apex);
        }

        if (productRepository.count() == 0) {
            // Seed Product Master
            Product urea = Product.builder()
                    .sku("SKU-FERT-UREA46")
                    .productName("High-Yield Urea 46-0-0")
                    .type(Product.ProductType.GOODS)
                    .category("Fertilizer")
                    .salesPrice(new BigDecimal("850.00"))
                    .cost(new BigDecimal("620.00"))
                    .unitOfMeasure("ton")
                    .marginPercentage(new BigDecimal("27.10"))
                    .build();
            productRepository.save(urea);

            Product probe = Product.builder()
                    .sku("SKU-IOT-PRB-V3")
                    .productName("Smart Soil Moisture Probe v3")
                    .type(Product.ProductType.GOODS)
                    .category("IoT Hardware")
                    .salesPrice(new BigDecimal("320.00"))
                    .cost(new BigDecimal("210.00"))
                    .unitOfMeasure("unit")
                    .marginPercentage(new BigDecimal("34.40"))
                    .build();
            productRepository.save(probe);

            Product consulting = Product.builder()
                    .sku("SKU-SRV-VRD-ANN")
                    .productName("Variable Rate Drip Advisory Package")
                    .type(Product.ProductType.SERVICE)
                    .category("Agronomy Consulting")
                    .salesPrice(new BigDecimal("45.00"))
                    .cost(new BigDecimal("18.00"))
                    .unitOfMeasure("acre")
                    .marginPercentage(new BigDecimal("60.00"))
                    .build();
            productRepository.save(consulting);
        }

        if (accountRepository.count() == 0) {
            // Seed Chart of Accounts
            accountRepository.save(Account.builder().accountCode("1000").name("ASSETS").type(Account.AccountType.ASSET).balance(new BigDecimal("2840920.00")).build());
            accountRepository.save(Account.builder().accountCode("2000").name("LIABILITIES").type(Account.AccountType.LIABILITY).balance(new BigDecimal("418200.00")).build());
            accountRepository.save(Account.builder().accountCode("4000").name("INCOME & REVENUE").type(Account.AccountType.REVENUE).balance(new BigDecimal("1450800.00")).build());
            accountRepository.save(Account.builder().accountCode("5000").name("DIRECT AGRI-EXPENSES").type(Account.AccountType.EXPENSE).balance(new BigDecimal("684310.00")).build());
        }
    }

    public List<Contact> getAllContacts() {
        return contactRepository.findAll();
    }

    public Contact addContact(Contact contact) {
        if (contact.getContactCode() == null) {
            long newId = contactRepository.count() + 1000;
            contact.setContactCode("AGR-C-" + newId);
        }
        return contactRepository.save(contact);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product addProduct(Product product) {
        product.calculateMargin();
        return productRepository.save(product);
    }

    public List<Account> getChartOfAccounts() {
        return accountRepository.findAll();
    }
}
