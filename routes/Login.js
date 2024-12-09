const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const bdd = require("../config/bdd");
const jwt = require("jsonwebtoken");





router.post('/loginUser', async (req, res) => {
    try {
        console.log(req.body);
        const { mail, mdp } = req.body;
        // Vérification si les champs sont remplis
        if (!mail || !mdp) {
            return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis" });
        }
        const getUserQuery = "SELECT * FROM utilisateur WHERE mail = ?";
        bdd.query(getUserQuery, [mail], async (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: "Erreur interne du serveur" });
            }
            if (result.length === 0) {
                // Aucun utilisateur trouvé 
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }
            const user = result[0];
            const match = await bcrypt.compare(mdp, user.mdp);

            if (match) {
                // Connexion réussie

                // Créer un payload pour le JWT
                const payload = {
                    id: user.idUser,
                    nom: user.nom,
                    prenom: user.prenom,
                    role: user.role,
                   
                    
                };

                // Générer le JWT
                const token = jwt.sign(payload, 'SECRET_KEY', { expiresIn: '2h' });

                // Répondre avec le token JWT
                return res.status(200).json({ message: "Connexion réussie", token });
                
            } else {
                // Mot de passe incorrect
                return res.status(401).json({ message: "Mot de passe incorrect" });
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
});


module.exports = router