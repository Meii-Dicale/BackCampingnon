const express = require('express');
const { format, parseISO } = require('date-fns');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bdd = require('../config/bdd');
const dotenv = require('dotenv');
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

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

// récupérer les réservation

router.get('/AllReservations', authenticateToken, (req, res) => {
  const allReservations = "SELECT reservation.validation, reservation.idReservation, reservation.dateEntree, reservation.dateSortie, Utilisateur.nom, Utilisateur.prenom, Utilisateur.mail, emplacement.numero, emplacement.type, emplacement.tarif as tarifEmplacement, emplacement.description, promotion.typePromo, promotion.contrainte, service.libelle, service.tarif FROM reservation JOIN Utilisateur ON reservation.idUtilisateur = Utilisateur.idUtilisateur JOIN emplacement ON reservation.idEmplacement = emplacement.idEmplacement LEFT JOIN promotion ON reservation.idPromotion = promotion.idPromotion LEFT JOIN serviceReservation ON reservation.idReservation = serviceReservation.idReservation LEFT JOIN service ON serviceReservation.idService = service.idService";
  bdd.query(allReservations, (err, result) => {
    if (err) throw err;
    // Transformation des dates avec date-fns
    const transformedResult = result.map((reservation) => ({
      ...reservation,
      dateEntree: format(
        new Date(reservation.dateEntree),
        "yyyy-MM-dd'T'HH:mmxxx"
      ), // yyyy année sur 4 chiffres, MM mois, dd jour, T séparateur, HH heure, mm minutes, xxx fuseau horaire.
      dateSortie: format(
        new Date(reservation.dateSortie),
        "yyyy-MM-dd'T'HH:mmxxx"
      ),
    }));
    res.json(transformedResult);
  });
});

// Récupérer une reservation en particulier
router.get('/:idReservation', authenticateToken, (req, res) => {
  const allReservations = 'SELECT reservation.validation, reservation.idReservation, reservation.dateEntree, reservation.dateSortie, Utilisateur.nom, Utilisateur.prenom, Utilisateur.mail, emplacement.numero, emplacement.type, emplacement.tarif as tarifEmplacement, emplacement.description, promotion.typePromo, promotion.contrainte, service.libelle, service.tarif FROM reservation JOIN Utilisateur ON reservation.idUtilisateur = Utilisateur.idUtilisateur JOIN emplacement ON reservation.idEmplacement = emplacement.idEmplacement LEFT JOIN promotion ON reservation.idPromotion = promotion.idPromotion LEFT JOIN serviceReservation ON reservation.idReservation = serviceReservation.idReservation LEFT JOIN service ON serviceReservation.idService = service.idService WHERE reservation.idReservation = ?';
  bdd.query(allReservations, [req.params.idReservation], (err, result) => {
    if (err) throw err;
    // Transformation des dates avec date-fns
    const transformedResults = result.map((reservation) => ({
      ...reservation,
      dateEntree: format(
        new Date(reservation.dateEntree),
        "yyyy-MM-dd'T'HH:mmxxx"
      ), // yyyy année sur 4 chiffres, MM mois, dd jour, T séparateur, HH heure, mm minutes, xxx fuseau horaire.
      dateSortie: format(
        new Date(reservation.dateSortie),
        "yyyy-MM-dd'T'HH:mmxxx"
      ),
    }));
    res.json(transformedResults);
  });
});
// Modifier une réservation

router.put('/UpdateReservation', authenticateToken, (req, res) => {
  const updateReservation = 'UPDATE reservation SET dateEntree =?, dateSortie =? WHERE idReservation =?';
  let { dateEntree, dateSortie, idReservation } = req.body;
  // Parse and validate the dates
  dateEntree = parseISO(dateEntree);
  dateSortie = parseISO(dateSortie);
  // Format the dates for SQL
  dateEntree = format(dateEntree, "yyyy-MM-dd'T'HH:mmxxx");
  dateSortie = format(dateSortie, "yyyy-MM-dd'T'HH:mmxxx");

  bdd.query(
    updateReservation,
    [dateEntree, dateSortie, idReservation],
    (err, result) => {
      if (err) throw err;
      res.json({ message: 'Réservation modifiée avec succès' });
    }
  );
});

// Supprimer une réservation

router.delete('/DeleteReservation/:id', authenticateToken, (req, res) => {
  const deleteReservation = 'DELETE FROM reservation WHERE idReservation =?';
  bdd.query(deleteReservation, [req.params.id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Réservation supprimée avec succès' });
  });
});

// Ajouter une réservation

router.post('/AddReservation', authenticateToken, (req, res) => {
    let { dateEntree, dateSortie, idUtilisateur, idEmplacement, idPromotion } = req.body;
// Parse and validate the dates 
dateEntree = parseISO(dateEntree); 
dateSortie = parseISO(dateSortie);
// Format the dates for SQL 
dateEntree = format(dateEntree, "yyyy-MM-dd'T'HH:mmxxx"); 
dateSortie = format(dateSortie, "yyyy-MM-dd'T'HH:mmxxx");
    const addReservation =
    'INSERT INTO reservation (dateEntree, dateSortie, idUtilisateur, idEmplacement, idPromotion) VALUES (?,?,?,?,?)';
  bdd.query(
    addReservation,
    [
      dateEntree,
      dateSortie,
      idUtilisateur,
      idEmplacement,
      idPromotion,
    ],
    (err, result) => {
      if (err) throw err;
      res.json({ message: 'Réservation ajoutée avec succès' });
    }
  );
});

