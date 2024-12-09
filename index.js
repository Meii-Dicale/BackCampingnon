const express = require('express');
const app = express();




app.use(express.json());

app.use('/api/contact', );



app.listen(3001), () => {
    console.log('Server is running on port 3001');
};