package com.buygreen.dto;

import java.math.BigDecimal;
import java.util.Map;

public class SalesAnalytics {
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private BigDecimal averageOrderValue;
    private Long totalCustomers;
    private Map<String, Long> ordersByStatus;
    private Map<String, BigDecimal> revenueByStatus;
    private Map<String, Long> ordersByDate; // Last 30 days
    private Map<String, BigDecimal> revenueByDate; // Last 30 days
    private BigDecimal totalDiscounts;
    private Long totalItemsSold;

    // Getters and Setters
    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public BigDecimal getAverageOrderValue() {
        return averageOrderValue;
    }

    public void setAverageOrderValue(BigDecimal averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }

    public Long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(Long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public Map<String, Long> getOrdersByStatus() {
        return ordersByStatus;
    }

    public void setOrdersByStatus(Map<String, Long> ordersByStatus) {
        this.ordersByStatus = ordersByStatus;
    }

    public Map<String, BigDecimal> getRevenueByStatus() {
        return revenueByStatus;
    }

    public void setRevenueByStatus(Map<String, BigDecimal> revenueByStatus) {
        this.revenueByStatus = revenueByStatus;
    }

    public Map<String, Long> getOrdersByDate() {
        return ordersByDate;
    }

    public void setOrdersByDate(Map<String, Long> ordersByDate) {
        this.ordersByDate = ordersByDate;
    }

    public Map<String, BigDecimal> getRevenueByDate() {
        return revenueByDate;
    }

    public void setRevenueByDate(Map<String, BigDecimal> revenueByDate) {
        this.revenueByDate = revenueByDate;
    }

    public BigDecimal getTotalDiscounts() {
        return totalDiscounts;
    }

    public void setTotalDiscounts(BigDecimal totalDiscounts) {
        this.totalDiscounts = totalDiscounts;
    }

    public Long getTotalItemsSold() {
        return totalItemsSold;
    }

    public void setTotalItemsSold(Long totalItemsSold) {
        this.totalItemsSold = totalItemsSold;
    }
}

