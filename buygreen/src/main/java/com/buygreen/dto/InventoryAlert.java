package com.buygreen.dto;

import java.util.List;

public class InventoryAlert {
    private List<ProductAlert> lowStockProducts;
    private List<ProductAlert> outOfStockProducts;
    private Long totalLowStockCount;
    private Long totalOutOfStockCount;

    public static class ProductAlert {
        private Long id;
        private String name;
        private Integer stockQuantity;
        private String category;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Integer getStockQuantity() {
            return stockQuantity;
        }

        public void setStockQuantity(Integer stockQuantity) {
            this.stockQuantity = stockQuantity;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }
    }

    public List<ProductAlert> getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(List<ProductAlert> lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }

    public List<ProductAlert> getOutOfStockProducts() {
        return outOfStockProducts;
    }

    public void setOutOfStockProducts(List<ProductAlert> outOfStockProducts) {
        this.outOfStockProducts = outOfStockProducts;
    }

    public Long getTotalLowStockCount() {
        return totalLowStockCount;
    }

    public void setTotalLowStockCount(Long totalLowStockCount) {
        this.totalLowStockCount = totalLowStockCount;
    }

    public Long getTotalOutOfStockCount() {
        return totalOutOfStockCount;
    }

    public void setTotalOutOfStockCount(Long totalOutOfStockCount) {
        this.totalOutOfStockCount = totalOutOfStockCount;
    }
}

