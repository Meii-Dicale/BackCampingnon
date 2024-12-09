const express = require("express");
const app = express();
const routeUtilisateur = require("./routes/utilisateur");
const CrudContact = require("./routes/CrudContact");
const CrudReservation = require("./routes/CrudReservation");
const crudEmplacement = require('./routes/crudEmplacement');
const loginroute = require("./routes/login");

app.use(express.json());

app.use("/api/utilisateur", routeUtilisateur);
app.use('/api/emplacement', crudEmplacement);
app.use("/api/contact", CrudContact);
app.use("/api/reservations", CrudReservation);
app.use("/api/login" , loginroute);

const PORT = 3001;

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
