package com.buygreen.service;


import com.buygreen.dto.OrderRequest;
import com.buygreen.model.Coupon;
import com.buygreen.model.Order;
import com.buygreen.model.OrderItem;
import com.buygreen.model.Product;
import com.buygreen.repository.CartRepository;
import com.buygreen.repository.OrderRepository;
import com.buygreen.repository.ProductRepository;
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
    
    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public Order placeOrder(OrderRequest orderRequest) {
        Order order = new Order();
        order.setCustomerId(orderRequest.getCustomerId());
        
        // Apply coupon discount if provided
        BigDecimal finalAmount = orderRequest.getTotalAmount();
        if (orderRequest.getCouponCode() != null && !orderRequest.getCouponCode().trim().isEmpty()) {
            try {
                // FIX: Use validate to check eligibility, then apply to increment usage count
                couponService.validateCoupon(orderRequest.getCouponCode(), orderRequest.getTotalAmount());
                Coupon coupon = couponService.applyCoupon(orderRequest.getCouponCode(), orderRequest.getTotalAmount());
                BigDecimal discount = coupon.calculateDiscount(orderRequest.getTotalAmount());
                finalAmount = orderRequest.getTotalAmount().subtract(discount);
                
                order.setCouponCode(coupon.getCode());
                order.setDiscountAmount(discount);
            } catch (Exception e) {
                // If coupon validation/application fails, reject the order
                throw new IllegalArgumentException("Invalid coupon logic or coupon not found/expired: " + e.getMessage());
            }
        }
        
        order.setTotalAmount(finalAmount); // Set final (discounted) amount
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

        // Convert cart items → order items with validation AND stock update
        List<OrderItem> orderItems = requestedItems.stream().map(item -> {
            // Validate mandatory item fields
            if (item.getProductId() == null) {
                throw new IllegalArgumentException("Product ID is required for all items");
            }
            if (item.getProductName() == null || item.getProductName().trim().isEmpty()) {
                throw new IllegalArgumentException("Product name is required for all items");
            }
            if (item.getPrice() == null || item.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Product price must be greater than zero");
            }
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Product quantity must be greater than zero");
            }
            
            // 2. CRITICAL FIX: Check and reduce stock for each item
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + item.getProductId()));
            int orderedQuantity = item.getQuantity();
            if (product.getStockQuantity() < orderedQuantity) {
                throw new IllegalArgumentException("Not enough stock for product " + product.getName() + 
                                                   ". Only " + product.getStockQuantity() + " available.");
            }
            // Reduce stock
            product.setStockQuantity(product.getStockQuantity() - orderedQuantity);
            productRepository.save(product); // Save updated product stock
            
            // 3. Create OrderItem
            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(item.getProductId());
            orderItem.setProductName(item.getProductName().trim());
            orderItem.setPrice(item.getPrice());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setOrder(order);
            return orderItem;
        }).collect(Collectors.toList());

        order.setItems(orderItems);
        Order savedOrder = orderRepository.save(order);

        // Clear cart after successful order
        cartRepository.deleteByCustomerId(orderRequest.getCustomerId());

        // Send order confirmation email asynchronously (non-blocking)
        try {
            var customer = customerService.getCustomerById(orderRequest.getCustomerId());
            if (customer != null && customer.getEmail() != null) {
                // Email is sent asynchronously, so this won't block order creation
                emailService.sendOrderConfirmationEmail(
                    customer.getEmail(),
                    savedOrder,
                    customer.getName()
                );
            }
        } catch (Exception e) {
            // Log error but don't fail the order placement
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
            e.printStackTrace();
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
        
        // Send email notification if status changed (asynchronously, non-blocking)
        if (oldStatus != newStatus) {
            try {
                var customer = customerService.getCustomerById(order.getCustomerId());
                if (customer != null && customer.getEmail() != null) {
                    // Email is sent asynchronously, so this won't block status update
                    emailService.sendOrderStatusUpdateEmail(
                        customer.getEmail(),
                        updatedOrder,
                        customer.getName()
                    );
                }
            } catch (Exception e) {
                // Log error but don't fail the status update
                System.err.println("Failed to send order status update email: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        return updatedOrder;
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
    }

}
