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
    const newMessages = "select * from contact WHERE idEtat = 1"
    bdd.query(newMessages, (err, result) => {
        if(err) throw err;
        res.json(result);
    })
    
})
// route pour récupérer tout les messages archivés 

router.get ('/MessagesArchivés', (req, res) => {
    const archivedMessages = "select * from contact WHERE idEtat = 2"
    bdd.query(archivedMessages, (err, result) => {
        if(err) throw err;
        res.json(result);
    })
})

// route pour créer un message 

router.post ('/Messages', (req, res) => {
    const postMessage = "insert into contact (nom, mail, message, idEtatMessage) values (?,?,?,1)"
    bdd.query(postMessage, [req.body.nom, req.body.mail, req.body.message], (err, result) => {
        if(err) throw err;
        res.json({message: 'Message envoyé avec succès'});

    })})

// passer un message en archivé 

router.post ('postArchive', (req, res) => {
    const updateMessage = "UPDATE contact SET idEtatMessage = 2 WHERE id =?"
    bdd.query(updateMessage, [req.body.id], (err, result) => {
        if(err) throw err;
        res.json({message: 'Message archivé avec succès'});
    })})