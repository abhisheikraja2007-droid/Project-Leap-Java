package com.agripulse.projectleap.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "journals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Journal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_number", unique = true, nullable = false, length = 64)
    private String referenceNumber; // e.g. "ACH-99214-WELLSFARGO", "JRN-2025-001"

    @Column(name = "posting_date", nullable = false)
    private LocalDateTime postingDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "journal", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<JournalEntry> entries = new ArrayList<>();

    public void addEntry(JournalEntry entry) {
        entries.add(entry);
        entry.setJournal(this);
    }
}

