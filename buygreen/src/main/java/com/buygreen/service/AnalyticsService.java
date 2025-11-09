package com.buygreen.service;

import com.buygreen.dto.CustomerAnalytics;
import com.buygreen.dto.SalesAnalytics;
import com.buygreen.model.Order;
import com.buygreen.repository.CustomerRepository;
import com.buygreen.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public SalesAnalytics getSalesAnalytics() {
        SalesAnalytics analytics = new SalesAnalytics();

        // Total revenue (excluding cancelled orders)
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        analytics.setTotalRevenue(totalRevenue);

        // Total orders
        Long totalOrders = orderRepository.getTotalOrdersCount();
        if (totalOrders == null) totalOrders = 0L;
        analytics.setTotalOrders(totalOrders);

        // Average order value
        BigDecimal avgOrderValue = totalOrders > 0 
            ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
        analytics.setAverageOrderValue(avgOrderValue);

        // Total customers
        Long totalCustomers = orderRepository.getTotalCustomersCount();
        if (totalCustomers == null) totalCustomers = 0L;
        analytics.setTotalCustomers(totalCustomers);

        // Total discounts
        BigDecimal totalDiscounts = orderRepository.getTotalDiscounts();
        if (totalDiscounts == null) totalDiscounts = BigDecimal.ZERO;
        analytics.setTotalDiscounts(totalDiscounts);

        // Total items sold
        Long totalItemsSold = orderRepository.getTotalItemsSold();
        if (totalItemsSold == null) totalItemsSold = 0L;
        analytics.setTotalItemsSold(totalItemsSold);

        // Orders by status
        Map<String, Long> ordersByStatus = new HashMap<>();
        List<Object[]> statusData = orderRepository.getOrdersByStatus();
        for (Object[] row : statusData) {
            String status = row[0].toString();
            Long count = ((Number) row[1]).longValue();
            ordersByStatus.put(status, count);
        }
        analytics.setOrdersByStatus(ordersByStatus);

        // Revenue by status
        Map<String, BigDecimal> revenueByStatus = new HashMap<>();
        List<Object[]> revenueData = orderRepository.getRevenueByStatus();
        for (Object[] row : revenueData) {
            String status = row[0].toString();
            BigDecimal revenue = (BigDecimal) row[1];
            revenueByStatus.put(status, revenue);
        }
        analytics.setRevenueByStatus(revenueByStatus);

        // Last 30 days data
        LocalDateTime startDate = LocalDateTime.now().minusDays(30);
        
        // Orders by date (last 30 days)
        Map<String, Long> ordersByDate = new HashMap<>();
        List<Object[]> ordersDateData = orderRepository.getOrdersByDate(startDate);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        // Initialize all dates in the last 30 days with 0
        for (int i = 29; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            ordersByDate.put(date.format(formatter), 0L);
        }
        
        // Fill in actual data
        for (Object[] row : ordersDateData) {
            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
            Long count = ((Number) row[1]).longValue();
            ordersByDate.put(date.format(formatter), count);
        }
        analytics.setOrdersByDate(ordersByDate);

        // Revenue by date (last 30 days)
        Map<String, BigDecimal> revenueByDate = new HashMap<>();
        List<Object[]> revenueDateData = orderRepository.getRevenueByDate(startDate);
        
        // Initialize all dates with 0
        for (int i = 29; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            revenueByDate.put(date.format(formatter), BigDecimal.ZERO);
        }
        
        // Fill in actual data
        for (Object[] row : revenueDateData) {
            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
            BigDecimal revenue = (BigDecimal) row[1];
            revenueByDate.put(date.format(formatter), revenue);
        }
        analytics.setRevenueByDate(revenueByDate);

        return analytics;
    }

    public CustomerAnalytics getCustomerAnalytics() {
        CustomerAnalytics analytics = new CustomerAnalytics();

        // Total customers
        Long totalCustomers = customerRepository.count();
        analytics.setTotalCustomers(totalCustomers);

        // Active customers (customers who have placed at least one order)
        Long activeCustomers = orderRepository.getTotalCustomersCount();
        if (activeCustomers == null) activeCustomers = 0L;
        analytics.setActiveCustomers(activeCustomers);

        // New customers in last 30 days (approximation - using total customers)
        // Note: This is a simplified version. In production, you'd want a registrationDate field
        Long newCustomers = 0L; // Placeholder - would need registrationDate field in Customers model
        analytics.setNewCustomersLast30Days(newCustomers);

        // Total orders and revenue
        Long totalOrders = orderRepository.getTotalOrdersCount();
        if (totalOrders == null) totalOrders = 0L;
        analytics.setTotalOrders(totalOrders);

        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        analytics.setTotalRevenue(totalRevenue);

        // Average order value per customer
        BigDecimal avgOrderValue = activeCustomers > 0 
            ? totalRevenue.divide(BigDecimal.valueOf(activeCustomers), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
        analytics.setAverageOrderValuePerCustomer(avgOrderValue);

        // Customers by registration date (last 30 days)
        Map<String, Long> customersByDate = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        // Initialize all dates in the last 30 days with 0
        for (int i = 29; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            customersByDate.put(date.format(formatter), 0L);
        }
        
        // Get actual registration data (if registrationDate field exists)
        // For now, we'll use a simple count approach
        // This would need to be adjusted based on your Customer model
        analytics.setCustomersByRegistrationDate(customersByDate);

        return analytics;
    }
}

