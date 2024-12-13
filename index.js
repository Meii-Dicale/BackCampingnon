const express = require("express");
const app = express();
const routeUtilisateur = require("./routes/utilisateur");
const CrudContact = require("./routes/CrudContact");
const CrudReservation = require("./routes/CrudReservation");
const crudEmplacement = require('./routes/crudEmplacement');
const loginroute = require("./routes/Login");
const CrudService = require('./routes/CrudServices');
const cors = require('cors');


app.use(cors({
    origin: 'http://localhost:5173', // Autorise uniquement cette origine
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Liste des méthodes autorisées
    allowedHeaders: ['Content-Type', 'Authorization'], // Liste des en-têtes autorisés
  }));
  app.options('*', cors({ 
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
  }));
  
app.use(express.json());

app.use("/api/utilisateur", routeUtilisateur);
app.use('/api/emplacement', crudEmplacement);
app.use("/api/contact", CrudContact);
app.use("/api/reservations", CrudReservation);
app.use("/api/login" , loginroute);
app.use("/api/services", CrudService);

const PORT = 3001;

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
