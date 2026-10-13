package com.hospital.hpmadmin.security;

import com.hospital.hpmadmin.dto.UserPrivilegeResponseDto;
import com.hospital.hpmadmin.security.UserPrincipal;
import com.hospital.hpmadmin.service.UserPrivilegeService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class TokenProvider {

    @Value("${xpro.security.jwt.secret}")
    private String jwtSecret;

    @Value("${xpro.security.jwt.expiration}")
    private long expiration;

    private final UserPrivilegeService userPrivilegeService;

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        UUID userId = userPrincipal.getId();

        // Fetch user privileges via service layer and extract unique scopes as a Set
        Set<String> scopes = userPrivilegeService.getUserPrivileges(userId)
                .stream()
                .map(UserPrivilegeResponseDto::getScope)
                .filter(scope -> scope != null && !scope.isBlank())
                .collect(Collectors.toSet());

        Date now = new Date();

        return Jwts.builder()
                .setSubject(userId.toString())
                .claim("role", userPrincipal.getUserRole().name())
                .claim("status", userPrincipal.getStatus().name())
                .claim("scopes", scopes)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + expiration))
                .setIssuer("HPM")
                .setAudience("hpm-user")
                .signWith(SignatureAlgorithm.HS512, getSigningKey())
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public UUID getUserIdFromToken(String token) {
        Claims claims = extractAllClaims(token);
        return UUID.fromString(claims.getSubject());
    }

    @SuppressWarnings("unchecked")
    public Set<String> getScopesFromToken(String token) {
        Claims claims = extractAllClaims(token);
        List<String> scopeList = claims.get("scopes", List.class);
        return scopeList != null ? Set.copyOf(scopeList) : Set.of();
    }

    public boolean validateToken(String token) {
        try {
            extractAllClaims(token);
            log.info("validated token");
            return true;
        } catch (Exception e) {
            log.error("failed to validate token: {}", e.getMessage());
            return false;
        }
    }

    public long getExpiration(String token) {
        return extractAllClaims(token).getExpiration().getTime();
    }
}