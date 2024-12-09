const express = require('express');
const app = express();
const CrudContact = require('./routes/CrudContact');




app.use(express.json());

app.use('/api/contact', CrudContact );



app.listen(3001), () => {
    console.log('Server is running on port 3001');
};