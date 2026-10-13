package com.hospital.hpmadmin.service;

import com.hospital.hpmadmin.dto.AddressResponseDto;
import com.hospital.hpmadmin.dto.ContactResponseDto;
import com.hospital.hpmadmin.dto.PatientRequestDto;
import com.hospital.hpmadmin.dto.PatientResponseDto;
import com.hospital.hpmadmin.entity.Address;
import com.hospital.hpmadmin.entity.Patient;
import com.hospital.hpmadmin.repository.PatientRepository;
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
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientResponseDto mapToResponse(Patient patient) {
        return PatientResponseDto.builder()
                .id(patient.getId())
                .patientNumber(patient.getPatientNumber())
                .firstName(patient.getFirstName())
                .middleName(patient.getMiddleName())
                .lastName(patient.getLastName())
                .gender(patient.getGender())
                .birthDate(patient.getBirthDate())
                .active(patient.isActive())
                .alive(patient.isAlive())
                .maritalStatus(patient.getMaritalStatus())
                .hasMultipleBirth(patient.getMultipleBirth())
                .multipleBirthOrder(patient.getMultipleBirthOrder())
                .address(patient.getAddresses() != null
                        ? patient.getAddresses().stream()
                        .map(address -> AddressResponseDto.builder()
                                .id(address.getId())
                                .street(address.getStreet())
                                .city(address.getCity())
                                .district(address.getDistrict())
                                .country(address.getCountry())
                                .build())
                        .collect(Collectors.toList())
                        : List.of())
                .contacts(patient.getPatientContact() != null
                        ? patient.getPatientContact().stream()
                        .map(contact -> ContactResponseDto.builder()
                                .id(contact.getId())
                                .name(contact.getName())
                                .relationship(contact.getRelationshipType())
                                .telecom(contact.getTelecom())
                                .build())
                        .collect(Collectors.toList())
                        : List.of())
                .nextOfKinContacts(patient.getNextOfKinContact() != null
                        ? patient.getNextOfKinContact().stream()
                        .map(contact -> ContactResponseDto.builder()
                                .id(contact.getId())
                                .name(contact.getName())
                                .relationship(contact.getRelationshipType())
                                .telecom(contact.getTelecom())
                                .build())
                        .collect(Collectors.toList())
                        : List.of())
                .build();
    }

    public PatientResponseDto create(
            PatientRequestDto requestDto,
            UUID actorId
    ) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);

        if (patientRepository.existsByPatientNumber(requestDto.getPatientNumber())) {
            throw new IllegalStateException(
                    "Patient number already exists: " + requestDto.getPatientNumber());
        }

        Patient patient = new Patient();
        patient.setPatientNumber(requestDto.getPatientNumber());
        patient.setFirstName(requestDto.getFirstName());
        patient.setMiddleName(requestDto.getMiddleName());
        patient.setLastName(requestDto.getLastName());
        patient.setGender(requestDto.getGender());
        patient.setBirthDate(requestDto.getBirthDate());
        patient.setActive(requestDto.isActive());
        patient.setAlive(requestDto.isAlive());
        patient.setMaritalStatus(requestDto.getMaritalStatus());
        patient.setMultipleBirth(requestDto.getHasMultipleBirth());
        patient.setMultipleBirthOrder(requestDto.getMultipleBirthOrder());

        // Audit tracking
        patient.setCreatedBy(actorId);
        patient.setUpdatedBy(actorId);

        Patient saved = patientRepository.save(patient);

        log.info(
                "Created patient '{}' with ID '{}' by actor '{}' (corrId '{}')",
                saved.getPatientNumber(), saved.getId(), actorId, corrId);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public PatientResponseDto findById(UUID id) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        Patient patient = getById(id);

        log.info("Retrieved patient '{}' (corrId '{}')", id, corrId);

        return mapToResponse(patient);
    }

    @Transactional(readOnly = true)
    public PatientResponseDto findByPatientNumber(String patientNumber) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        Patient patient = patientRepository
                .findByPatientNumber(patientNumber)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Patient not found: " + patientNumber));

        log.info("Retrieved patient number '{}' (corrId '{}')", patientNumber, corrId);

        return mapToResponse(patient);
    }

    @Transactional(readOnly = true)
    public List<PatientResponseDto> findAll() {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        List<PatientResponseDto> patients = patientRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        log.info("Retrieved '{}' patients (corrId '{}')", patients.size(), corrId);

        return patients;
    }

    public PatientResponseDto update(
            UUID id,
            PatientRequestDto requestDto,
            UUID actorId
    ) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        Patient patient = getById(id);

        if (requestDto.getPatientNumber() != null
                && !requestDto.getPatientNumber().equals(patient.getPatientNumber())
                && patientRepository.existsByPatientNumberAndIdNot(
                requestDto.getPatientNumber(), id)) {
            throw new IllegalStateException(
                    "Patient number already exists: " + requestDto.getPatientNumber());
        }

        patient.setPatientNumber(requestDto.getPatientNumber());
        patient.setFirstName(requestDto.getFirstName());
        patient.setMiddleName(requestDto.getMiddleName());
        patient.setLastName(requestDto.getLastName());
        patient.setGender(requestDto.getGender());
        patient.setBirthDate(requestDto.getBirthDate());
        patient.setActive(requestDto.isActive());
        patient.setAlive(requestDto.isAlive());
        patient.setMaritalStatus(requestDto.getMaritalStatus());
        patient.setMultipleBirth(requestDto.getHasMultipleBirth());
        patient.setMultipleBirthOrder(requestDto.getMultipleBirthOrder());

        // Update tracking
        patient.setUpdatedBy(actorId);

        Patient saved = patientRepository.save(patient);

        log.info("Updated patient '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);

        return mapToResponse(saved);
    }

    public void delete(UUID id, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        Patient patient = getById(id);
        patientRepository.delete(patient);

        log.info("Deleted patient '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);
    }

    private Patient getById(UUID id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Patient not found: " + id));
    }
}