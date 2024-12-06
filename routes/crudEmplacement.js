const express = require('express');
const router = express.Router();
const { query } = require('../bdd');


// Route pour ajouter un emplacement
router.post('/register', async (req, res) => {
    const valeurs = Object.values(req.body); // on récupère les valeurs du corps de la requête
    try {
        valeurs = valeurs.maps((valeur) =>
            valeur.trim() // on trim les espaces en début et fin de chaque valeur
        );
        const userQuery = 'INSERT INTO emplacement (numero, type, tarif, description) VALUES (?,?,?,?)';
        const response = await query(userQuery, valeurs); // exécution de la requête SQL
        res
            .status(201)
            .send({
                message: 'Emplacement créé avec succès',
                idEmplacement: response.insertId
            });
    } catch (error) {
 
    }
});