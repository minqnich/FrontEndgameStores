const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const router = express.Router(); 
const Product = require('./model/product');
const connection = require("./config/db");
const ProductRouter = require('./model/product');
const Category = require('./model/category');


app.set('view engine', 'ejs'); // Set view engine to EJS
app.set('views', path.join(__dirname, 'views')); // Set views directory

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// Serve CSS file separately
app.get('/css/:filename', (req, res) => {
    const filename = req.params.filename;
    res.sendFile(path.join(__dirname, 'public', 'css', filename), {
        headers: {
            'Content-Type': 'text/css'
        }
    });
});


// sign up 
app.get('/', (req, res) => {
    res.render('sign_up'); 
});


app.post('/signup', (req, res) => {
    const { email, password, confirmPassword } = req.body;
    console.log('Received form data:', req.body);

    // Check if email, password, and confirmPassword are provided
    if (!email || !password || !confirmPassword) {
        return res.status(400).send('Email, password, and confirmPassword are required');
    }

    // Check if password matches confirmPassword
    if (password !== confirmPassword) {
        return res.status(400).send('Password and Confirm password do not match. Please try again.');
    }

    // Insert user into the database
    const sql = 'INSERT INTO users (email, password, confirmPassword) VALUES (?, ?, ?)';
    connection.query(sql, [email, password, confirmPassword], (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).send('Error executing SQL query: ' + err.message);
        }
        console.log('User saved successfully:', result);
        res.render('login', { message: 'User signed up successfully. Please log in.' }); // Render login page with success message
    });
});


app.get('/categoryManage', async (req, res) => {
    try {
        const categories = await Category.findAll();
        console.log(categories); // Add this line to check the contents of the categories variable

        const products = await Product.findAllWithCategory();
        res.render('admin/categoryManage', { categories, products });
    } catch (error) {
        console.error('Error rendering product category:', error);
        res.status(500).send('Internal Server Error');
    }
});

//login 
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Received login data:', req.body);

    if (!email || !password) {
        return res.status(400).render('login', { error: 'Email and password are required' });
    }

    // ตรวจสอบ email และ password ในฐานข้อมูล
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    connection.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).render('login', { error: 'Error executing SQL query: ' + err.message });
        }

        if (results.length === 0) {
            return res.status(401).render('login', { error: 'Incorrect email or password. Please try again.' });
        }

        // Check if the user is admin
        const user = results[0];
        if (user.email === 'admin' && user.password === 'admin') {
            res.redirect('/categoryManage');
        } else {
            res.redirect('/home'); // Render the user profile page using home.ejs
        }        
    });
});
app.get('/home', (req, res) => {
    // Query to fetch PS5 games from the database
    const query = "SELECT * FROM products WHERE category_id = (SELECT id FROM categories WHERE category_name = 'PS5') LIMIT 5";

    // Execute the query
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching PS5 games: ', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Render the home page with PS5 games data
        res.render('user/home', { ps5Games: results });
    });
});

app.get('/consoles', (req, res) => {
    // Query to fetch PS5 games from the database
    const query = "SELECT * FROM products WHERE category_id = (SELECT id FROM categories WHERE category_name = 'Console')";

    // Execute the query
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching PS5 games: ', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.render('user/consoles', { consoles: results });
    });
});


app.get('/accessories', (req, res) => {
    // Query to fetch PS5 games from the database
    const query = "SELECT * FROM products WHERE category_id = (SELECT id FROM categories WHERE category_name = 'Accessories')";

    // Execute the query
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching Accessories: ', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.render('user/accessories', { accessories: results });
    });
});

app.get('/contact', (req, res) => {
    // Render the consoles page
    res.render('user/contact');
});



app.get('/success', (req, res) => {
    // Render  consoles page
    res.render('user/success');
});

app.get('/games', (req, res) => {
    // Query to fetch PS5 games from the database
    const query = "SELECT * FROM products WHERE category_id = (SELECT id FROM categories WHERE category_name = 'Game')";

    // Execute the query
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching games: ', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.render('user/games', { games: results });
    });
});

app.get('/productDetail/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.render('user/productDetail', { product });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Error fetching product' });
    }
});


app.get('/saleHistory', (req, res) => {
    res.render('admin/saleHistory');
});


// add category section
app.get('/api/categories', (req, res) => {
    const sql = 'SELECT * FROM categories';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Error executing SQL query: ' + err.message });
        }
        const categories = results.map(result => {
            return { id: result.id, category_name: result.category_name };
        });
        res.json(categories); 
    });
});

