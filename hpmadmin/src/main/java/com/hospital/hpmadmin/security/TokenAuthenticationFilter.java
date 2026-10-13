package com.hospital.hpmadmin.security;


import com.hospital.hpmadmin.ControllerAdvice.CustomAccessDeniedHandler;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class TokenAuthenticationFilter extends OncePerRequestFilter {

    private final CustomUserDetailsService userDetailsService;
    private final TokenProvider tokenProvider;
    private final PathScopeRegistry pathScopeRegistry;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;
    private final ObjectMapper objectMapper;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    private static final Set<String> OPEN_PATHS = Set.of(
            "/api/v1/auth",
            "/api/v1/auth/**",
            "/actuator/health",
            "/health"
    );

    /**
     * Skip the entire filter for open paths and OPTIONS requests.
     * No JWT validation or scope checking occurs for these requests.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();

        return "OPTIONS".equalsIgnoreCase(request.getMethod())
                || OPEN_PATHS.stream()
                .anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Authenticate the JWT, if supplied.
        String jwt = getJwtFromRequest(request);

        if (jwt != null) {
            try {
                if (!tokenProvider.validateToken(jwt)) {
                    throw new BadCredentialsException(
                            "Invalid or expired JWT"
                    );
                }

                UUID userId = tokenProvider.getUserIdFromToken(jwt);

                UserPrincipal userPrincipal =
                        userDetailsService.loadUserById(userId);

                if (!userPrincipal.isEnabled()) {
                    throw new BadCredentialsException(
                            "User account is disabled"
                    );
                }

                // The token contains the scopes assigned to this user.
                Set<String> scopes =
                        tokenProvider.getScopesFromToken(jwt);

                Set<GrantedAuthority> authorities = scopes.stream()
                        .filter(scope -> scope != null && !scope.isBlank())
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toUnmodifiableSet());

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userPrincipal,
                                null,
                                authorities
                        );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

            } catch (Exception ex) {
                SecurityContextHolder.clearContext();

                log.warn(
                        "JWT authentication failed [corrId: '{}', path: '{}']: {}",
                        MDC.get(AppConstants.CORRELATION_ID),
                        request.getServletPath(),
                        ex.getMessage()
                );

                writeUnauthorized(
                        request,
                        response,
                        "Invalid or expired authentication token"
                );
                return;
            }
        }

        // 2. Require authentication for all non-open requests.
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {

            // SecurityConfig's .anyRequest().authenticated() and
            // AuthenticationEntryPoint will handle the 401 response.
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Find scopes allowed for this request's path and method.
        Set<String> allowedScopes =
                pathScopeRegistry.findAllowedScopes(
                        request.getServletPath(),
                        request.getMethod()
                );

        // 4. Deny requests with no matching policy.
        if (allowedScopes.isEmpty()) {
            deny(
                    request,
                    response,
                    "No route scope policy is configured"
            );
            return;
        }

        // 5. Get the authenticated user's scopes.
        Set<String> userScopes = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        // 6. At least one allowed scope must match.
        boolean permitted = !java.util.Collections.disjoint(
                allowedScopes,
                userScopes
        );

        if (!permitted) {
            deny(request, response, "Required scope is missing");
            return;
        }

        // 7. Log authorized access and continue.
        logSuccess(request);
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7).trim();
            return jwt.isEmpty() ? null : jwt;
        }

        return null;
    }

    private void logSuccess(HttpServletRequest request) {
        log.info(
                "Access Granted [corrId: '{}', userId: '{}', method: '{}', path: '{}']",
                MDC.get(AppConstants.CORRELATION_ID),
                getCurrentUserId(),
                request.getMethod(),
                request.getServletPath()
        );
    }

    private String getCurrentUserId() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null
                && authentication.getPrincipal() instanceof UserPrincipal principal) {
            UUID id = principal.getId();
            return id != null ? id.toString() : "UNKNOWN";
        }

        return "ANONYMOUS";
    }

    private void deny(
            HttpServletRequest request,
            HttpServletResponse response,
            String message)
            throws IOException, ServletException {

        log.warn(
                "Access Denied [corrId: '{}', userId: '{}', method: '{}', path: '{}']: {}",
                MDC.get(AppConstants.CORRELATION_ID),
                getCurrentUserId(),
                request.getMethod(),
                request.getServletPath(),
                message
        );

        customAccessDeniedHandler.handle(
                request,
                response,
                new AccessDeniedException(message)
        );
    }

    private void writeUnauthorized(
            HttpServletRequest request,
            HttpServletResponse response,
            String message) throws IOException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", OffsetDateTime.now(ZoneOffset.UTC).toString());
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("error", "Unauthorized");
        body.put("message", message);
        body.put("path", request.getServletPath());

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}