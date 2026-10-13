package com.hospital.hpmadmin.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "xpro.security")
public class GatewaySecurityProperties {

    private Jwt jwt = new Jwt();

    @Getter
    @Setter
    public static class Jwt {
        private Gateway gateway = new Gateway();
    }

    @Getter
    @Setter
    public static class Gateway {
        private List<String> appDomainRules = new ArrayList<>();
    }

    // Convenience helper method to retrieve domain rules seamlessly
    public List<String> getAllowedDomains() {
        if (jwt != null && jwt.getGateway() != null) {
            return jwt.getGateway().getAppDomainRules();
        }
        return new ArrayList<>();
    }
}