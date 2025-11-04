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

    @Override
    public Customers getCustomerByEmail(String email) {
        return repo.findByEmail(email);

    }

    @Override
    public Customers processGoogleUser(String email, String name) {
        Customers customer = repo.findByEmail(email);

        //if customer doesn't exist, create a new one
        if(customer == null) {
            customer = new Customers();
            customer.setEmail(email);
            customer.setName(name);
            customer.setRole("customer");
            
        }
    }
}
