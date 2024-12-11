const express = require("express");
const router = express.Router();
const bdd = require('../config/bdd');

// Route pour ajouter un emplacement
router.post('/add', async (req, res) => {
  console.log('POST /api/emplacement', req.body);
  try {
    let valeurs = Object.values(req.body).map((valeur) => valeur.trim()); // Trim des espaces
    console.log(valeurs);
    const userQuery = 'INSERT INTO emplacement (numero, type, tarif, description) VALUES (?,?,?,?)';
    const response = await new Promise((resolve, reject) => {
      bdd.query(userQuery, valeurs, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
    res.status(201).send({
      message: 'Emplacement créé avec succès',
      idEmplacement: response.insertId,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'emplacement :", error.message);
    res.status(500).send(error.message);
  }
});

// Route pour mettre à jour un emplacement
router.patch('/:id', async (req, res) => {
  console.log('PATCH /api/emplacement/:id', req.body);
  try {
    const id = req.params.id;
    const champs = Object.keys(req.body).map((champ) => `${champ}=?`).join(', ');
    let valeurs = [...Object.values(req.body), id];
    console.log('Champs:', champs, 'Valeurs:', valeurs);

    const sqlQuery = `UPDATE emplacement SET ${champs} WHERE idEmplacement =?`;
    const response = await new Promise((resolve, reject) => {
      bdd.query(sqlQuery, valeurs, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });

    if (response.affectedRows === 0) {
      return res.status(404).send("Emplacement non trouvé");
    }

    res.status(200).send({
      message: 'Emplacement modifié avec succès.',
    });
  } catch (error) {
    console.error("Erreur lors de la modification de l'emplacement :", error.message);
    res.status(500).send(error.message);
  }
});

// Route pour supprimer un emplacement
router.delete('/:id', async (req, res) => {
  console.log('DELETE /api/emplacement/:id');
  const { id } = req.params;
  const sqlQuery = 'DELETE FROM emplacement WHERE idEmplacement =?';

  try {
    const results = await new Promise((resolve, reject) => {
      bdd.query(sqlQuery, id, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });

    if (results.affectedRows === 0) {
      return res.status(404).send("Emplacement non trouvé");
    }

    res.status(200).send({ message: 'Emplacement supprimé avec succès.' });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'emplacement :", error.message);
    res.status(500).send(error.message);
  }
});

// Route pour récupérer tous les emplacements
router.get('/', async (req, res) => {
  console.log('GET /api/emplacement');
  try {
    const results = await new Promise((resolve, reject) => {
      bdd.query('SELECT * FROM emplacement', (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
    res.json(results);
  } catch (error) {
    console.error("Erreur lors de la récupération des emplacements :", error.message);
    res.status(500).send(error.message);
  }
});

// Route pour récupérer un emplacement par son ID
router.get('/:id', async (req, res) => {
  console.log('GET /api/emplacement/:id');
  const { id } = req.params;

  try {
    const result = await new Promise((resolve, reject) => {
      bdd.query('SELECT * FROM emplacement WHERE idEmplacement =?', [id], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });

    if (result.length === 0) {
      return res.status(404).send('Emplacement non trouvé');
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'emplacement :", error.message);
    res.status(500).send(error.message);
  }
});

module.exports = router;
