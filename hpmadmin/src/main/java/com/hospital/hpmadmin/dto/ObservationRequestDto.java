package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.ObservationType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ObservationRequestDto {

    @NotNull(message = "Observation type is required.")
    private ObservationType observationType;

    @NotNull(message = "Numeric value is required.")
    private BigDecimal numericValue;
}