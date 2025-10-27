package com.buygreen.service;

import com.buygreen.model.Customers;

public interface CustomerService {
    String addCustomer(Customers customer);

    Customers getCustomerByEmail(String email);

}
