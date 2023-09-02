
const express = require('express');
require("dotenv").config();
const cors = require('cors');
const app = express();
// Enable CORS for all routes
app.use(cors());
const {graphqlHttp}=require("express-graphql");



//Rest API endPoints

const indexRouter = require('./routes/rest/index');
const neo4jRouter = require('./routes/rest/neo4j');
const stressTestingRouter = require('./routes/rest/stressTesting');


app.use('/', indexRouter);
app.use("/neo4j", neo4jRouter);
app.use("/stressTesting", stressTestingRouter);



//Graphql endPoints
// app.use('/graphql', graphqlHttp({
//     // schema: require("./graphql/schema"),
//     // rootValue: require("./graphql/resolvers"),
//     // graphiql: process.env.NODE_ENV === "development",
// }));





//app listen 
const port =process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server is running on port ${port} `);
});

// Enable CORS for a specific origin
app.use(cors({
    origin: 'http://localhost:3000',
  }));

module.exports = app;
