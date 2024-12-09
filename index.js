const express = require('express');
const app = express();
const CrudContact = require('./routes/CrudContact');
const CrudReservation = require('./routes/CrudReservation');




app.use(express.json());

app.use('/api/contact', CrudContact );
app.use('/api/reservations', CrudReservation);



app.listen(3001, () => {
    console.log('Server is running on port 3001');
});