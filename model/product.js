const BaseSQLModel = require('./baseSQLModel');
const pool = require('../config/db');
//this is product.js
class Product extends BaseSQLModel {
  constructor() {
    super('Products');
  }

  async findAllWithCategory() {
    const query = `
      SELECT p.*, c.category_name
      FROM Products p
      INNER JOIN Categories c ON p.category_id = c.id;
    `;
    const results = await this.executeQuery(query);
    return results;
  }

  async addProduct(productData) {
    const query = 'INSERT INTO Products SET ?';
    const productId = await this.create(productData);
    return productId;
  }

  async deleteProduct(productId) {
    const rowsAffected = await this.delete(productId);
    return rowsAffected;
  }

  async editProduct(productId, productData) {
    const rowsAffected = await this.update(productId, productData);
    return rowsAffected;
  }

  async getProductCategory(productId) {
    const product = await this.findById(productId);
    return product ? product.category_id : null;
  }

  async getProductById(productId){
    const product = await this.findById(productId);
    return product
  }


}


module.exports = new Product();
