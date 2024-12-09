const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');


// +---------------+---------+
// | idEtatMessage | libelle |
// +---------------+---------+
// |             1 | Nouveau |
// |             2 | Archive |
// +---------------+---------+


// Route pour récuéperer tout les messages 
router.get ('/AllMessages', (req, res) => {
    const allMessages = "select * from contact"
    bdd.query(allMessages, (err, result) => {
        if(err) throw err;
        res.json(result);
    })
    })
// route pour récupérer tout les nouveaux messages
router.get ('/NouveauxMessages', (req, res) => {
    const newMessages = "select * from contact WHERE idEtatMessage = 1"
    bdd.query(newMessages, (err, result) => {
        if(err) throw err;
        res.json(result);
    })
    
})
// route pour récupérer tout les messages archivés 

router.get ('/MessagesArchives', (req, res) => {
    const archivedMessages = "select * from contact WHERE idEtatMessage = 2"
    bdd.query(archivedMessages, (err, result) => {
        if(err) throw err;
        res.json(result);
    })
})

// route pour créer un message 

router.post ('/EnvoiMessages', (req, res) => {
    console.log("test")
    const postMessage = "insert into contact (nom, mail, message, idEtatMessage) values (?,?,?,1)"
    bdd.query(postMessage, [req.body.nom, req.body.mail, req.body.message], (err, result) => {
        if(err) throw err;
        res.json({message: 'Message envoyé avec succès'});

    })})

// passer un message en archivé 

router.post ('/Archiver', (req, res) => {
    const updateMessage = "UPDATE contact SET idEtatMessage = 2 WHERE idContact =?"
    bdd.query(updateMessage, [req.body.idContact], (err, result) => {
        if(err) throw err;
        res.json({message: 'Message archivé avec succès'});
    })})

module.exports = router