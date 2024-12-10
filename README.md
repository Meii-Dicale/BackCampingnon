-- Création de la base de données
CREATE DATABASE campingnon;

-- Utilisation de la base de données
USE campingnon;

-- Création de la table etatMessage
CREATE TABLE etatMessage (
    idEtatMessage INT PRIMARY KEY AUTO_INCREMENT,
    libelle VARCHAR(50) NOT NULL
);

-- Création de la table contact
CREATE TABLE contact (
    idContact INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL,
    mail VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    idEtatMessage INT,
    CONSTRAINT fk_message FOREIGN KEY (idEtatMessage) REFERENCES etatMessage(idEtatMessage) ON DELETE CASCADE
);

-- Création de la table Utilisateur
CREATE TABLE Utilisateur (
    idUtilisateur INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    rue VARCHAR(50) NOT NULL, 
    codePostal INT(5),
    ville VARCHAR(50) NOT NULL, 
    pays VARCHAR(50) NOT NULL,
    tel VARCHAR(20) NOT NULL, 
    mail VARCHAR(50) NOT NULL, 
    dateNaissance DATE NOT NULL,
    mdp VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- Création de la table emplacement
CREATE TABLE emplacement (
    idEmplacement INT PRIMARY KEY AUTO_INCREMENT, 
    numero INT NOT NULL,
    type VARCHAR(50) NOT NULL, 
    tarif FLOAT NOT NULL,
    description TEXT NOT NULL
);

-- Création de la table service
CREATE TABLE service (
    idService INT PRIMARY KEY AUTO_INCREMENT,
    libelle VARCHAR(50) NOT NULL,
    tarif FLOAT
);

-- Création de la table promotion
CREATE TABLE promotion (
    idPromotion INT PRIMARY KEY AUTO_INCREMENT, 
    idService INT NULL,
    idEmplacement INT NULL, 
    typePromo VARCHAR(50),
    contrainte INT NULL,
    CONSTRAINT fk_promotion_service FOREIGN KEY (idService) REFERENCES service(idService) ON DELETE SET NULL,
    CONSTRAINT fk_promotion_emplacement FOREIGN KEY (idEmplacement) REFERENCES emplacement(idEmplacement) ON DELETE SET NULL
);

-- Création de la table reservation
CREATE TABLE reservation (
    idReservation INT PRIMARY KEY AUTO_INCREMENT,
    idUtilisateur INT NOT NULL,
    idEmplacement INT NOT NULL,
    idPromotion INT,
    dateEntree DATE NOT NULL,
    dateSortie DATE NOT NULL,
    CONSTRAINT fk_reservation_utilisateur FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur(idUtilisateur) ON DELETE CASCADE,
    CONSTRAINT fk_reservation_emplacement FOREIGN KEY (idEmplacement) REFERENCES emplacement(idEmplacement) ON DELETE CASCADE,
    CONSTRAINT fk_reservation_promotion FOREIGN KEY (idPromotion) REFERENCES promotion(idPromotion) ON DELETE CASCADE
);

-- Création de la table serviceAssocie
CREATE TABLE serviceAssocie (
    idEmplacement INT,
    idService INT,
    PRIMARY KEY (idEmplacement, idService),
    CONSTRAINT fk_emplacement FOREIGN KEY (idEmplacement) REFERENCES emplacement(idEmplacement) ON DELETE CASCADE,
    CONSTRAINT fk_service FOREIGN KEY (idService) REFERENCES service(idService) ON DELETE CASCADE
);

-- Création de la table serviceReservation
CREATE TABLE serviceReservation (
    idReservation INT,
    idService INT,
    PRIMARY KEY (idReservation, idService),
    CONSTRAINT fk_serviceReservation_reservation FOREIGN KEY (idReservation) REFERENCES reservation(idReservation) ON DELETE CASCADE,
    CONSTRAINT fk_serviceReservation_service FOREIGN KEY (idService) REFERENCES service(idService) ON DELETE CASCADE
);

ALTER TABLE  service ADD COLUMN stock int null;
