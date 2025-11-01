package com.buygreen.service;

import com.buygreen.dto.PaymentOrderRequest;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    private final RazorpayClient razorpayClient;
    private final boolean razorpayEnabled;

    public PaymentService(@Value("${razorpay.keyId:}") String keyId,
                          @Value("${razorpay.keySecret:}") String keySecret) {
        if (isBlankOrPlaceholder(keyId, "rzp_test_changeMe") || isBlankOrPlaceholder(keySecret, "changeMe")) {
            this.razorpayClient = null;
            this.razorpayEnabled = false;
        } else {
            try {
                this.razorpayClient = new RazorpayClient(keyId, keySecret);
                this.razorpayEnabled = true;
            } catch (RazorpayException ex) {
                throw new IllegalStateException("Failed to initialize Razorpay client", ex);
            }
        }
    }

    public Map<String, Object> createOrder(PaymentOrderRequest request) throws RazorpayException {
        if (razorpayEnabled) {
            JSONObject options = new JSONObject();
            options.put("amount", convertToPaise(request.getAmount()));
            options.put("currency", Optional.ofNullable(request.getCurrency()).orElse("INR"));
            options.put("payment_capture", 1);

            if (request.getReceipt() != null && !request.getReceipt().isBlank()) {
                options.put("receipt", request.getReceipt());
            }

            Order order = razorpayClient.orders.create(options);
            Map<String, Object> payload = new HashMap<>();
            payload.put("id", order.get("id"));
            payload.put("amount", ((Number) order.get("amount")).longValue());
            payload.put("currency", order.get("currency"));
            payload.put("status", order.get("status"));
            payload.put("mock", false);
            return payload;
        }

        return createMockOrder(request);
    }

    private long convertToPaise(BigDecimal amount) {
        if (amount == null) {
            throw new IllegalArgumentException("Amount is required to create a Razorpay order");
        }
        BigDecimal paise = amount.multiply(BigDecimal.valueOf(100));
        return paise.setScale(0, RoundingMode.HALF_UP).longValueExact();
    }

    private Map<String, Object> createMockOrder(PaymentOrderRequest request) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", UUID.randomUUID().toString());
        payload.put("amount", convertToPaise(request.getAmount()));
        payload.put("currency", Optional.ofNullable(request.getCurrency()).orElse("INR"));
        payload.put("status", "mock");
        payload.put("mock", true);
        return payload;
    }

    private boolean isBlankOrPlaceholder(String value, String placeholder) {
        return value == null || value.isBlank() || value.equalsIgnoreCase(placeholder);
    }
}
