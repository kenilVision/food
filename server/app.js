require('dotenv').config();
require('./src/config/dbConfig');

const express = require('express');
const cors = require('cors');
const app = express();
const router = require('./src/api');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const port = process.env.PORT || 5050;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded());
app.use('/api', router);


app.listen(port, () => {
    console.log('Server start', port);
});
