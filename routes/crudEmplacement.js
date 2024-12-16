const express = require("express");
const router = express.Router();
const bdd = require('../config/bdd');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config(); 
const SECRET_KEY = process.env.SECRET_KEY ;
const multer = require('multer');

////////////////////////////////////////////////////////////////////////
// L'authentication//
////////////////////////////////////////////////////////////////////////

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  console.log('token' +token);
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  try {
      const decoded = jwt.verify(token, SECRET_KEY)  ;
      req.user = decoded; // Stocke les données du token dans req.user
      next();
  } catch (err) {
      res.status(403).json({ error: 'Token invalide' });
      console.error(err);
  }
};

////////////////////////////////////////////////////////////////////////

// Route pour ajouter un emplacement
router.post('/add', authenticateToken, (req, res) => {
  console.log('post /api/emplacement', req.body); // on log les données reçues de la requête POST
  const { numero, type, tarif, description } = req.body; // on récupère les données du corps de la requête
  if (!numero || !type || !tarif || !description) {
    return res.status(400).send('Tous les champs sont requis'); // renvoie une erreur 400 si tous les champs ne sont pas remplis
  }
  const valeurs = [
    parseInt(numero),
    type.trim(),
    parseFloat(tarif),
    description.trim(),
  ]; // on vérifie que les elements envoyés soient dans les bon formats pour la requête SQL
  const sqlQuery =
    'INSERT INTO emplacement (numero, type, tarif, description) VALUES (?,?,?,?)';
  bdd.query(sqlQuery, valeurs, (error, results) => {
    if (error) {
      console.error("erreur lors de la création de l'emplacement", error); // 'terrible désillusion!'
      return results
        .status(500)
        .json({ message: "Erreur lors de la création de l'emplacement" });
    }
    res.status(200).send({
      message: 'Emplacement créé avec succès',
    });
  } );
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
  console.log('GET /api/emplacement/:id'); // log de la requête sur la console
  const { id } = req.params; // on récupère l'id(Emplacement) de l'emplacement dans l'URL
  bdd.query(
    'SELECT * FROM emplacement WHERE idEmplacement =?',
    [id],
    (error, results) => {
      if (error) {
        console.error(
          "Erreur lors de la récupération de l'emplacement :",
          error.message
        );
        res.status(500).send(error.message); // 'terrible désillusion!'
      }
      if (results.length === 0) {
        // si aucun enregistrement n'a été trouvé on remonte une erreur 404 'non trouvé'
        return res.status(404).send('Emplacement non trouvé');
      }
      res.json(results[0]); // on renvoie un objet contenant l'emplacement correspondant
    }
  );
});

// Configuration du stockage pour multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `../Frontcampingnon/src/assets/${idEmplacement}`); // Dossier où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post('/upload/:idEmplacement', upload.single('file'), (req, res) => {
  const idEmplacement = req.params.idEmplacement;
  const filePath = req.file ? req.file.path.replace(/\\/g, '/') : null;

  if (!filePath) {
    return res.status(400).json({ error: 'Aucun fichier fourni.' });
  }

  const sql = `INSERT INTO photoEmplacement (idEmplacement, chemin) VALUES (?, ?)`;
  db.query(sql, [idEmplacement, filePath], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'insertion dans la base de données :', err);
      return res.status(500).json({ error: 'Erreur lors de l\'insertion dans la base de données.' });
    }

    res.status(200).json({ message: 'Photo téléchargée avec succès.', chemin: filePath });
  });
});

module.exports = router;
