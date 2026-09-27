package com.agripulse.projectleap.repository;

import com.agripulse.projectleap.model.CustomerInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerInvoiceRepository extends JpaRepository<CustomerInvoice, Long> {}
