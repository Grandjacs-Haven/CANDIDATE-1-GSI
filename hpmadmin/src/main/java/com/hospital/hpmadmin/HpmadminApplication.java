package com.hospital.hpmadmin;

import com.hospital.hpmadmin.config.DotenvConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HpmadminApplication {

	public static void main(String[] args) {
		DotenvConfig.load();
		SpringApplication.run(HpmadminApplication.class, args);
	}

}
