const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const router = express.Router();
const bdd = require("../config/bdd");
const dotenv = require('dotenv');
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;
const path = require("path");
const multer = require("multer");
const fs = require("fs");

// Configuration de Multer
const upload = multer({
  dest: "./images" // Chemin temporaire pour les fichiers uploadés
});

router.get("/images/:imageName", (req, res) => {
  res.sendFile(path.join(__dirname, "../images/" + req.params.imageName));
});

// Fonction pour uploader une image
router.post('/upload', upload.single("file"), (req, res) => {
  // Vérifier si un fichier a été envoyé
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Extraire l'extension et générer un nouveau nom pour l'image
  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  const newFileName = `${Date.now()}${fileExtension}`;
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, "../images/", newFileName);

  // Vérifier que l'extension est valide
  if (fileExtension === ".png" || fileExtension === ".jpg") {
    // Renommer et déplacer le fichier
    fs.rename(tempPath, targetPath, (err) => {
      if (err) {
        console.error("Error renaming file:", err);
        return res.status(500).json({ error: "File processing error" });
      }

      // Insérer le chemin dans la base de données
      const cheminRelatif = `/images/${newFileName}`;
      const cheminBdd = "INSERT INTO photoEmplacement (idEmplacement, chemin) VALUES (?, ?)";

      bdd.query(cheminBdd, [req.body.idEmplacement, cheminRelatif], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database error" });
        }

        console.log("1 record inserted");
        res.status(200).json({ 
          message: "File uploaded and database updated successfully!", 
          fileName: newFileName 
        });
      });
    });
  } else {
    // Supprimer le fichier temporaire si l'extension n'est pas valide
    fs.unlink(tempPath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return res.status(500).json({ error: "File processing error" });
      }

      res.status(403).json({ error: "Only .png and .jpg files are allowed!" });
    });
  }
});

module.exports = router;
