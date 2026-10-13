package com.hospital.hpmadmin.service;

import com.hospital.hpmadmin.dto.AddressResponseDto;
import com.hospital.hpmadmin.dto.ContactRequestDto;
import com.hospital.hpmadmin.dto.ContactResponseDto;
import com.hospital.hpmadmin.entity.Address;
import com.hospital.hpmadmin.entity.Contact;
import com.hospital.hpmadmin.entity.Patient;
import com.hospital.hpmadmin.entity.Practitioner;
import com.hospital.hpmadmin.repository.ContactRepository;
import com.hospital.hpmadmin.repository.PatientRepository;
import com.hospital.hpmadmin.repository.PractitionerRepository;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ContactService {

    private final ContactRepository contactRepository;
    private final PatientRepository patientRepository;
    private final PractitionerRepository practitionerRepository;

    private ContactResponseDto mapContactToResponse(Contact contact) {
        if (contact == null) {
            return null;
        }
        return ContactResponseDto.builder()
                .id(contact.getId())
                .name(contact.getName())
                .relationship(contact.getRelationshipType())
                .telecom(contact.getTelecom())
                .address(contact.getAddress() != null
                        ? AddressResponseDto.builder()
                        .id(contact.getAddress().getId())
                        .street(contact.getAddress().getStreet())
                        .city(contact.getAddress().getCity())
                        .district(contact.getAddress().getDistrict())
                        .country(contact.getAddress().getCountry())
                        .build()
                        : null)
                .build();
    }

    public ContactResponseDto create(
            ContactRequestDto requestDto,
            UUID actorId
    ) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);

        Contact contact = new Contact();
        contact.setRelationshipType(requestDto.getRelationshipType());
        contact.setName(requestDto.getName());
        contact.setTelecom(requestDto.getTelecom());

        if (requestDto.getAddress() != null) {
            Address address = Address.builder()
                    .street(requestDto.getAddress().getStreet())
                    .city(requestDto.getAddress().getCity())
                    .district(requestDto.getAddress().getDistrict())
                    .country(requestDto.getAddress().getCountry())
                    .build();
            address.setCreatedBy(actorId);
            address.setUpdatedBy(actorId);
            contact.setAddress(address);
        }

        contact.setCreatedBy(actorId);
        contact.setUpdatedBy(actorId);

        Contact saved = contactRepository.save(contact);

        // Link to Patient Contact list
        if (requestDto.getPatientId() != null) {
            Patient patient = patientRepository.findById(requestDto.getPatientId())
                    .orElseThrow(() -> new EntityNotFoundException("Patient not found: " + requestDto.getPatientId()));
            patient.getPatientContact().add(saved);
            patientRepository.save(patient);
        }

        // Link to Patient Next of Kin list
        if (requestDto.getNextOfKinPatientId() != null) {
            Patient patient = patientRepository.findById(requestDto.getNextOfKinPatientId())
                    .orElseThrow(() -> new EntityNotFoundException("Patient not found: " + requestDto.getNextOfKinPatientId()));
            patient.getNextOfKinContact().add(saved);
            patientRepository.save(patient);
        }

        // Link to Practitioner Related Contacts list
        if (requestDto.getPractitionerId() != null) {
            Practitioner practitioner = practitionerRepository.findById(requestDto.getPractitionerId())
                    .orElseThrow(() -> new EntityNotFoundException("Practitioner not found: " + requestDto.getPractitionerId()));
            practitioner.getRelatedContacts().add(saved);
            practitionerRepository.save(practitioner);
        }

        log.info(
                "Created contact '{}' by actor '{}' (corrId '{}')",
                saved.getId(), actorId, corrId
        );

        return mapContactToResponse(saved);
    }

    @Transactional(readOnly = true)
    public ContactResponseDto findById(UUID id) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        Contact contact = getById(id);
        log.info("Retrieved contact '{}' (corrId '{}')", id, corrId);
        return mapContactToResponse(contact);
    }

    @Transactional(readOnly = true)
    public List<ContactResponseDto> findAll() {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        List<ContactResponseDto> contacts = contactRepository.findAll()
                .stream()
                .map(this::mapContactToResponse)
                .collect(Collectors.toList());
        log.info("Retrieved '{}' contacts (corrId '{}')", contacts.size(), corrId);
        return contacts;
    }

    public ContactResponseDto update(
            UUID id,
            ContactRequestDto requestDto,
            UUID actorId
    ) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        Contact contact = getById(id);

        contact.setRelationshipType(requestDto.getRelationshipType());
        contact.setName(requestDto.getName());
        contact.setTelecom(requestDto.getTelecom());
        contact.setUpdatedBy(actorId);

        Contact saved = contactRepository.save(contact);
        log.info("Updated contact '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);
        return mapContactToResponse(saved);
    }

    public void delete(UUID id, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        Contact contact = getById(id);
        contactRepository.delete(contact);
        log.info("Deleted contact '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);
    }

    private Contact getById(UUID id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contact not found: " + id));
    }
}