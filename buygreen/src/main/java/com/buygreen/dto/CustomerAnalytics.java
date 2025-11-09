package com.buygreen.dto;

import java.math.BigDecimal;
import java.util.Map;

public class CustomerAnalytics {
    private Long totalCustomers;
    private Long activeCustomers; // Customers who have placed at least one order
    private Long newCustomersLast30Days;
    private BigDecimal averageOrderValuePerCustomer;
    private Map<String, Long> customersByRegistrationDate; // Last 30 days
    private Long totalOrders;
    private BigDecimal totalRevenue;

    public Long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(Long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public Long getActiveCustomers() {
        return activeCustomers;
    }

    public void setActiveCustomers(Long activeCustomers) {
        this.activeCustomers = activeCustomers;
    }

    public Long getNewCustomersLast30Days() {
        return newCustomersLast30Days;
    }

    public void setNewCustomersLast30Days(Long newCustomersLast30Days) {
        this.newCustomersLast30Days = newCustomersLast30Days;
    }

    public BigDecimal getAverageOrderValuePerCustomer() {
        return averageOrderValuePerCustomer;
    }

    public void setAverageOrderValuePerCustomer(BigDecimal averageOrderValuePerCustomer) {
        this.averageOrderValuePerCustomer = averageOrderValuePerCustomer;
    }

    public Map<String, Long> getCustomersByRegistrationDate() {
        return customersByRegistrationDate;
    }

    public void setCustomersByRegistrationDate(Map<String, Long> customersByRegistrationDate) {
        this.customersByRegistrationDate = customersByRegistrationDate;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
}

