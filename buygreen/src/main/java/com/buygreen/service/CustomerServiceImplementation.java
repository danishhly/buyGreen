package com.buygreen.service;

import com.buygreen.model.Customers;
import com.buygreen.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class CustomerServiceImplementation implements CustomerService, UserDetailsService {

    @Autowired
    private CustomerRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Customers customer = repo.findByEmail(username);
        if(customer == null) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }
        return customer;
    }

    @Override
    public String addCustomer(Customers customer) {
        if (repo.findByEmail(customer.getEmail()) != null) {
            return "fail";
        }

        //Hash the password
        //get the plain text password and encode it before saving
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));
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
            customer.setPassword(passwordEncoder.encode("GOOGLE_USER_NO_PASSWORD"));
            return repo.save(customer);
        }

        // if customer exist
        return customer;
    }
}
