const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');

// récupérer la liste des promos
router.get('/toutes/', (req, res) => {
  console.log('GET /api/Promotions/toutes/'); // log de la requête sur la console
  bdd.query('SELECT promotion.idPromotion, promotion.idService, promotion.typePromo, promotion.contrainte, promotion.type, service.libelle FROM promotion JOIN service ON promotion.idService = service.idService', (error, results) => {
    if (error) {
      console.error(
        'Erreur lors de la récupération des promotions :',
        error.message
      );
      res.status(500).send(error.message); // 'terrible désillusion!'
    }
    res.json(results); // on renvoie un objet contenant l'ensemble des emplacements
  }); // exécution de la requête SQL
});

// récupérer les promos correspondant a un idService
router.get('/parService/:idService?', (req, res) => {
  // on ajoute le point d'interrogation pour le cas d'un idService vide
  let sqlQuery = 'SELECT * FROM promotion WHERE idService =?'; // requête SQL
  const id = req.params.idService === undefined ? null : req.params.idService; // valeur du paramètre, si idService est vide, alors on utilise null pour la requête SQL.
  if (id === null) {
    sqlQuery = 'SELECT * FROM promotion WHERE idService IS NULL'; // requête spécifique pour le cas où l'idService demandé est null
  }
  bdd.query(sqlQuery, id, (error, results) => {
    console.log(sqlQuery);
    if (error) {
      console.error(
        "Erreur lors de la récupération des promotions pour l'idService :",
        id
      );
      res.status(500).send(error.message); // 'terrible désillusion!'
    }
    if (results.length === 0) {
      res.status(404).send('Aucune promotion trouvée pour cet idService'); // 'pas trouvé!'
    }
    res.json(results); // on renvoie un objet contenant la promotion correspondante
  });
});

// récupérer une promo d'après son id
router.get('/:idPromotion', (req, res) => {
  const sqlQuery = 'SELECT * FROM promotion WHERE idPromotion =?'; // requête SQL
  const id = req.params.idPromotion; // valeur du paramètre
  bdd.query(sqlQuery, id, (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération de la promotion :', id);
      res.status(500).send(error.message); // 'terrible désillusion!'
    }
    if (results.length === 0) {
      res.status(404).send('Aucune promotion trouvée pour cet id'); // 'pas trouvé!'
    }
    res.json(results); // on renvoie un objet contenant la promotion correspondante
  });
});

// ajouter une nouvelle promo
router.post('/add', (req, res) => {
  const { idService, type, typePromo, contrainte } = req.body;

  // Requête SQL pour vérifier si la promotion existe déjà
  const checkQuery = `
    SELECT * 
    FROM promotion 
    WHERE idService = ? AND type = ? AND typePromo = ? AND contrainte = ?
  `;
  const checkValues = [idService, type, typePromo, contrainte];

  bdd.query(checkQuery, checkValues, (checkError, checkResults) => {
    if (checkError) {
      console.error("Erreur lors de la vérification de l'existence de la promotion :", checkError.message);
      return res.status(500).send(checkError.message);
    }

    if (checkResults.length > 0) {
      // Si une promotion existe déjà
      return res.status(409).send("Cette promotion existe déjà.");
    }

    // Si la promotion n'existe pas, on l'ajoute
    const insertQuery = `
      INSERT INTO promotion (idService, type, typePromo, contrainte) 
      VALUES (?, ?, ?, ?)
    `;
    const insertValues = [idService, type, typePromo, contrainte];
    insertValues.forEach((value, index) => {
      if (value === undefined) {
        insertValues[index] = null;
      }
    });

    bdd.query(insertQuery, insertValues, (insertError, insertResults) => {
      if (insertError) {
        console.error("Erreur lors de l'ajout de la promotion :", insertError.message);
        return res.status(500).send(insertError.message);
      }
      res.status(200).send("Promotion ajoutée avec succès");
    });
  });
});

// modifier une promo
router.patch('/:idPromotion', (req, res) => {
  console.log('patch /api/promotions/:idPromo'); // log de la requête sur la console
  const id = req.params.idPromotion; // on récupère l'id dans l'url
  const champs = Object.keys(req.body) // on récupère les noms de valeurs à modifier de la requête
    .map((champ) => `${champ}=?`) // on récupère les noms qu'on 'variabilise' en listant par un mapping
    .join(', '); // on les sépare par une virgule pour avoir le format de la requete SQL
  let valeurs = Object.values(req.body); // on récupère les valeurs du corps de la requête
  valeurs.push(id); // on ajoute l'id(Emplacement) à la fin de la liste des valeurs
  const sqlQuery = `UPDATE promotion SET ${champs} WHERE idPromotion =?`; // requête SQL
  bdd.query(sqlQuery, valeurs, (error, results) => {
    if (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Erreur lors de la modification de la promotion' });
    }
    if (results.affectedRows === 0) {
      // si aucun enregistrement n'a été modifié on remonte une erreur 404 'non trouvé'
      return res.status(404).send('promo non trouvée');
    }
    res.status(200).send({ message: 'Promo modifiée avec succès.' });
  });
});
// supprimer une promo
router.delete('/:idPromotion', (req, res) => {
  console.log('DELETE /api/promotions/:idPromotion'); // log de la requête sur la console
  const id = req.params.idPromotion; // on récupère l'id dans l'url
  sqlQuery = 'DELETE FROM promotion WHERE idPromotion =?'; // requête SQL
  bdd.query(sqlQuery, id, (error, results) => {
    if (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'echec de suppression de la promotion' });
    }
    if (results.affectedRows === 0) {
      // si aucune promo n'a été supprimée on remonte une erreur 404 'non trouvée'
      return res.status(404).send('promotion non trouvée !');
    }
    res.status(200).send({ message: 'Promotion supprimée avec succès.' }); // si tout s'est bien passé on renvoi une confirmation 200 avec un message de confirmation
  });
});

module.exports = router;
