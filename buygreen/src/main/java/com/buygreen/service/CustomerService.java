package com.buygreen.service;

import com.buygreen.model.Customers;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerService {
    String addCustomer(Customers customer);

    Customers getCustomerByEmail(String email);
    Customers processGoogleUser(String email, String name);

    boolean changePassword(String email, String oldPassword, String newPassword);

    String createPasswordResetToken(String email);
    boolean resetPassword(String token, String newPassword);
    Page<Customers> getAllCustomers(Pageable pageable);
}
