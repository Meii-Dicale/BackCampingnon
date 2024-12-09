const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');

// récupérer la liste des promos
router.get('/toutes/', (req, res) => {
  console.log('GET /api/Promotions/toutes/'); // log de la requête sur la console
  bdd.query('SELECT * FROM promotion', (error, results) => {
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

// récupérer les promos correspondant  un idEmplacement
router.get('/parEmplacement/:idEmplacement?', (req, res) => {
  // le point d'interrogation est ajouté pour le cas d'un idEmplacement vide
  let sqlQuery = 'SELECT * FROM promotion WHERE idEmplacement =?'; // requête SQL
  const id =
    req.params.idEmplacement === undefined ? null : req.params.idEmplacement; // valeur du paramètre, si idEmplacement est vide, alors on utilise null pour la requête SQL.
  if (id === null) {
    sqlQuery = 'SELECT * FROM promotion WHERE idEmplacement IS NULL'; // requête spécifique pour le cas où l'id demandé est null
  }
  console.log(sqlQuery, id);
  bdd.query(sqlQuery, id, (error, results) => {
    if (error) {
      console.error(
        "Erreur lors de la récupération des promotions pour l'emplacement :",
        id
      );
      res.status(500).send(error.message); // 'terrible désillusion!'
    }
    if (results.length === 0) {
      res.status(404).send('Aucune promotion trouvée pour cet emplacement'); // 'pas trouvé!'
    }
    res.json(results); // on renvoie un objet contenant la promotion correspondante
  });
});

// récupérer une promo d'après son id
router.get('/:idPromo', (req, res) => {
  const sqlQuery = 'SELECT * FROM promotion WHERE idPromotion =?'; // requête SQL
  const id = req.params.idPromo; // valeur du paramètre
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
  const { idService, idEmplacement, typePromo, contrainte } = req.body;
  const sqlQuery =
    'INSERT INTO promotion ( idService, idEmplacement, typePromo, contrainte) VALUES (?,?,?,?)'; // requête SQL
  const values = [idService, idEmplacement, typePromo, contrainte]; // valeurs pour la requête SQL
  values.forEach((value, index) => {
    if (value === undefined) {
      values[index] = null;
    }
  }); // si une valeur est undefined, on la met à null pour la requête SQL.
  console.log(sqlQuery, values); // log de la requête sur la console pour vérification.
  bdd.query(sqlQuery, values, (error, results) => {
    if (error) {
      console.error("Erreur lors de l'ajout de la promotion :", error.message);
      res.status(500).send(error.message); // 'terrible désillusion!'
    }
    res.status(200).send('Promotion ajoutée avec succès'); // 'créé!'
  });
});
// modifier une promo
router.patch('/:idPromo', (req, res) => {});
// supprimer une promo
router.delete('/:idPromo', (req, res) => {});
module.exports = router;
