package com.buygreen.service;


import com.buygreen.dto.OrderRequest;
import com.buygreen.model.Coupon;
import com.buygreen.model.Order;
import com.buygreen.model.OrderItem;
import com.buygreen.repository.CartRepository;
import com.buygreen.repository.OrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private CustomerService customerService;
    
    @Autowired
    private CouponService couponService;

    @Transactional
    public Order placeOrder(OrderRequest orderRequest) {
        Order order = new Order();
        order.setCustomerId(orderRequest.getCustomerId());
        
        // Apply coupon discount if provided
        BigDecimal finalAmount = orderRequest.getTotalAmount();
        if (orderRequest.getCouponCode() != null && !orderRequest.getCouponCode().trim().isEmpty()) {
            try {
                Coupon coupon = couponService.applyCoupon(orderRequest.getCouponCode(), orderRequest.getTotalAmount());
                BigDecimal discount = coupon.calculateDiscount(orderRequest.getTotalAmount());
                finalAmount = orderRequest.getTotalAmount().subtract(discount);
                order.setCouponCode(coupon.getCode());
                order.setDiscountAmount(discount);
            } catch (Exception e) {
                // If coupon application fails, proceed without discount
                System.err.println("Failed to apply coupon: " + e.getMessage());
            }
        }
        
        order.setTotalAmount(finalAmount);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(Order.OrderStatus.PENDING);
        if (orderRequest.getShippingAddress() != null) {
            order.setShippingAddress(orderRequest.getShippingAddress());
        }
        if (orderRequest.getLocation() != null) {
            order.setLocation(orderRequest.getLocation());
        }
        if (orderRequest.getStreet() != null) {
            order.setStreet(orderRequest.getStreet());
        }
        if (orderRequest.getCity() != null) {
            order.setCity(orderRequest.getCity());
        }
        if (orderRequest.getState() != null) {
            order.setState(orderRequest.getState());
        }
        if (orderRequest.getCountry() != null) {
            order.setCountry(orderRequest.getCountry());
        }
        if (orderRequest.getPincode() != null) {
            order.setPincode(orderRequest.getPincode());
        }

        List<OrderRequest.OrderItemRequest> requestedItems = orderRequest.getItems();
        if (requestedItems == null || requestedItems.isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        // Convert cart items → order items
        List<OrderItem> orderItems = requestedItems.stream().map(item -> {
            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(item.getProductId());
            orderItem.setProductName(item.getProductName());
            orderItem.setPrice(item.getPrice());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setOrder(order);
            return orderItem;
        }).collect(Collectors.toList());

        order.setItems(orderItems);
        Order savedOrder = orderRepository.save(order);

        // Clear cart after successful order
        cartRepository.deleteByCustomerId(orderRequest.getCustomerId());

        // Send order confirmation email
        try {
            var customer = customerService.getCustomerById(orderRequest.getCustomerId());
            if (customer != null && customer.getEmail() != null) {
                emailService.sendOrderConfirmationEmail(
                    customer.getEmail(),
                    savedOrder,
                    customer.getName()
                );
            }
        } catch (Exception e) {
            // Log error but don't fail the order placement
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }

        return savedOrder;
    }
    public List<Order> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public Page<Order> getAllOrders(Pageable pageable) {
        //this will find all orders and sort them by date, newest first.
        return orderRepository.findAllByOrderByOrderDateDesc(pageable);
    }

    public boolean hasCustomerPurchasedProduct(Long customerId, Long productId) {
        return orderRepository.hasCustomerPurchasedProduct(customerId, productId);
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        Order.OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);
        
        // Generate tracking number when order is shipped
        if (newStatus == Order.OrderStatus.SHIPPED && order.getTrackingNumber() == null) {
            order.setTrackingNumber("TRK" + String.format("%08d", orderId));
        }
        
        Order updatedOrder = orderRepository.save(order);
        
        // Send email notification if status changed
        if (oldStatus != newStatus) {
            try {
                var customer = customerService.getCustomerById(order.getCustomerId());
                if (customer != null && customer.getEmail() != null) {
                    emailService.sendOrderStatusUpdateEmail(
                        customer.getEmail(),
                        updatedOrder,
                        customer.getName()
                    );
                }
            } catch (Exception e) {
                // Log error but don't fail the status update
                System.err.println("Failed to send order status update email: " + e.getMessage());
            }
        }
        
        return updatedOrder;
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
    }

}
