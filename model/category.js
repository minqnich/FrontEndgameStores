const BaseSQLModel = require('./baseSQLModel');
//this is category.js
class Category extends BaseSQLModel {
  constructor() {
    super('categories'); 
  }

  async addCategory(categoryData) {
    const query = 'INSERT INTO categories SET ?';
    const categoryId = await this.create(categoryData);
    return categoryId;
  }

  async deleteCategory(categoryId) {
    const rowsAffected = await this.delete(categoryId);
    return rowsAffected;
  }

  async editCategory(categoryId, categoryData) {
    const rowsAffected = await this.update(categoryId, categoryData);
    return rowsAffected;
}

  async findCategoryByName(categoryName) {
    const query = 'SELECT * FROM categories WHERE category_name = ?';
    const results = await this.executeQuery(query, [categoryName]);
    return results;
  }
}

module.exports = new Category();
