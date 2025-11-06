package com.buygreen.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String token) {
        String subject = "BuyGreen Password Reset Request";
        // This is the link your frontend will use.
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        String body = "To reset your password, click the link below:\n\n" + resetUrl
                + "\n\nIf you did not request this, please ignore this email.";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom("creative.in47@gmail.com"); // Must match your 'spring.mail.username'

        mailSender.send(message);
    }
}