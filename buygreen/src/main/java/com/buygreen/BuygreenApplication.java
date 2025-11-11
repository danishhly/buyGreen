package com.buygreen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class BuygreenApplication {

	public static void main(String[] args) {
		SpringApplication.run(BuygreenApplication.class, args);
	}

}
