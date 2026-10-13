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
public class ObservationUpdateDto {
    private ObservationType observationType;
    private BigDecimal numericValue;
}