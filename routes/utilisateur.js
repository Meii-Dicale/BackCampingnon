const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const connexion = require('../config/bdd');
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

// Récupération par son ID
router.get('/:id', authenticateToken, (req, res) => {
  const idUtilisateur = req.params.id;

  const query = 'SELECT * FROM utilisateur WHERE idUtilisateur = ?';

  connexion.query(query, [idUtilisateur], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération de l'utilisateur:", err);
      return res
        .status(500)
        .json({ message: "Erreur de récupération de l'utilisateur" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(results[0]);
  });
});

// recuperation des utilisateurs
router.get('/AllInformationUtilisateur', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM utilisateur';
  connexion.query(query, (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return res
        .status(500)
        .json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
    res.json(results);
  });
});

// Ajouter un utilisateur
router.post('/AjoutUtilisateur', async (req, res) => {
  const {
    nom,
    prenom,
    mail,
    mdp,
    role,
    rue,
    codePostal,
    ville,
    pays,
    tel,
    dateNaissance,
  } = req.body;
  const securedPassword = await bcrypt.hash(mdp, 10);
  // on vérifi d'abord si le mail existe déjà
  const queryExisteMail = 'SELECT * FROM utilisateur WHERE mail =?';
  connexion.query(queryExisteMail, [mail], (err, resultExisteMail) => {
    if (err) throw err;
    if (resultExisteMail.length > 0) {
      return res.status(400).json({ message: 'Cet email existe déjà.' });
    } else {
      // Vérification basique des champs requis
      if (!nom || !prenom || !mail || !mdp || !role) {
        return res.status(400).json({
          message:
            'Les champs nom, prenom, mail, mdp et role sont obligatoires.',
        });
      }

      // Requête SQL pour insérer l'utilisateur
      const query = `
        INSERT INTO utilisateur (nom, prenom, mail, mdp, role, rue, codePostal, ville, pays, tel, dateNaissance)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
      const values = [
        nom,
        prenom,
        mail,
        securedPassword,
        role,
        rue,
        codePostal,
        ville,
        pays,
        tel,
        dateNaissance,
      ];

      connexion.query(query, values, (error, results) => {
        if (error) {
          console.error("Erreur lors de l'ajout de l'utilisateur:", error);
          return res
            .status(500)
            .json({ message: "Erreur lors de l'ajout de l'utilisateur." });
        }

        // Répondre avec un message de succès
        res.status(201).json({
          message: 'Utilisateur ajouté avec succès.',
          id: results.insertId, // Retourner l'ID généré pour l'utilisateur
        });
      });
    }
  });
});

// suppression utilisateur

router.delete('/utilisateur/:id', (req, res) => {
  const { id } = req.params; // Récupérer l'ID de l'utilisateur à partir des paramètres de l'URL

  const query = 'DELETE FROM utilisateur WHERE idUtilisateur = ?'; // La requête SQL

  // Exécution de la requête avec l'ID fourni
  connexion.query(query, [id], (error, results) => {
    if (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      return res
        .status(500)
        .json({ message: "Erreur lors de la suppression de l'utilisateur" });
    }

    // Vérifier si l'utilisateur a bien été supprimé
    if (results.affectedRows > 0) {
      return res
        .status(200)
        .json({ message: 'Utilisateur supprimé avec succès' });
    } else {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  });
});

router.put('/utilisateur/:id', authenticateToken, async (req, res) => {
  const { id } = req.params; // Récupérer l'ID de l'utilisateur à partir des paramètres de l'URL
  const {
    nom,
    prenom,
    rue,
    codePostal,
    ville,
    pays,
    tel,
    mail,
    dateNaissance,
    mdp,
    role,
  } = req.body; // Récupérer les nouvelles valeurs depuis le corps de la requête
  const securedPassword = await bcrypt.hash(mdp, 10);
  const query = `
        UPDATE utilisateur 
        SET 
            nom = ?, 
            prenom = ?, 
            rue = ?, 
            codePostal = ?, 
            ville = ?, 
            pays = ?, 
            tel = ?, 
            mail = ?, 
            dateNaissance = ?, 
            mdp = ?, 
            role = ?
        WHERE idUtilisateur = ?`; // La requête SQL pour mettre à jour les informations

  // Exécution de la requête avec les nouvelles valeurs et l'ID
  connexion.query(
    query,
    [
      nom,
      prenom,
      rue,
      codePostal,
      ville,
      pays,
      tel,
      mail,
      dateNaissance,
      securedPassword,
      role,
      id,
    ],
    (error, results) => {
      if (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
        return res
          .status(500)
          .json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
      }

      // Vérifier si la mise à jour a affecté des lignes
      if (results.affectedRows > 0) {
        return res
          .status(200)
          .json({ message: 'Utilisateur mis à jour avec succès' });
      } else {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
    }
  );
});

module.exports = router;
