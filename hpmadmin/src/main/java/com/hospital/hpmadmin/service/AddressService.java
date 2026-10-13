package com.hospital.hpmadmin.service;

import com.hospital.hpmadmin.dto.AddressRequest;
import com.hospital.hpmadmin.dto.AddressResponseDto;
import com.hospital.hpmadmin.entity.Address;
import com.hospital.hpmadmin.entity.Patient;
import com.hospital.hpmadmin.entity.Practitioner;
import com.hospital.hpmadmin.repository.AddressRepository;
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
public class AddressService {

    private final AddressRepository addressRepository;
    private final PatientRepository patientRepository;
    private final PractitionerRepository practitionerRepository; // Inject Practitioner repo

    public AddressResponseDto mapToResponse(Address address) {
        return AddressResponseDto.builder()
                .id(address.getId())
                .street(address.getStreet())
                .city(address.getCity())
                .district(address.getDistrict())
                .country(address.getCountry())
                .build();
    }

    @Transactional
    public AddressResponseDto saveAddress(AddressRequest dto, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Saving new address in city: '{}', country: '{}' by actor '{}' (corrId '{}')", dto.getCity(), dto.getCountry(), actorId, corrId);

        Address address = Address.builder()
                .street(dto.getStreet())
                .city(dto.getCity())
                .district(dto.getDistrict())
                .country(dto.getCountry())
                .build();

        address.setCreatedBy(actorId);
        address.setUpdatedBy(actorId);

        Address savedAddress = addressRepository.save(address);

        // Attach to Patient if personid is provided
        if (dto.getPersonid() != null) {
            Patient patient = patientRepository.findById(dto.getPersonid())
                    .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + dto.getPersonid()));
            patient.getAddresses().add(savedAddress);
            patientRepository.save(patient);
            log.info("Linked address '{}' to patient '{}'", savedAddress.getId(), patient.getId());
        }

        // Attach to Practitioner if practitionerId is provided
        if (dto.getPractitionerId() != null) {
            Practitioner practitioner = practitionerRepository.findById(dto.getPractitionerId())
                    .orElseThrow(() -> new EntityNotFoundException("Practitioner not found with id: " + dto.getPractitionerId()));
            practitioner.getAddresses().add(savedAddress);
            practitionerRepository.save(practitioner);
            log.info("Linked address '{}' to practitioner '{}'", savedAddress.getId(), practitioner.getId());
        }

        log.info("Successfully saved address with ID: '{}' by actor '{}' (corrId '{}')", savedAddress.getId(), actorId, corrId);
        return mapToResponse(savedAddress);
    }

    @Transactional
    public AddressResponseDto attachAddressToPractitioner(UUID addressId, UUID practitionerId, UUID actorId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found with id: " + addressId));

        Practitioner practitioner = practitionerRepository.findById(practitionerId)
                .orElseThrow(() -> new EntityNotFoundException("Practitioner not found with id: " + practitionerId));

        if (!practitioner.getAddresses().contains(address)) {
            practitioner.getAddresses().add(address);
            practitionerRepository.save(practitioner);
        }

        return mapToResponse(address);
    }

    @Transactional(readOnly = true)
    public AddressResponseDto findById(UUID id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address not found with id: " + id));
        return mapToResponse(address);
    }

    @Transactional(readOnly = true)
    public List<AddressResponseDto> findAll() {
        return addressRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAddress(UUID id, UUID actorId) {
        if (!addressRepository.existsById(id)) {
            throw new EntityNotFoundException("Cannot delete: Address not found");
        }
        addressRepository.deleteById(id);
    }

    @Transactional
    public AddressResponseDto updateAddress(UUID id, AddressRequest dto, UUID actorId) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address not found with id: " + id));

        if (dto.getStreet() != null) address.setStreet(dto.getStreet());
        if (dto.getCity() != null) address.setCity(dto.getCity());
        if (dto.getDistrict() != null) address.setDistrict(dto.getDistrict());
        if (dto.getCountry() != null) address.setCountry(dto.getCountry());

        address.setUpdatedBy(actorId);
        return mapToResponse(addressRepository.save(address));
    }
}