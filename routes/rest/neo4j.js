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


router.get('/products', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (p:Product) RETURN p');
    const products = result.records.map(record => record.get('p').properties);
    res.json(products);
  } finally {
    session.close();
  }
});


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

module.exports = router;