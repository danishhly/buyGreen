package com.buygreen.service;

import com.buygreen.dto.InventoryAlert;
import com.buygreen.model.Product;
import com.buygreen.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    @Autowired
    private ProductRepository productRepository;

    private static final int LOW_STOCK_THRESHOLD = 10;

    public InventoryAlert getInventoryAlerts() {
        InventoryAlert alert = new InventoryAlert();

        // Get all products
        List<Product> allProducts = productRepository.findAll();

        // Filter low stock products (stock <= 10 and > 0)
        List<InventoryAlert.ProductAlert> lowStock = allProducts.stream()
                .filter(p -> p.getStockQuantity() > 0 && p.getStockQuantity() <= LOW_STOCK_THRESHOLD)
                .map(this::convertToAlert)
                .collect(Collectors.toList());

        // Filter out of stock products (stock = 0)
        List<InventoryAlert.ProductAlert> outOfStock = allProducts.stream()
                .filter(p -> p.getStockQuantity() == 0)
                .map(this::convertToAlert)
                .collect(Collectors.toList());

        alert.setLowStockProducts(lowStock);
        alert.setOutOfStockProducts(outOfStock);
        alert.setTotalLowStockCount((long) lowStock.size());
        alert.setTotalOutOfStockCount((long) outOfStock.size());

        return alert;
    }

    private InventoryAlert.ProductAlert convertToAlert(Product product) {
        InventoryAlert.ProductAlert alert = new InventoryAlert.ProductAlert();
        alert.setId(product.getId());
        alert.setName(product.getName());
        alert.setStockQuantity(product.getStockQuantity());
        alert.setCategory(product.getCategory());
        return alert;
    }
}

