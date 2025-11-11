package com.buygreen.service;

import com.buygreen.model.Order;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.logging.Logger;

@Service
public class EmailService {
    
    private static final Logger logger = Logger.getLogger(EmailService.class.getName());

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.mail.username:}")
    private String fromEmail;
    
    // SendGrid API Key (alternative to SMTP)
    @Value("${sendgrid.api.key:}")
    private String sendGridApiKey;
    
    // Email service mode: "smtp" or "sendgrid" or "auto" (try SMTP first, fallback to SendGrid)
    @Value("${email.service.mode:auto}")
    private String emailServiceMode;
    
    // Check email configuration on startup
    @jakarta.annotation.PostConstruct
    public void init() {
        System.out.println("=== EMAIL SERVICE INITIALIZATION ===");
        System.out.println("Email Service Mode: " + emailServiceMode);
        
        if ("sendgrid".equalsIgnoreCase(emailServiceMode)) {
            System.out.println("Using SendGrid API for emails");
            System.out.println("SendGrid API Key: " + (sendGridApiKey != null && !sendGridApiKey.isEmpty() ? "SET" : "NOT SET"));
            if (sendGridApiKey == null || sendGridApiKey.isEmpty()) {
                System.err.println("WARNING: SendGrid API key not set! Set SENDGRID_API_KEY environment variable.");
            }
        } else {
            System.out.println("Using SMTP for emails (mode: " + emailServiceMode + ")");
            System.out.println("Mail Sender: " + (mailSender != null ? "INITIALIZED" : "NULL"));
            System.out.println("From Email: " + (fromEmail != null && !fromEmail.isEmpty() ? fromEmail : "NOT SET"));
            
            if (mailSender != null && mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
                org.springframework.mail.javamail.JavaMailSenderImpl impl = (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender;
                System.out.println("SMTP Host: " + impl.getHost());
                System.out.println("SMTP Port: " + impl.getPort());
                System.out.println("SMTP Username: " + impl.getUsername());
            }
            
            // If auto mode and SendGrid is available, mention fallback
            if ("auto".equalsIgnoreCase(emailServiceMode) && sendGridApiKey != null && !sendGridApiKey.isEmpty()) {
                System.out.println("SendGrid fallback available if SMTP fails");
            }
        }
        
        System.out.println("Frontend URL: " + frontendUrl);
        System.out.println("====================================");
    }
    
    // Send email using SendGrid API (HTTP, no SMTP ports needed)
    private void sendViaSendGrid(String toEmail, String subject, String body) throws Exception {
        if (sendGridApiKey == null || sendGridApiKey.isEmpty()) {
            throw new IllegalStateException("SendGrid API key is not configured. Set SENDGRID_API_KEY environment variable.");
        }
        
        System.out.println("Sending email via SendGrid API to: " + toEmail);
        Email from = new Email(fromEmail != null && !fromEmail.isEmpty() ? fromEmail : "dnsh.1inn@gmail.com");
        Email to = new Email(toEmail);
        Content content = new Content("text/plain", body);
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            
            System.out.println("SendGrid Response Status: " + response.getStatusCode());
            
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                System.out.println("=== EMAIL SENT SUCCESSFULLY VIA SENDGRID ===");
                logger.info("Email sent successfully via SendGrid to: " + toEmail);
            } else {
                System.err.println("SendGrid API Error: Status " + response.getStatusCode());
                System.err.println("Response Body: " + response.getBody());
                throw new Exception("SendGrid API returned status " + response.getStatusCode() + ": " + response.getBody());
            }
        } catch (Exception ex) {
            System.err.println("SendGrid API Error: " + ex.getMessage());
            logger.severe("Failed to send email via SendGrid: " + ex.getMessage());
            throw ex;
        }
    }
    
    // Send email using SMTP (original method)
    private void sendViaSMTP(String toEmail, String subject, String body) throws Exception {
        if (mailSender == null) {
            throw new IllegalStateException("JavaMailSender is not configured");
        }
        
        System.out.println("Sending email via SMTP to: " + toEmail);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        if (fromEmail != null && !fromEmail.isEmpty()) {
            message.setFrom(fromEmail);
        } else {
            message.setFrom("dnsh.1inn@gmail.com");
        }
        
        mailSender.send(message);
        System.out.println("=== EMAIL SENT SUCCESSFULLY VIA SMTP ===");
    }
    
    // Unified send method that tries SMTP first, falls back to SendGrid if enabled
    private void sendEmail(String toEmail, String subject, String body) throws Exception {
        if ("sendgrid".equalsIgnoreCase(emailServiceMode)) {
            // Use SendGrid only
            sendViaSendGrid(toEmail, subject, body);
        } else if ("smtp".equalsIgnoreCase(emailServiceMode)) {
            // Use SMTP only
            sendViaSMTP(toEmail, subject, body);
        } else {
            // Auto mode: Try SMTP first, fallback to SendGrid
            try {
                sendViaSMTP(toEmail, subject, body);
            } catch (Exception smtpError) {
                System.err.println("SMTP failed, trying SendGrid fallback...");
                System.err.println("SMTP Error: " + smtpError.getMessage());
                
                if (sendGridApiKey != null && !sendGridApiKey.isEmpty()) {
                    try {
                        sendViaSendGrid(toEmail, subject, body);
                        System.out.println("Successfully sent via SendGrid after SMTP failure");
                    } catch (Exception sendGridError) {
                        System.err.println("SendGrid also failed: " + sendGridError.getMessage());
                        throw new Exception("Both SMTP and SendGrid failed. SMTP: " + smtpError.getMessage() + ", SendGrid: " + sendGridError.getMessage());
                    }
                } else {
                    throw smtpError; // No SendGrid fallback available
                }
            }
        }
    }

    @Async("taskExecutor")
    public void sendPasswordResetEmail(String toEmail, String token) {
        try {
            logger.info("Sending password reset email to: " + toEmail);
            String subject = "BuyGreen Password Reset Request";
            String resetUrl = frontendUrl + "/reset-password?token=" + token;
            String body = "To reset your password, click the link below:\n\n" + resetUrl
                    + "\n\nIf you did not request this, please ignore this email.";

            sendEmail(toEmail, subject, body);
            logger.info("Password reset email sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.severe("Failed to send password reset email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    @Async("taskExecutor")
    public void sendOrderConfirmationEmail(String toEmail, Order order, String customerName) {
        try {
            logger.info("Sending order confirmation email to: " + toEmail + " for order #" + order.getId());
            String subject = "Order Confirmation - Order #" + order.getId();
            
            StringBuilder body = new StringBuilder();
            body.append("Dear ").append(customerName).append(",\n\n");
            body.append("Thank you for your order! We're excited to confirm your purchase.\n\n");
            body.append("Order Details:\n");
            body.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
            body.append("Order ID: #").append(order.getId()).append("\n");
            body.append("Order Date: ").append(order.getOrderDate().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm a"))).append("\n");
            body.append("Status: ").append(order.getStatus()).append("\n");
            body.append("Total Amount: ₹").append(order.getTotalAmount()).append("\n\n");
            
            if (order.getShippingAddress() != null && !order.getShippingAddress().isEmpty()) {
                body.append("Shipping Address:\n");
                body.append(order.getShippingAddress()).append("\n\n");
            }
            
            // Build complete address from address fields
            StringBuilder fullAddress = new StringBuilder();
            if (order.getStreet() != null && !order.getStreet().isEmpty()) {
                fullAddress.append(order.getStreet());
            }
            if (order.getCity() != null && !order.getCity().isEmpty()) {
                if (fullAddress.length() > 0) fullAddress.append(", ");
                fullAddress.append(order.getCity());
            }
            if (order.getState() != null && !order.getState().isEmpty()) {
                if (fullAddress.length() > 0) fullAddress.append(", ");
                fullAddress.append(order.getState());
            }
            if (order.getPincode() != null && !order.getPincode().isEmpty()) {
                if (fullAddress.length() > 0) fullAddress.append(" - ");
                fullAddress.append(order.getPincode());
            }
            if (order.getCountry() != null && !order.getCountry().isEmpty()) {
                if (fullAddress.length() > 0) fullAddress.append(", ");
                fullAddress.append(order.getCountry());
            }
            
            if (fullAddress.length() > 0) {
                body.append("Delivery Address:\n");
                body.append(fullAddress.toString()).append("\n\n");
            }
            
            if (order.getLocation() != null && !order.getLocation().isEmpty()) {
                body.append("Location/Landmark:\n");
                body.append(order.getLocation()).append("\n\n");
            }
            
            body.append("Items Ordered:\n");
            if (order.getItems() != null) {
                for (var item : order.getItems()) {
                    body.append("  • ").append(item.getProductName())
                        .append(" (Qty: ").append(item.getQuantity())
                        .append(") - ₹").append(item.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity()))).append("\n");
                }
            }
            
            body.append("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
            body.append("We'll send you another email when your order ships.\n\n");
            body.append("Thank you for choosing buygreen.!\n");
            body.append("If you have any questions, please contact us at dnsh.1inn@gmail.com\n");

            sendEmail(toEmail, subject, body.toString());
            logger.info("Order confirmation email sent successfully to: " + toEmail + " for order #" + order.getId());
        } catch (Exception e) {
            logger.severe("Failed to send order confirmation email to " + toEmail + " for order #" + order.getId() + ": " + e.getMessage());
            e.printStackTrace();
            // Don't throw - email failure shouldn't break order creation
        }
    }

    @Async("taskExecutor")
    public void sendOrderStatusUpdateEmail(String toEmail, Order order, String customerName) {
        try {
            System.out.println("=== EMAIL SERVICE: Starting to send order status update email ===");
            System.out.println("To: " + toEmail);
            System.out.println("Order ID: " + order.getId());
            System.out.println("Status: " + order.getStatus());
            System.out.println("From Email: " + (fromEmail != null ? fromEmail : "NOT SET"));
            System.out.println("Mail Sender: " + (mailSender != null ? "INITIALIZED" : "NULL"));
            
            logger.info("Sending order status update email to: " + toEmail + " for order #" + order.getId() + " with status: " + order.getStatus());
            
            String subject = "Order Update - Order #" + order.getId();
            
            StringBuilder body = new StringBuilder();
            body.append("Dear ").append(customerName).append(",\n\n");
            body.append("Your order status has been updated.\n\n");
            body.append("Order ID: #").append(order.getId()).append("\n");
            body.append("New Status: ").append(order.getStatus()).append("\n\n");
            
            if (order.getStatus() == Order.OrderStatus.SHIPPED && order.getTrackingNumber() != null) {
                body.append("Tracking Number: ").append(order.getTrackingNumber()).append("\n");
                body.append("You can track your order using this tracking number.\n\n");
            }
            
            if (order.getStatus() == Order.OrderStatus.DELIVERED) {
                body.append("Your order has been delivered! We hope you enjoy your purchase.\n\n");
                body.append("Please consider leaving a review for the products you purchased.\n\n");
            }
            
            body.append("Thank you for shopping with buygreen.!\n");
            body.append("If you have any questions, please contact us at dnsh.1inn@gmail.com\n");

            sendEmail(toEmail, subject, body.toString());
            logger.info("Order status update email sent successfully to: " + toEmail + " for order #" + order.getId());
        } catch (Exception e) {
            System.err.println("=== EMAIL SEND FAILED ===");
            System.err.println("Error: " + e.getMessage());
            System.err.println("Error Class: " + e.getClass().getName());
            logger.severe("Failed to send order status update email to " + toEmail + " for order #" + order.getId() + ": " + e.getMessage());
            e.printStackTrace();
            // Don't throw - email failure shouldn't break status update
        }
    }
}
