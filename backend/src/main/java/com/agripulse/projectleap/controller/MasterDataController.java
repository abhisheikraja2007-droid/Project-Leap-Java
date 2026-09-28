package com.agripulse.projectleap.controller;

import com.agripulse.projectleap.service.MasterDataService;



import com.agripulse.projectleap.model.Account;
import com.agripulse.projectleap.model.Contact;
import com.agripulse.projectleap.model.Product;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master-data")
@CrossOrigin(origins = "*")
public class MasterDataController {

    private final MasterDataService masterDataService;

    public MasterDataController(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<Contact>> getContacts() {
        return ResponseEntity.ok(masterDataService.getAllContacts());
    }

    @PostMapping("/contacts")
    public ResponseEntity<Contact> createContact(@RequestBody Contact contact) {
        Contact saved = masterDataService.addContact(contact);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts() {
        return ResponseEntity.ok(masterDataService.getAllProducts());
    }

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product saved = masterDataService.addProduct(product);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/chart-of-accounts")
    public ResponseEntity<List<Account>> getChartOfAccounts() {
        return ResponseEntity.ok(masterDataService.getChartOfAccounts());
    }
}



