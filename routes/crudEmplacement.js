const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');


// Route pour ajouter un emplacement
router.post('/add', async (req, res) => {
  console.log('post /api/emplacement', req.body); // on log les données reçues de la requête POST
  try {
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
        return res
          .status(500)
          .json({ message: "Erreur lors de la création de l'emplacement" });
      }
      res.status(201).send({
        message: 'Emplacement créé avec succès',
        idEmplacement: results.insertId,
      });
    });
  } catch (error) {
    console.error(
      "erreur lors de la création de l'emplacement :",
      error.message
    ); // 'terrible désillusion !'
    res.status(500).send(error.message);
  }
});

// Route pour la mise à jour d'un emplacement (patch)
router.patch('/:id', async (req, res) => {
  console.log('patch /api/emplacement/:id', req.body);
  try {
    const id = req.params.id; // on récupère l'id(Emplacement) de l'emplacement dans l'URL
    console.log('id :', id);
    const champs = Object.keys(req.body) // on récupère les id du corps de la requête
      .map((champ) => `${champ}=?`) // on récupère les noms qu'on 'variabilise' en listant par un mapping
      .join(', '); // on les sépare par une virgule pour avoir le format de la requete SQL
    console.log('champs: ', champs);
    let valeurs = Object.values(req.body); // on récupère les valeurs du corps de la requête
    valeurs.push(id); // on ajoute l'id(Emplacement) à la liste des valeurs
    console.log('valeurs: ', valeurs);
    const sqlQuery = `UPDATE emplacement SET ${champs} WHERE idEmplacement =?`;
    const response = await new Promise((resolve, reject) => {
      bdd.query(sqlQuery, valeurs, (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    }); // exécution de la requête SQL
    if (response.affectedRows === 0) {
      // si aucun enregistrement n'a été modifié on remonte une erreur 404 'non trouvé'
      return res.status(404).send('Emplacement non trouvé');
    }
    res // si tout s'est bien passé on renvoi une confirmation 200 avec un message de confirmation et l'id de l'emplacement modifié
      .status(200)
      .send({
        message: 'Emplacement modifié avec succès.',
        id: response.insertId,
      });
  } catch (error) {
    console.error(
      "Erreur lors de la modification de l'emplacement :",
      error.message
    ); // 'terrible désillusion!'
    res.status(500).send(error.message);
  }
});

// Route pour la suppression d'un emplacement (delete)
router.delete('/:id', async (req, res) => {
  console.log('DELETE /api/emplacement/:id'); // log de la requête sur la console
  const { id } = req.params; // on récupère l'id(Emplacement) de l'emplacement dans l'URL
  const sqlQuery = 'DELETE FROM emplacement WHERE idEmplacement =?'; // on crée la requête SQL
  try {
    const results = await new Promise((resolve, reject) => {
      bdd.query(sqlQuery, id, (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    }); // exécution de la requête SQL
    if (results.affectedRows === 0) {
      // si aucun enregistrement n'a été supprimé on remonte une erreur 404 'non trouvé'
      return res.status(404).send('emplacement non trouvé');
    }
    res.status(200).send({ message: 'Emplacement supprimé avec succès.' }); // si tout s'est bien passé on renvoi une confirmation 200 avec un message de confirmation
  } catch (error) {
    console.error(
      // si pas de 404 ni 200 alors message d'erreur dans la console
      "Erreur lors de la suppression de l'emplacement :",
      error.message
    );
    res.status(500).send(error.message); // 'terrible désillusion!'
  }
});

// Route pour récupérer tous les emplacements
router.get('/', async (req, res) => {
  console.log('GET /api/emplacement'); // log de la requête sur la console
  try {
    const results = await new Promise((resolve, reject) => {
      bdd.query('SELECT * FROM emplacement', (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      }); // exécution de la requête SQL
    });
    res.json(results); // on renvoie un objet contenant l'ensemble des emplacements
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des emplacements :',
      error.message
    );
    res.status(500).send(error.message); // 'terrible désillusion!'
  }
});

// Route pour récupérer un emplacement par son idEmplacement
router.get('/:id', async (req, res) => {
  console.log('GET /api/emplacement/:id'); // log de la requête sur la console
  try {
    const { id } = req.params; // on récupère l'id(Emplacement) de l'emplacement dans l'URL
    const result = await new Promise((resolve, reject) => {
      bdd.query(
        'SELECT * FROM emplacement WHERE idEmplacement =?',
        [id],
        (error, results) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        }
      );
    }); // exécution de la requête SQL
    if (result.length === 0) {
      // si aucun enregistrement n'a été trouvé on remonte une erreur 404 'non trouvé'
      return res.status(404).send('Emplacement non trouvé');
    }
    res.json(result[0]); // on renvoie un objet contenant l'emplacement correspondant
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'emplacement :",
      error.message
    );
    res.status(500).send(error.message); // 'terrible désillusion!'
  }
});

module.exports = router;
