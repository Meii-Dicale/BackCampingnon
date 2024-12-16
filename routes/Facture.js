const express = require('express');
const router = express.Router();
const db = require('../config/bdd'); 



router.get('/factures/:factureId', (req, res) => {
  const { factureId } = req.params; // On récupère factureId depuis les paramètres de la route
  if (!factureId) {
    return res.status(400).json({ message: "Aucun ID de facture fourni." });
  }

  // Logique pour récupérer la facture en fonction de factureId
  const query = `SELECT * FROM factures WHERE id = ?`;
  db.query(query, [factureId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Erreur du serveur." });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Facture non trouvée." });
    }
    res.status(200).json(result[0]);
  });
});

router.get('/factures/utilisateur/:utilisateurId', (req, res) => {
  const { utilisateurId } = req.params; // On récupère utilisateurId depuis les paramètres de la route
  if (!utilisateurId) {
    return res.status(400).json({ message: "Aucun ID d'utilisateur fourni." });
  }

  const query = `SELECT * FROM factures WHERE utilisateur_id = ?`;
  db.query(query, [utilisateurId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Erreur du serveur." });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Aucune facture trouvée pour cet utilisateur." });
    }
    res.status(200).json(result);
  });
});



// Route pour récupérer les factures par ID utilisateur
router.get('/utilisateur/:utilisateurId', (req, res) => {
  const utilisateurId = req.params.utilisateurId;

  // Requête SQL pour récupérer les factures associées à un utilisateur
  const query = `
    SELECT 
      f.id AS factureId, 
      f.date_facture, 
      f.total, 
      u.nom, 
      u.prenom, 
      u.rue, 
      u.codePostal, 
      u.ville, 
      u.pays 
    FROM 
      factures AS f 
    JOIN 
      utilisateur AS u 
    ON 
      f.utilisateur_id = u.idUtilisateur 
    WHERE 
      u.idUtilisateur = ?;
  `;

  db.query(query, [utilisateurId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des factures :", err);
      return res.status(500).json({ message: "Erreur du serveur." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Aucune facture trouvée pour cet utilisateur." });
    }

    res.status(200).json(results);
  });
});

// Route pour récupérer une facture par son ID
router.get('/utilisateur/:utilisateurId', (req, res) => {
  const utilisateurId = req.params.utilisateurId;
  console.log('Requête pour utilisateurId :', utilisateurId);

  const query = `
    SELECT 
      f.id, 
      f.date_facture, 
      f.total, 
      u.nom, 
      u.prenom, 
      u.rue, 
      u.codePostal, 
      u.ville, 
      u.pays 
    FROM 
      factures AS f 
    JOIN 
      utilisateur AS u 
    ON 
      f.utilisateur_id = u.idUtilisateur 
    WHERE 
      u.idUtilisateur = ?;
  `;

  db.query(query, [utilisateurId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des factures :', err);
      return res.status(500).json({ message: 'Erreur du serveur.' });
    }

    console.log('Résultats pour utilisateurId :', utilisateurId, results);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Aucune facture trouvée pour cet utilisateur.' });
    }

    res.status(200).json(results);
  });
});
module.exports = router;