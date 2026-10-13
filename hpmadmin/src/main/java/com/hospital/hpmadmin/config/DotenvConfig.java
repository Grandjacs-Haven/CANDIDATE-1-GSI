package com.hospital.hpmadmin.config;

import io.github.cdimascio.dotenv.Dotenv;

public final class DotenvConfig {

    private DotenvConfig() {
    }

    public static void load() {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue())
        );
    }
}