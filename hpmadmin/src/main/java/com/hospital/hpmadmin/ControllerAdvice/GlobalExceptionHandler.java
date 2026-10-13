package com.hospital.hpmadmin.ControllerAdvice;

import com.hospital.hpmadmin.dto.ApiErrorResponse;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleConflict(ResponseStatusException ex, HttpServletRequest request) {
        return buildResponse(
                ex.getStatusCode(),
                "An account conflict occurred.",
                String.format("The value provided is invalid: %s", ex.getReason()),
                request
        );
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(EntityNotFoundException ex, HttpServletRequest request) {
        return buildResponse(
                HttpStatus.NOT_FOUND,
                "The requested resource was not found.",
                String.format("Resource lookup failed: %s", ex.getMessage()),
                request
        );
    }

    // Handles validation failures (e.g., @Valid DTO check failures) and bad JSON bodies
    @ExceptionHandler({MethodArgumentNotValidException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<ApiErrorResponse> handleBadRequest(Exception ex, HttpServletRequest request) {
        String detail;
        if (ex instanceof MethodArgumentNotValidException target) {
            detail = target.getBindingResult().getFieldErrors().stream()
                    .map(error -> String.format("%s: %s", error.getField(), error.getDefaultMessage()))
                    .collect(Collectors.joining(", "));
        } else {
            detail = "The request body is malformed or contains invalid data types.";
        }

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "We couldn't process your request.",
                String.format("Validation details: %s", detail),
                request
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        return buildResponse(
                HttpStatus.FORBIDDEN,
                "Access Restricted.",
                "You do not have the required permissions to perform this action.",
                request
        );
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingHeader(MissingRequestHeaderException ex, HttpServletRequest request) {
        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Context Information Missing.",
                String.format("The required header '%s' must be provided to continue.", ex.getHeaderName()),
                request
        );
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiErrorResponse> handleRuntime(RuntimeException ex, HttpServletRequest request) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.error("Unhandled Runtime Exception at {} (corrId '{}'): ", request.getRequestURI(), corrId, ex);
        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "A system error occurred.",
                "Please try again later or contact support if the issue persists.",
                request
        );
    }

//    // Handles your custom ResourceNotFoundException if it extends RuntimeException
//    @ExceptionHandler(com.hospital.hpmadmin.exception.ResourceNotFoundException.class)
//    public ResponseEntity<ApiErrorResponse> handleResourceNotFound(RuntimeException ex, HttpServletRequest request) {
//        return buildResponse(
//                HttpStatus.NOT_FOUND,
//                "The requested resource was not found.",
//                String.format("Resource lookup failed: %s", ex.getMessage()),
//                request
//        );
//    }

    private ResponseEntity<ApiErrorResponse> buildResponse(HttpStatusCode status, String message, String details, HttpServletRequest request) {
        String correlationId = MDC.get(AppConstants.CORRELATION_ID);

        ApiErrorResponse error = ApiErrorResponse.builder()
                .status(status.value())
                .message(message)
                .details(details)
                .path(request.getRequestURI())
                .correlationId(correlationId)
                .timestamp(LocalDateTime.now())
                .build();

        return new ResponseEntity<>(error, status);
    }
}