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
    typesEmplacement VARCHAR(50) NULL, 
    typePromo VARCHAR(50),
    contrainte INT NULL,
    CONSTRAINT fk_promotion_service FOREIGN KEY (idService) REFERENCES service(idService) ON DELETE SET NULL,
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
ALTER TABLE reservation ADD COLUMN validation BOOLEAN NOT NULL;

-- Création de la table photoEmplacement
CREATE TABLE photoEmplacement (     idPhoto INT PRIMARY KEY AUTO_INCREMENT,     idEmplacement INT NOT NULL,     chemin VARCHAR(255) NOT NULL,     CONSTRAINT fk_photoEmplacement FOREIGN KEY (idEmplacement) REFERENCES emplacement(idEmplacement) ON DELETE CASCADE );

CREATE TABLE factures (
  id int(11) NOT NULL AUTO_INCREMENT,
  utilisateur_id int(11) DEFAULT NULL,
  date_facture datetime DEFAULT NULL,
  total decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY fk_factures_utilisateur (utilisateur_id),
  CONSTRAINT factures_ibfk_1 FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (idUtilisateur)
);

CREATE TABLE articles_factures (
  facture_id int(11) NOT NULL,
  service_id int(11) NOT NULL,
  quantite int(11) DEFAULT NULL,
  prix decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (facture_id,service_id),
  KEY service_id (service_id),
  CONSTRAINT articles_factures_ibfk_1 FOREIGN KEY (facture_id) REFERENCES factures (id),
  CONSTRAINT articles_factures_ibfk_2 FOREIGN KEY (service_id) REFERENCES service (idService)
);

-- Insertion de données de test 

-- Table etatMessage
INSERT INTO etatMessage (libelle) VALUES ('Nouveaux'), ('Archivé');

-- Table contact
INSERT INTO contact (nom, mail, message, idEtatMessage) VALUES 
('Jean Dupont', 'jean.dupont@example.com', 'Bonjour, je voudrais des informations sur le camping.', 1),
('Marie Curie', 'marie.curie@example.com', 'Je souhaite réserver un emplacement.', 2);

-- Table Utilisateur
INSERT INTO Utilisateur (nom, prenom, rue, codePostal, ville, pays, tel, mail, dateNaissance, mdp, role) VALUES 
('Dupont', 'Jean', '123 Rue Principale', 75001, 'Paris', 'France', '0123456789', 'jean.dupont@example.com', '1980-05-15', 'mdp1234', 'client'),
('Curie', 'Marie', '456 Rue de la Paix', 69002, 'Lyon', 'France', '0987654321', 'marie.curie@example.com', '1975-11-07', 'mdp5678', 'client');



-- Table emplacement
INSERT INTO emplacement (numero, type, tarif, description) VALUES 
(1, 'Tente', 15.50, 'Emplacement pour tente, ombragé avec accès à l\'électricité.'),
(2, 'Caravane', 25.00, 'Emplacement pour caravane avec branchements complets.'),
(3, 'Mobil-home', 50.00, 'Mobil-home tout équipé pour 4 personnes.');

-- Table service
INSERT INTO service (libelle, tarif) VALUES 
('Accès piscine', 5.00),
('Wi-Fi', 2.50),
('Location vélo', 10.00);

-- Table serviceAssocie
INSERT INTO serviceAssocie (idEmplacement, idService) VALUES 
(1, 1), (1, 2), (2, 3);

-- Table promotion
INSERT INTO promotion (idService, idEmplacement, typePromo, contrainte) VALUES 
(NULL, 1, 'Réduction', 10),
(1, NULL, 'Offre spéciale Wi-Fi', 2);

-- Table reservation
INSERT INTO reservation (idUtilisateur, idEmplacement, idPromo, dateEntree, dateSortie) VALUES 
(1, 1, 1, '2024-12-15', '2024-12-20'),
(2, 2, NULL, '2024-12-18', '2024-12-25');

-- Table serviceReservation
INSERT INTO serviceReservation (idReservation, idService) VALUES 
(1, 1), (1, 2), (2, 3);
