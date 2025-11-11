package com.buygreen.service;

import com.buygreen.model.Customers;
import com.buygreen.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class CustomerServiceImplementation implements CustomerService, UserDetailsService {

    @Autowired
    private CustomerRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private EmailService emailService;

    @Override
    public String createPasswordResetToken(String email) {
        Customers customer = repo.findByEmail(email);
        if (customer == null) {
            System.out.println("Password reset attempt for non-existant email: " + email);
            return "success";
        }

        String token = UUID.randomUUID().toString();
        customer.setResetToken(token);
        customer.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        repo.save(customer);

        //send the email
        emailService.sendPasswordResetEmail(customer.getEmail(), token);
        return "Success";
    }

    @Override
    public boolean resetPassword(String token, String newPassword) {
        //find the user by the reset token
        Customers customer = repo.findByResetToken(token);
        //Check if token is valid and not expired
        if (customer == null || customer.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return false;
        }
        //Token is valid! update the password
        customer.setPassword(passwordEncoder.encode(newPassword));

        //Invalidate the token
        customer.setResetToken(null);
        customer.setResetTokenExpiry(null);
        repo.save(customer);
        return true;
    }

    @Override
    public Page<Customers> getAllCustomers(Pageable pageable) {
        return repo.findAll(pageable);
    }

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
        
        // FIX: Set the registration date on creation
        customer.setRegistrationDate(LocalDateTime.now());
        
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
            // FIX: Set the registration date on creation
            customer.setRegistrationDate(LocalDateTime.now());
            return repo.save(customer);
        }

        // if customer exist
        return customer;
    }

    @Override
    public boolean changePassword(String email, String oldPassword, String newPassword) {
        Customers customer = repo.findByEmail(email);
        if (customer == null) {
            return false;
        }

        if(passwordEncoder.matches(oldPassword, customer.getPassword())) {
            customer.setPassword(passwordEncoder.encode(newPassword));
            repo.save(customer);
            return true;
        }
        return false;
    }

    @Override
    public Customers updateProfile(String email, Customers updatedCustomer) {
        Customers customer = repo.findByEmail(email);
        if (customer == null) {
            return null;
        }

        // Update only allowed fields (name, phone, address)
        // Email and password should be updated through separate endpoints
        if (updatedCustomer.getName() != null && !updatedCustomer.getName().trim().isEmpty()) {
            customer.setName(updatedCustomer.getName());
        }
        if (updatedCustomer.getPhone() != null) {
            customer.setPhone(updatedCustomer.getPhone());
        }
        if (updatedCustomer.getAddress() != null) {
            customer.setAddress(updatedCustomer.getAddress());
        }

        return repo.save(customer);
    }

    @Override
    public Customers getCustomerById(Long id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public void deleteCustomer(Long id) {
        repo.deleteById(id);
    }

    @Override
    public boolean changeEmail(String currentEmail, String newEmail, String password) {
        Customers customer = repo.findByEmail(currentEmail);
        if (customer == null) {
            return false;
        }

        // Verify password
        if (!passwordEncoder.matches(password, customer.getPassword())) {
            return false;
        }

        // Check if new email already exists
        if (repo.findByEmail(newEmail) != null) {
            return false;
        }

        // Update email
        customer.setEmail(newEmail);
        repo.save(customer);
        return true;
    }

}