app.post('/api/addCategory', (req, res) => {
    const { category_name } = req.body; // Get the category name information sent by the user via the request body.
  
    // Add categories to the database
    // Create an SQL statement for adding new category data.
    const sql = 'INSERT INTO categories (category_name) VALUES (?)';
    connection.query(sql, [category_name], (err, result) => {
        // In case of an error adding data
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Error executing SQL query: ' + err.message });
      }
      // In case of adding data successfully
      console.log('Category added successfully:', result);
      res.sendStatus(200); // Returns a 200 OK status to notify the user that the category addition was successful.
    });
});

app.delete('/api/deleteCategory/:id', (req, res) => {
    const categoryId = req.params.id;
    if (!categoryId) {
        console.error('Invalid category ID:', categoryId);
        res.status(400).json({ error: 'Invalid category ID' });
        return;
    }
    connection.query('DELETE FROM categories WHERE id = ?', categoryId, (error, results) => {
        if (error) {
            console.error('Error deleting category:', error);
            res.status(500).json({ error: 'Failed to delete category' });
            return;
        }
        console.log('Category deleted successfully');
        res.sendStatus(200);
    });
});


// Delete a product
app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        // Delete the product from the database
        const deletedProductCount = await Product.delete(productId);
        
        if (deletedProductCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Send a success response
        res.sendStatus(200);
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/updateCategory/:id', (req, res) => {
    const id = req.params.id;
    const newName = req.body.category_name;

    if (!newName || newName.trim() === '') {
      return res.status(400).json({ error: 'Category name cannot be empty' });
    }

    const sql = 'UPDATE categories SET category_name = ? WHERE id = ?';
    connection.query(sql, [newName, id], (err, result) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Error updating category' });
      }
      console.log('Category updated successfully:', result);
      res.sendStatus(200);
    });
});


app.get('/productCategory', async (req, res) => {
    try {
        const categories = await Category.findAll(); 
        const products = await Product.findAllWithCategory(); 
        console.log(categories); 
        console.log(products); 
        res.render('admin/productCategory', { categories, products });
    } catch (error) {
        console.error('Error rendering product category:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/categoryManage', async (req, res) => {
    try {
        const categories = await Category.findAll(); 
        const products = await Product.findAllWithCategory(); 
        console.log(categories); 
        console.log(products); 
        res.render('admin/categoryManage', { categories, products });
    } catch (error) {
        console.error('Error rendering product category:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/api/addProduct', (req, res) => {
    const { productName, productDescription, productImages, productPrice, productPricePromotion, productSalesCount, productCategory } = req.body; // เพิ่ม productCategory ในการรับค่าจาก req.body

    const sql = 'INSERT INTO products (product_name, product_description, product_images, product_price, product_price_promotion, product_sales_count, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)'; // เปลี่ยนชื่อคอลัมน์ product_category เป็น category_id
    connection.query(sql, [productName, productDescription, productImages, productPrice, productPricePromotion, productSalesCount, productCategory], (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Error executing SQL query: ' + err.message });
        }
        console.log('Product added successfully:', result);
        res.sendStatus(200); 
    });
});

app.get('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Update product data
app.put('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    const { productName, productDescription, productImages, productPrice, productPricePromotion, productSalesCount , productCategory} = req.body;

    try {
        // Update the product data in the database
        const sql = 'UPDATE products SET product_name = ?, product_description = ?, product_images = ?, product_price = ?, product_price_promotion = ?, product_sales_count = ?, category_id = ?  WHERE id = ?';
        connection.query(sql, [productName, productDescription, productImages, productPrice, productPricePromotion, productSalesCount, productCategory, productId], (err, result) => {
            if (err) {
                console.error('Error executing SQL query:', err);
                return res.status(500).json({ error: 'Error updating product' });
            }
            console.log('Product updated successfully:', result);
            res.sendStatus(200);
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/add_to_cart/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await Product.getProductById(productId); // Await the promise returned by getProductById function
        if (!product) {
            // If product is not found, send a 404 response
            return res.status(404).json({ error: 'Product not found' });
        }
        // If product is found, send it back as a JSON response
        res.json(product);
    } catch (error) {
        // If there's an error, log it and send a 500 response
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/success', (req, res) => {
    res.redirect('success')
})


module.exports = router;
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
