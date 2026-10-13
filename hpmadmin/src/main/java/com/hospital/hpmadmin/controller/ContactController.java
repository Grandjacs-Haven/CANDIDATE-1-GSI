package com.hospital.hpmadmin.controller;

import com.hospital.hpmadmin.dto.ContactRequestDto;
import com.hospital.hpmadmin.dto.ContactResponseDto;
import com.hospital.hpmadmin.service.ContactService;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContactResponseDto createContact(
            @Valid @RequestBody ContactRequestDto request,
            @RequestHeader(value = AppConstants.ACTOR_ID, required = false) UUID actorId) {
        return contactService.create(request, actorId);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ContactResponseDto getContact(@PathVariable UUID id) {
        return contactService.findById(id);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<ContactResponseDto> getAllContacts() {
        return contactService.findAll();
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ContactResponseDto updateContact(
            @PathVariable UUID id,
            @Valid @RequestBody ContactRequestDto request,
            @RequestHeader(value = AppConstants.ACTOR_ID, required = false) UUID actorId) {
        return contactService.update(id, request, actorId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteContact(
            @PathVariable UUID id,
            @RequestHeader(value = AppConstants.ACTOR_ID, required = false) UUID actorId) {
        contactService.delete(id, actorId);
    }

//    @PostMapping("/{contactId}/assign-patient/{patientId}")
//    @ResponseStatus(HttpStatus.OK)
//    public void assignContactToPatient(
//            @PathVariable UUID contactId,
//            @PathVariable UUID patientId,
//            @RequestHeader(value = AppConstants.ACTOR_ID, required = false) UUID actorId) {
//        // Implementation can fetch both and add contact to patient.getPatientContact()
//    }
//
//    @PostMapping("/{contactId}/assign-practitioner/{practitionerId}")
//    @ResponseStatus(HttpStatus.OK)
//    public void assignContactToPractitioner(
//            @PathVariable UUID contactId,
//            @PathVariable UUID practitionerId,
//            @RequestHeader(value = AppConstants.ACTOR_ID, required = false) UUID actorId) {
//        // Implementation can fetch both and add contact to practitioner.getRelatedContacts()
//    }
}