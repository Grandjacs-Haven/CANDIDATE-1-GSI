package com.hospital.hpmadmin.repository;

import com.hospital.hpmadmin.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findByPatientIdOrderByScheduledStartTimeDesc(UUID patientId);

    List<Appointment> findByPatientId(UUID patientId);

}