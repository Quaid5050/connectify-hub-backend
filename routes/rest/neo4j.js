const driver = require("../../config/neo4j-db.js");
const express = require('express');
const router = express.Router();

router.get("/test", async (req, res) => { 
    try {
      res.json({"message": "test page"});
      
    } catch (error) {
        res.sendStatus(403);
    }
})



router.get("/all", async function (req, res) {
    const session = driver.session();
    try {
        const result = await session.run("MATCH (product:Product) WHERE product.id='42' RETURN product");
        const products = result.records.map(record => record.get('product').properties);
        res.json(products);

  } catch (error) {
    res.json(error);
    } finally {
        session.close();
  }
})


//add products
// Function to generate a random word
function generateRandomWord() {
  const adjectives = ['Red', 'Blue', 'Green', 'Small', 'Big', 'Fast', 'Slow', 'Happy', 'Sad'];
  const nouns = ['Apple', 'Banana', 'Car', 'Dog', 'Cat', 'House', 'Book', 'Chair', 'Table'];

  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

  return randomAdjective + ' ' + randomNoun;
}



// Endpoint to add 1000 random product names
router.post('/products', async (req, res) => {
  const session = driver.session();

  try {
    const products = [];
    const queries = [];
    
    // Generate the random product names and build the queries
    for (let i = 0; i < 5000; i++) {
      const productName = generateRandomWord();
      queries.push({ productName });
    }
    
    console.log("loop insertion is completed");

    // Use a single query with UNWIND to create multiple nodes in a batch
    const query = `
      UNWIND $products as productData
      CREATE (p:Product {productName: productData.productName})
      RETURN p
    `;

    const result = await session.run(query, { products: queries });

    // Process the results as needed
    result.records.forEach((record) => {
      products.push(record.get('p').properties);
    });

    res.json({ message: 'Added 5000 random products', products });
  } catch (error) {
    console.error('Error adding random products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    session.close();
  }
});



//get products
router.get('/v2/products', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (p:Product) RETURN p');
    const products = result.records.map(record => record.get('p').properties);
    res.json(products);
  } finally {
    session.close();

  }
});

//get the products with pagination
router.get('/products', async (req, res) => {
  const session = driver.session();

  try {
    // Define default values for page and limit
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    const skip = (page - 1) * limit; // Calculate the number of items to skip

    // Ensure that limit is a non-negative integer
    if (isNaN(limit) || limit < 0) {
      return res.status(400).json({ error: 'Invalid limit parameter' });
    }

    // Use a Cypher query with SKIP and LIMIT for pagination, converting skip and limit to integers
    const result = await session.run(
      'MATCH (p:Product) RETURN p SKIP toInteger($skip) LIMIT toInteger($limit)',
      { skip, limit }
    );

    const products = result.records.map(record => record.get('p').properties);
    res.json(products);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    session.close();
  }
});





// add produts


router.get("/orders", async (req, res) => { 
    const session = driver.session();
    try {
        const result = await session.run('MATCH (n:Order) RETURN n');
        //count the results
        console.log("Total orders are: "+ result.records.length);
        const orders = result.records.map(record => record.get('n').properties);
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.json(error);
    } finally {
        session.close();
    }
})



router.get("/relations", async (req, res) => { 
    const session = driver.session();
    try {
        const result = await session.run('MATCH p=()-[:CONTAINS]->() RETURN p');
        //count the results
        console.log("Total records are : "+ result.records.length);
        const orders = result.records.map(record => record.get('p'));
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.json(error);
    } finally {
        session.close();
    }
})




router.post('/v2/orders', async (req, res) => {
    const { productId, quantity } = req.body;
    const session = driver.session();
    try {
        const result = await session.writeTransaction(async tx => {
            const orderResult = await tx.run(
                'CREATE (o:Order {quantity: $quantity}) RETURN o',
                { quantity }
            );
  
            const order = orderResult.records[0].get('o');
  
            const productResult = await tx.run(
                'MATCH (p:Product {id: $productId}) CREATE (o)-[r:CONTAINS {quantity: $quantity}]->(p) RETURN r',
                { productId, quantity }
            );
  
            const relationship = productResult.records[0].get('r');
  
            return { order, relationship };
        });
  
        const order = result.order.properties;
        const relationship = result.relationship.properties;
  
        res.json({ order, relationship });
    }finally {
        session.close();
      }
    });






router.post('/v2/orders', async (req, res) => {
  const { productId, quantity } = req.body;
  const session = driver.session();
  try {
    const result = await session.run(
      'MATCH (p:Product {id: $productId}) CREATE (o:Order {quantity: $quantity})-[:INCLUDES]->(p) RETURN o',
      { productId, quantity }
    );
    const order = result.records[0].get('o').properties;
    res.json(order);
  } finally {
    session.close();
  }
});




// Search the products 

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Get products with optional search parameter
router.get('/v1/products', async (req, res) => {
  const session = driver.session();
  try {
    let query = 'MATCH (p:Product)';
    const queryParams = {};

    if (req.query.search) {
      const searchRegex = new RegExp(`.*${escapeRegExp(req.query.search)}.*`, 'i');
      query += ' WHERE toLower(p.name) =~ $search';
      queryParams.search = searchRegex.source; // Case-insensitive search
    }

    query += ' RETURN p';

    const result = await session.run(query, queryParams);
    const products = result.records.map((record) => record.get('p').properties);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    session.close();
  }
});



module.exports = router;











module.exports = router;