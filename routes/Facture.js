const express = require('express');
const router = express.Router();
const db = require('../config/bdd'); 

// Fonction de gestion des erreurs pour éviter la répétition
const handleError = (err, res) => {
  console.error(err);
  return res.status(500).json({ message: "Erreur du serveur." });
};

// Route pour récupérer les factures pour un utilisateur
router.get('/utilisateur/:utilisateurId', (req, res) => {
  const { utilisateurId } = req.params;  // Utiliser le paramètre dans l'URL
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
// Route pour récupérer une facture par son ID
router.get('/facture/:factureId', (req, res) => {
  const { factureId } = req.params; // On récupère factureId depuis les paramètres de la route
  if (!factureId) {
    return res.status(400).json({ message: "Aucun ID de facture fourni." });
  }

  const query = `SELECT * FROM factures WHERE id = ?`;
  db.query(query, [factureId], (err, result) => {
    if (err) return handleError(err, res);
    if (result.length === 0) {
      return res.status(404).json({ message: "Facture non trouvée." });
    }
    res.status(200).json(result[0]); // Retourne la facture spécifique
  });
});

// Route pour récupérer les services associés à une facture
router.get('/facture/:factureId/services', (req, res) => {
  const { factureId } = req.params;
  
  if (!factureId) {
    return res.status(400).json({ message: "Aucun ID de facture fourni." });
  }

  const query = `SELECT * FROM services WHERE facture_id = ?`;
  db.query(query, [factureId], (err, results) => {
    if (err) return handleError(err, res);
    if (results.length === 0) {
      return res.status(404).json({ message: "Aucun service trouvé pour cette facture." });
    }
    res.status(200).json(results); // Retourne les services associés à la facture
  });
});

module.exports = router;