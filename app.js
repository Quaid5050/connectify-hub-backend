
const express = require('express');
require("dotenv").config();
const app = express();

const {graphqlHttp}=require("express-graphql");



//Rest API endPoints

const indexRouter = require('./routes/rest/index');
const neo4jRouter = require('./routes/rest/neo4j');

app.use('/', indexRouter);
app.use("/neo4j", neo4jRouter);


//Graphql endPoints
app.use('/graphql', graphqlHttp({
    // schema: require("./graphql/schema"),
    // rootValue: require("./graphql/resolvers"),
    // graphiql: process.env.NODE_ENV === "development",
}));





//app listen 
const port =process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server is running on port ${port} `);
});



module.exports = app;
