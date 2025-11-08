package com.buygreen.service;

import com.buygreen.model.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private static final String FROM_EMAIL = "creative.in47@gmail.com"; // Must match your 'spring.mail.username'

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
        message.setFrom(FROM_EMAIL);

        mailSender.send(message);
    }

    public void sendOrderConfirmationEmail(String toEmail, Order order, String customerName) {
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

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body.toString());
        message.setFrom(FROM_EMAIL);

        mailSender.send(message);
    }

    public void sendOrderStatusUpdateEmail(String toEmail, Order order, String customerName) {
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

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body.toString());
        message.setFrom(FROM_EMAIL);

        mailSender.send(message);
    }
}
