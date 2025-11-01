package com.buygreen.service;


import com.buygreen.dto.OrderRequest;
import com.buygreen.model.Order;
import com.buygreen.model.OrderItem;
import com.buygreen.repository.CartRepository;
import com.buygreen.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Transactional
    public Order placeOrder(OrderRequest orderRequest) {
        Order order = new Order();
        order.setCustomerId(orderRequest.getCustomerId());
        order.setTotalAmount(orderRequest.getTotalAmount());
        order.setOrderDate(LocalDateTime.now());

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

        return savedOrder;
    }
    public List<Order> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }


}