// récupérer les services réservés à une réservation

router.get('/ServicesReservation/:id', authenticateToken, (req, res) => {
  const servicesReservation =
    'SELECT service.libelle, service.tarif FROM serviceReservation JOIN service ON serviceReservation.idService = service.idService WHERE serviceReservation.idReservation =?';
  bdd.query(servicesReservation, [req.params.id], (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Ajouter un service à une réservation

router.post('/AddServiceReservation', authenticateToken, (req, res) => {
  const addServiceReservation =
    'INSERT INTO serviceReservation (idReservation, idService) VALUES (?,?)';
  bdd.query(
    addServiceReservation,
    [req.body.idReservation, req.body.idService],
    (err, result) => {
      if (err) throw err;
      res.json({ message: 'Service ajouté à la réservation avec succès' });
    }
  );
});

// Supprimer un service à une réservation

router.delete('/DeleteServiceReservation', authenticateToken, (req, res) => {
  const data = { idReservation: req.body.idReservation, idService };
  const deleteServiceReservation =
    'DELETE FROM serviceReservation WHERE idReservation =? AND idService =?';
  bdd.query(
    deleteServiceReservation,
    [req.body.idReservation, req.body.idService],
    (err, result) => {
      if (err) throw err;
      res.json({ message: 'Service supprimé de la réservation avec succès' });
    }
  );
});

// Récupérer les promotions en cours

router.get('/PromotionsEnCours', authenticateToken, (req, res) => {
  const promotionsEnCours = 'SELECT * FROM promotion';
  bdd.query(promotionsEnCours, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Récupérer les promotions associées à une réservation

router.get('/PromotionsReservation/:id', authenticateToken, (req, res) => {
  const promotionsReservation =
    'SELECT promotion.typePromo, promotion.contrainte FROM reservation JOIN promotion ON reservation.idPromotion = promotion.idPromotion WHERE reservation.idReservation =?';
  bdd.query(promotionsReservation, [req.params.id], (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Récupérer les réservations associées à un utilisateur

router.get('/ReservationsUtilisateur/:id', authenticateToken, (req, res) => {
  const reservationsUtilisateur =
    'SELECT reservation.idReservation, reservation.dateEntree, reservation.dateSortie, emplacement.numero, emplacement.type, emplacement.tarif, emplacement.description, promotion.typePromo, promotion.contrainte, service.libelle, service.tarif FROM reservation JOIN Utilisateur ON reservation.idUtilisateur = Utilisateur.idUtilisateur JOIN emplacement ON reservation.idEmplacement = emplacement.idEmplacement LEFT JOIN promotion ON reservation.idPromotion = promotion.idPromotion LEFT JOIN serviceReservation ON reservation.idReservation = serviceReservation.idReservation LEFT JOIN service ON serviceReservation.idService = service.idService WHERE Utilisateur.idUtilisateur =?';
  bdd.query(reservationsUtilisateur, [req.params.id], (err, result) => {
    if (err) throw err;
    // Transformation des dates avec date-fns
    const transformedResults = result.map((reservation) => ({
      ...reservation,
      dateEntree: format(
        new Date(reservation.dateEntree),
        "yyyy-MM-dd'T'HH:mmxxx"
      ), // yyyy année sur 4 chiffres, MM mois, dd jour, T séparateur, HH heure, mm minutes, xxx fuseau horaire.
      dateSortie: format(
        new Date(reservation.dateSortie),
        "yyyy-MM-dd'T'HH:mmxxx"
      ),
    }));
    res.json(transformedResults);
  });
});

// Récupérer les réservations associées à un emplacement

router.get('/ReservationsEmplacement/:id', authenticateToken, (req, res) => {
  const reservationsEmplacement =
    'SELECT reservation.idReservation, reservation.dateEntree, reservation.dateSortie, Utilisateur.nom, Utilisateur.prenom, Utilisateur.mail, promotion.typePromo, promotion.contrainte, service.libelle, service.tarif FROM reservation JOIN Utilisateur ON reservation.idUtilisateur = Utilisateur.idUtilisateur JOIN emplacement ON reservation.idEmplacement = emplacement.idEmplacement LEFT JOIN promotion ON reservation.idPromotion = promotion.idPromotion LEFT JOIN serviceReservation ON reservation.idReservation = serviceReservation.idReservation LEFT JOIN service ON serviceReservation.idService = service.idService WHERE emplacement.idEmplacement =?';
  bdd.query(reservationsEmplacement, [req.params.id], (err, result) => {
    if (err) throw err;
    // Transformation des dates avec date-fns
    const transformedResults = result.map((reservation) => ({
      ...reservation,
      dateEntree: format(
        new Date(reservation.dateEntree),
        "yyyy-MM-dd'T'HH:mmxxx"
      ), // yyyy année sur 4 chiffres, MM mois, dd jour, T séparateur, HH heure, mm minutes, xxx fuseau horaire.
      dateSortie: format(
        new Date(reservation.dateSortie),
        "yyyy-MM-dd'T'HH:mmxxx"
      ),
    }));
    res.json(transformedResults);
  });
});

// Valider une reservation

router.put('/ValiderReservation/:id', authenticateToken, (req, res) => {
  const validerReservation =
    'UPDATE reservation SET validation =1 WHERE idReservation =?';
  bdd.query(validerReservation, [req.params.id], (err, result) => {
    console.log(req.params.id);
    if (err) throw err;
    res.json({ message: 'Réservation validée avec succès' });
  });
});

module.exports = router;
