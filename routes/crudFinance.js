const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const router = express.Router();
const bdd = require("../config/bdd");
const dotenv = require('dotenv');
dotenv.config(); 
const SECRET_KEY = process.env.SECRET_KEY ;

////////////////////////////////////////////////////////////////////////
// L'authentication//
////////////////////////////////////////////////////////////////////////

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    console.log('token' + token);
    if (!token) return res.status(401).json({ error: 'Token manquant' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Stocke les données du token dans req.user
        next();
    } catch (err) {
        res.status(403).json({ error: 'Token invalide' });
        console.error(err);
    }
};

////////////////////////////////////////////////////////////////////////


// API pour obtenir le nombre total de réservations à une date donnée
router.get('/reservations/:date', authenticateToken, (req, res) => {
  const date = req.params.date;
  const query = `SELECT COUNT(*) as reservations
                 FROM reservation
                 WHERE dateEntree <= ? AND dateSortie >= ?`;
  bdd.query(query, [date, date], (err, results) => {
    if (err) throw err;
    res.json(results[0]);
  });
});

// API pour obtenir le nombre total d'emplacements
router.get('/emplacements',authenticateToken ,(req, res) => {
  const query = 'SELECT COUNT(*) AS Emplacements FROM emplacement';
  bdd.query(query, (err, results) => {
    if (err) throw err;
    res.json(results[0]);
  });
});

// API pour obtenir le motant total des emplacements , le montant total des services associé et des services de reservations à la date du jour 
router.get('/totalDuJour', (req, res) => {
  const today = new Date();
  const query = "SELECT SUM(e.tarif + IFNULL(s.tarif, 0)) AS somme_tarifs FROM reservation r JOIN emplacement e ON r.idEmplacement = e.idEmplacement LEFT JOIN serviceReservation sr ON r.idReservation = sr.idReservation LEFT JOIN service s ON sr.idService = s.idService WHERE r.dateEntree <= CURDATE() AND r.dateSortie >= CURDATE()"

  bdd.query(query, [today, today], (err, results) => {
    if (err) throw err;
    res.json(results[0]);
  });
});
router.get('/totalDeLaSemaine', (req, res) => {
  const query = "SELECT SUM(e.tarif + IFNULL(s.tarif, 0)) AS somme_tarifs FROM reservation r JOIN emplacement e ON r.idEmplacement = e.idEmplacement LEFT JOIN serviceReservation sr ON r.idReservation = sr.idReservation LEFT JOIN service s ON sr.idService = s.idService WHERE YEARWEEK(r.dateEntree, 1) = YEARWEEK(CURDATE(), 1) OR YEARWEEK(r.dateSortie, 1) = YEARWEEK(CURDATE(), 1);"
  
  bdd.query(query, (err, results) => {
    if (err) throw err;
    res.json(results[0]);
  });
});




router.get('/totalDuMois', (req, res) => {

  const query = "SELECT SUM(e.tarif + IFNULL(s.tarif, 0)) AS somme_tarifs FROM reservation r JOIN emplacement e ON r.idEmplacement = e.idEmplacement LEFT JOIN serviceReservation sr ON r.idReservation = sr.idReservation LEFT JOIN service s ON sr.idService = s.idService WHERE MONTH(r.dateEntree) = MONTH(CURDATE()) AND YEAR(r.dateEntree) = YEAR(CURDATE()) OR MONTH(r.dateSortie) = MONTH(CURDATE()) AND YEAR(r.dateSortie) = YEAR(CURDATE());"
  bdd.query(query, (err, results) => {
    if (err) throw err;
    res.json(results[0]);
  });
});



module.exports = router