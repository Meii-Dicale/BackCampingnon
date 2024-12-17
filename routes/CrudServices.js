const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');
const jwt = require("jsonwebtoken");
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


// créer un service dans la table services

router.post('/creerService', authenticateToken, (req, res) => {
    const createService = "INSERT INTO service (libelle, tarif, stock) VALUES (?,?, ?)"
    bdd.query(createService, [req.body.libelle, req.body.tarif, req.body.stock], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Service créé avec succès' });
    })
})

// modifier un service dans la table services

router.put('/modifierService', authenticateToken, (req, res) => {
    const { libelle, tarif, stock, idService } = req.body;

    // Vérifier que `stock` est cohérent
    if (stock < 0) {
        return res.status(400).json({ message: "Le stock ne peut pas être négatif." });
    }

    const updateService = "UPDATE service SET libelle = ?, tarif = ?, stock = ? WHERE idService = ?";
    bdd.query(updateService, [libelle, tarif, stock, idService], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur lors de la modification du service." });
        }
        res.json({ message: 'Service modifié avec succès' });
    });
});


// récupérer la liste de tout les services 

router.get('/services', (req, res) => {
    const allServices = "SELECT * FROM service"
    bdd.query(allServices, (err, result) => {
        if (err) throw err;
        res.json(result);
    })
})


// récupérer un service spécifique

router.get('/service/:id', (req, res) => {
    const oneService = "SELECT * FROM service WHERE idService =?"
    bdd.query(oneService, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json(result);
    })
})

// supprimer un service spécifique

router.delete('/supprimerService/:id', authenticateToken, (req, res) => {
    const deleteService = "DELETE FROM service WHERE idService =?"
    bdd.query(deleteService, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Service supprimé avec succès' });
    })
})

// récupérer les services réservés à un emplacement 

router.get('/serviceEmplacement/:id', (req, res) => {
    const servicesEmplacement = "SELECT emplacement.idEmplacement, emplacement.numero, emplacement.type, emplacement.tarif, emplacement.description, serviceAssocie.idService, service.libelle, service.tarif FROM emplacement LEFT JOIN serviceAssocie ON emplacement.idEmplacement = serviceAssocie.idEmplacement LEFT JOIN service ON serviceAssocie.idService = service.idService where emplacement.idEmplacement = ?";
    bdd.query(servicesEmplacement, [req.params.id], (err, result) => { // Utilisation de req.params.id
        if (err) throw err;
        res.json(result);
    });
});


// associer un service à un emplacement 

router.post('/associerServiceEmplacement', authenticateToken, (req, res) => {
    const createAssociation = "INSERT INTO serviceAssocie (idEmplacement, idService) VALUES (?,?)"
    const recherche = "select idService from serviceAssocie where idEmplacement= ? and idService=?"

    bdd.query(recherche, [req.body.idEmplacement, req.body.idService], (err, result) => {
        if (err) throw err;
        
        if (result) {
            bdd.query(createAssociation, [req.body.idEmplacement, req.body.idService], (err, result) => {
                if (err) throw err;
                console.log(req.body.idEmplacement, req.body.idService)
                res.json({ message: 'Association créée avec succès' });

            })
        } else {
            res.json({ message: 'Association déjà existante' });
           

        }
    })
})

// supprimer une association service à un emplacement

router.delete('/supprimerAssociationServiceEmplacement/:idEmplacement', authenticateToken, (req, res) => {
    const deleteAssociation = "DELETE FROM serviceAssocie WHERE idEmplacement =? "
    bdd.query(deleteAssociation, [req.params.idEmplacement, req.params.idService], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Association supprimée avec succès' });
        console.log(result)

    })
})

// récupérer les services lié à une réservation

router.get('/servicesReservation/:id', authenticateToken, (req, res) => {
    const servicesReservation = "SELECT service.libelle, service.tarif FROM serviceReservation JOIN service ON serviceReservation.idService = service.idService WHERE serviceReservation.idReservation =?"
    bdd.query(servicesReservation, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json(result);
    })
})

router.get("/photoEmplacement/:id", (req, res) => {
    const photoEmplacement = "SELECT photoEmplacement.idPhoto, photoEmplacement.chemin FROM  photoEmplacement WHERE photoEmplacement.idEmplacement = ?"
    bdd.query(photoEmplacement, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json(result);
    })
})


module.exports = router 