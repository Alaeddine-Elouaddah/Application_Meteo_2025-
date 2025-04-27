// controllers/sourceMeteoController.js
const SourceMeteo = require("../models/SourceMeteo");

// Ajouter une nouvelle source météo
const ajouterSourceMeteo = async (req, res) => {
  try {
    const { nom, urlApi, cleApi, active } = req.body;
    const nouvelleSource = new SourceMeteo({ nom, urlApi, cleApi, active });
    await nouvelleSource.save();
    res.status(201).json({
      message: "Source météo ajoutée avec succès",
      source: nouvelleSource,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de l'ajout de la source météo", error });
  }
};

// Obtenir toutes les sources météo
const obtenirSourcesMeteo = async (req, res) => {
  try {
    const sources = await SourceMeteo.find();
    res.status(200).json(sources);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des sources météo",
      error,
    });
  }
};

// Désactiver une source météo
const desactiverSourceMeteo = async (req, res) => {
  const { id } = req.params;
  try {
    const source = await SourceMeteo.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );
    if (!source) {
      return res.status(404).json({ message: "Source météo non trouvée" });
    }
    res
      .status(200)
      .json({ message: "Source météo désactivée avec succès", source });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la désactivation de la source météo",
      error,
    });
  }
};

// Activer une source météo
const activerSourceMeteo = async (req, res) => {
  const { id } = req.params;
  try {
    const source = await SourceMeteo.findByIdAndUpdate(
      id,
      { active: true },
      { new: true }
    );
    if (!source) {
      return res.status(404).json({ message: "Source météo non trouvée" });
    }
    res
      .status(200)
      .json({ message: "Source météo activée avec succès", source });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'activation de la source météo",
      error,
    });
  }
};

// Supprimer une source météo
const supprimerSourceMeteo = async (req, res) => {
  const { id } = req.params;
  try {
    const source = await SourceMeteo.findByIdAndDelete(id);
    if (!source) {
      return res.status(404).json({ message: "Source météo non trouvée" });
    }
    res.status(200).json({ message: "Source météo supprimée avec succès" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de la source météo",
      error,
    });
  }
};

module.exports = {
  ajouterSourceMeteo,
  obtenirSourcesMeteo,
  desactiverSourceMeteo,
  activerSourceMeteo,
  supprimerSourceMeteo,
};
