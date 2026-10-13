package com.hospital.hpmadmin.security;


import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

@Slf4j
@Component
public class PathScopeRegistry {

    // Exact path -> rule. Average O(1) lookup.
    private final Map<String, PathRule> exactRules;

    // Wildcard paths such as /api/v1/patients/* and /**.
    private final List<PathRule> patternRules;

    // Retained to print the complete configuration at startup.
    private final List<PathRule> allRules;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public PathScopeRegistry(ObjectMapper objectMapper)
            throws IOException {

        List<PathRule> loadedRules;

        try (InputStream input = new ClassPathResource(
                "routes/paths.json"
        ).getInputStream()) {

            loadedRules = objectMapper.readValue(
                    input,
                    new TypeReference<List<PathRule>>() {}
            );
        }

        if (loadedRules == null) {
            throw new IllegalStateException(
                    "Path scope rules must contain a JSON array."
            );
        }

        Map<String, PathRule> exact = new HashMap<>();
        List<PathRule> patterns = new ArrayList<>();
        Set<String> seenPaths = new HashSet<>();
        List<PathRule> validatedRules = new ArrayList<>();

        for (PathRule rule : loadedRules) {

            if (rule == null
                    || rule.path() == null
                    || rule.path().isBlank()) {
                throw new IllegalStateException(
                        "Every route rule must have a path."
                );
            }

            if (!seenPaths.add(rule.path())) {
                throw new IllegalStateException(
                        "Duplicate path rule: " + rule.path()
                );
            }

            if (rule.scopes() == null || rule.scopes().isEmpty()) {
                throw new IllegalStateException(
                        "No scopes configured for " + rule.path()
                );
            }

            // Normalize scope names and verbs, and validate each rule.
            Map<String, Set<String>> normalizedScopes = new HashMap<>();

            rule.scopes().forEach((scope, configuredVerbs) -> {

                if (scope == null || scope.isBlank()
                        || configuredVerbs == null
                        || configuredVerbs.isEmpty()) {
                    throw new IllegalStateException(
                            "Invalid scope configuration for " + rule.path()
                    );
                }

                Set<String> verbs = new HashSet<>();

                for (String verb : configuredVerbs) {
                    if (verb == null || verb.isBlank()) {
                        throw new IllegalStateException(
                                "Blank HTTP method in " + rule.path()
                        );
                    }

                    verbs.add(verb.trim().toUpperCase(Locale.ROOT));
                }

                normalizedScopes.put(scope.trim(), Set.copyOf(verbs));
            });

            PathRule validatedRule = new PathRule(
                    rule.path(),
                    Map.copyOf(normalizedScopes)
            );

            validatedRules.add(validatedRule);

            if (pathMatcher.isPattern(validatedRule.path())) {
                patterns.add(validatedRule);
            } else {
                exact.put(validatedRule.path(), validatedRule);
            }
        }

        this.exactRules = Map.copyOf(exact);
        this.patternRules = List.copyOf(patterns);
        this.allRules = List.copyOf(validatedRules);

        logAllRules();
    }

    /**
     * JSON structure:
     * {
     *   "path": "/api/v1/patients/*",
     *   "scopes": {
     *     "admin": ["GET", "PUT", "DELETE"],
     *     "rpat": ["GET"],
     *     "upat": ["PUT"]
     *   }
     * }
     */
    public record PathRule(
            String path,
            Map<String, Set<String>> scopes
    ) {}

    private void logAllRules() {

        log.info("==================================================");
        log.info("PATH SCOPE REGISTRY INITIALIZED");
        log.info("Exact paths loaded: {}", exactRules.size());
        log.info("Pattern paths loaded: {}", patternRules.size());
        log.info("Total path rules loaded: {}", allRules.size());
        log.info("==================================================");

        for (int i = 0; i < allRules.size(); i++) {

            PathRule rule = allRules.get(i);

            log.info("[RULE {}] Path: {}", i + 1, rule.path());

            rule.scopes().forEach((scope, verbs) ->
                    log.info(
                            "    Scope: {} | Methods: {}",
                            scope,
                            new TreeSet<>(verbs)
                    )
            );
        }

        log.info("Finished loading path scope rules.");
        log.info("==================================================");
    }

    /**
     * Returns all scopes permitting this path and HTTP method.
     * An empty set means no scope permits the request.
     */
    public Set<String> findAllowedScopes(
            String requestPath,
            String requestMethod) {

        if (requestPath == null || requestMethod == null) {
            return Set.of();
        }

        String method = requestMethod.toUpperCase(Locale.ROOT);

        // First use the fast exact-path lookup.
        PathRule matchedRule = exactRules.get(requestPath);

        // Only use wildcard matching when no exact path exists.
        if (matchedRule == null) {

            matchedRule = patternRules.stream()
                    .filter(rule ->
                            pathMatcher.match(
                                    rule.path(),
                                    requestPath
                            )
                    )
                    .sorted(Comparator.comparing(
                            PathRule::path,
                            pathMatcher.getPatternComparator(requestPath)
                    ))
                    .findFirst()
                    .orElse(null);
        }

        if (matchedRule == null) {
            return Set.of();
        }

        // Use only the selected path rule. Do not fall back to a
        // broader pattern if this rule does not permit the method.
        Set<String> allowedScopes = new LinkedHashSet<>();

        matchedRule.scopes().forEach((scope, verbs) -> {
            if (verbs.contains(method)) {
                allowedScopes.add(scope);
            }
        });

        return Set.copyOf(allowedScopes);
    }
}