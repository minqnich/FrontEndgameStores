const BaseSQLModel = require('./baseSQLModel');

class SalesHistory extends BaseSQLModel {
    constructor() {
        super('sales'); 
    }

    async recordSale(saleData) {
        const query = 'INSERT INTO sales SET ?';
        const saleId = await this.create(saleData);
        return saleId;
    }

    async getBillSummary() {
        const query = 'SELECT bill_id, bill_date, SUM(number_of_items * bill_price) AS Total_price FROM sales GROUP BY bill_id, bill_date ORDER BY bill_date DESC';
        const billSummary = await this.executeQuery(query);
        return billSummary;
    }

    async getBestSellers() {
        const query = `SELECT 
                            p.id AS product_id, 
                            p.product_name, 
                            p.product_images, 
                            p.product_sales_count, 
                            SUM(s.number_of_items * s.bill_price) AS total_income 
                       FROM 
                            sales s 
                       JOIN 
                            products p ON s.product_id = p.id 
                       GROUP BY 
                            p.id, p.product_name, p.product_images, p.product_sales_count 
                       ORDER BY 
                            p.product_sales_count DESC 
                       LIMIT 
                            10`;
        const bestSellers = await this.executeQuery(query);
        return bestSellers;
    }
}

module.exports = new SalesHistory();
