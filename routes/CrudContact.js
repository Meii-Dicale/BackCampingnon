const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');
const jwt = require("jsonwebtoken");

////////////////////////////////////////////////////////////////////////
// L'authentication//
////////////////////////////////////////////////////////////////////////

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    console.log('token' +token);
    if (!token) return res.status(401).json({ error: 'Token manquant' });

    try {
        const decoded = jwt.verify(token, 'SECRET_KEY');
        req.user = decoded; // Stocke les données du token dans req.user
        next();
    } catch (err) {
        res.status(403).json({ error: 'Token invalide' });
        console.error(err);
    }
};

////////////////////////////////////////////////////////////////////////


// +---------------+---------+
// | idEtatMessage | libelle |
// +---------------+---------+
// |             1 | Nouveau |
// |             2 | Archive |
// +---------------+---------+


// Route pour récuéperer tout les messages 
router.get ('/AllMessages', authenticateToken, (req, res) => {
    const allMessages = "select * from contact"
    bdd.query(allMessages, (err, result) => {
        if(err) throw err;
        res.json(result);
    })
    })
// route pour récupérer tout les nouveaux messages
router.get ('/NouveauxMessages',authenticateToken, (req, res) => {
    const newMessages = "select * from contact WHERE idEtatMessage = 1"
    bdd.query(newMessages, (err, result) => {
        if(err) throw err;
        res.json(result);
    })
    
})
// route pour récupérer tout les messages archivés 

router.get ('/MessagesArchives',authenticateToken, (req, res) => {
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

router.post ('/Archiver',authenticateToken,(req, res) => {
    const updateMessage = "UPDATE contact SET idEtatMessage = 2 WHERE idContact =?"
    bdd.query(updateMessage, [req.body.idContact], (err, result) => {
        if(err) throw err;
        res.json({message: 'Message archivé avec succès'});
    })})

module.exports = router