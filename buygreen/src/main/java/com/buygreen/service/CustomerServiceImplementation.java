package com.buygreen.service;

import com.buygreen.model.Customers;
import com.buygreen.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CustomerServiceImplementation implements CustomerService {

    @Autowired
    private CustomerRepository repo;

    @Override
    public String addCustomer(Customers customer) {
        if (repo.findByEmail(customer.getEmail()) != null) {
            return "fail";
        }
        repo.save(customer);
        return "success";
    }
}
