# Jeu d'Échecs en Ligne

Ce projet est une implémentation complète d'un jeu d'échecs jouable dans le navigateur. Il a été développé entièrement en **HTML, CSS et JavaScript**, sans aucune librairie externe ni serveur backend.

Le code est structuré selon les principes de la **Programmation Orientée Objet (POO)**.


## Fonctionnalités

* **Règles Complètes :** Gestion des déplacements valides pour toutes les pièces (Pion, Tour, Cavalier, Fou, Dame, Roi).
* **Sécurité du Roi :** Détection des clouages, interdiction de mettre son propre roi en échec.
* **Conditions de Victoire :** Détection automatique de l'**Échec** et de l'**Échec et Mat**.
* **Promotion du Pion :** Une fenêtre modale apparaît lorsqu'un pion atteint la dernière rangée pour choisir sa transformation (Dame, Tour, Fou, Cavalier).
* **Interface Intuitive :**
    * Support du **Glisser-Déposer (Drag & Drop)**.
    * Support du **Click-to-Move** (Sélectionner puis déplacer).
    * Mise en surbrillance des coups possibles (Aides visuelles).
* **Suivi de la partie :**
    * Historique des coups (Notation algébrique).
    * Affichage des pièces capturées pour chaque joueur.

## Technologies Utilisées

* **HTML5 :** Structure sémantique du plateau et des panneaux.
* **CSS3 :** Mise en page (Grid/Flexbox), design réactif et animations.
* **JavaScript (ES6+) :** Logique du jeu, manipulation du DOM et gestion des événements.
    * Utilisation de **Classes** pour chaque type de pièce (`Pawn`, `Rook`, `King`, etc.) héritant d'une classe mère `Piece`.
    * Classe `ChessGame` pour gérer l'état global et le moteur de jeu.

## Installation et Lancement

Ce projet ne nécessite **aucune installation** (pas de `npm`, pas de serveur).

**Ouvrir le jeu :**
    * Naviguez dans le dossier du projet.
    * Double-cliquez sur le fichier `index.html`.
    * Le jeu se lance directement dans votre navigateur par défaut.

## Comment Jouer

1.  **Les Blancs commencent.**
2.  **Déplacer une pièce :**
    * Soit en la faisant glisser vers la case désirée.
    * Soit en cliquant dessus (elle s'illumine en jaune et des points verts indiquent les destinations), puis en cliquant sur la case cible.
3.  **Capturer :** Déplacez votre pièce sur une case occupée par l'adversaire. La pièce mangée apparaît dans le panneau latéral.
4.  **Fin de partie :** Une alerte s'affiche en cas d'Échec et Mat ou de Pat (Match nul).

## Structure du Projet

```text
/ChessGame
│
├── index.html      # Structure de la page et conteneurs
├── style.css       # Styles du plateau, des pièces et des animations
├── script.js       # Logique du jeu (Classes POO et Moteur)
└── README.md       # Documentation du projet
