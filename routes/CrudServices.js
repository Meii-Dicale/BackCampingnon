const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');
const jwt = require("jsonwebtoken");

////////////////////////////////////////////////////////////////////////
// L'authentication//
////////////////////////////////////////////////////////////////////////

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    console.log('token' +token);
    if (!token) return res.status(401).json({ error: 'Token manquant' });

    try {
        const decoded = jwt.verify(token, 'SECRET_KEY');
        req.user = decoded; // Stocke les données du token dans req.user
        next();
    } catch (err) {
        res.status(403).json({ error: 'Token invalide' });
        console.error(err);
    }
};

////////////////////////////////////////////////////////////////////////


// créer un service dans la table services

router.post('/creerService', authenticateToken, (req, res) => {
    const createService = "INSERT INTO services (libelle, tarif, stock) VALUES (?,?, ?)"
    bdd.query(createService, [req.body.libelle, req.body.tarif, req.body.stock ], (err, result) => {
        if(err) throw err;
        res.json({message: 'Service créé avec succès'});
    })
})

// modifier un service dans la table services

router.put('/modifierService', authenticateToken, (req, res) => {
    const updateService = "UPDATE services SET libelle =?, tarif =?, stock =? WHERE idService =?"
    bdd.query(updateService, [req.body.libelle, req.body.tarif, req.body.stock, req.body.idService ], (err, result) => {
        if(err) throw err;
        res.json({message: 'Service modifié avec succès'});
    })
})

// récupérer la liste de tout les services 

router.get('/services', authenticateToken, (req, res) => {
    const allServices = "SELECT * FROM services"
    bdd.query(allServices, (err, result) => {
        if(err) throw err;
        res.json(result);
    })
})


// récupérer un service spécifique

router.get('/service/:id', (req, res) => {
    const oneService = "SELECT * FROM services WHERE idService =?"
    bdd.query(oneService, [req.params.id], (err, result) => {
        if(err) throw err;
        res.json(result);
    })
})

// supprimer un service spécifique

router.delete('/supprimerService/:id', authenticateToken, (req, res) => {
    const deleteService = "DELETE FROM services WHERE idService =?"
    bdd.query(deleteService, [req.params.id], (err, result) => {
        if(err) throw err;
        res.json({message: 'Service supprimé avec succès'});
    })
})

// récupérer les services réservés à un emplacement 

router.get('/servicesEmplacement/:id', (req, res) => {
    const servicesEmplacement = "SELECT service.libelle, service.tarif FROM serviceReservation JOIN service ON serviceReservation.idService = service.idService WHERE serviceReservation.idReservation =?"
    bdd.query(servicesEmplacement, [req.params.id], (err, result) => {
        if(err) throw err;
        res.json(result);
    })
})


// récupérer les services lié à une réservation

router.get('/servicesReservation/:id', (req, res) => {
    const servicesReservation = "SELECT service.libelle, service.tarif FROM serviceReservation JOIN service ON serviceReservation.idService = service.idService WHERE serviceReservation.idReservation =?"
    bdd.query(servicesReservation, [req.params.id], (err, result) => {
        if(err) throw err;
        res.json(result);
    })
})


module.exports = router 