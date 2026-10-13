package com.hospital.hpmadmin.repository;

import com.hospital.hpmadmin.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ContactRepository extends JpaRepository<Contact, UUID> {

}