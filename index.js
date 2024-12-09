const express = require('express');
const app = express();
const crudEmplacement = require('./routes/crudEmplacement');



app.use(express.json());

app.use('/api/Emplacement', crudEmplacement);



app.listen(3001), () => {
    console.log('Server is running on port 3001');
};