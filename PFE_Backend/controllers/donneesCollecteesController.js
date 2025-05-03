const DonneesCollectees = require("../models/DonneesCollectees");
const moment = require("moment");

/**
 * @desc    Enregistre des données météorologiques avec vérification des 24h
 * @route   POST /api/donnees
 * @access  Public
 */
exports.enregistrerDonnees = async (req, res) => {
  try {
    const { donnees } = req.body;

    // Validation des données
    if (!donnees || !Array.isArray(donnees)) {
      return res.status(400).json({
        success: false,
        message: "Format de données invalide. Un tableau est requis.",
      });
    }

    // Vérification des doublons et des 24h
    const nouvellesDonnees = [];
    const maintenant = new Date();

    for (const donnee of donnees) {
      // Vérifier si une donnée existe déjà pour cette ville dans les dernières 24h
      const derniereDonnee = await DonneesCollectees.findOne({
        ville: donnee.ville,
        type: donnee.type || "donnee_reelle",
        horodatage: {
          $gte: moment().subtract(24, "hours").toDate(),
          $lte: maintenant,
        },
      }).sort({ horodatage: -1 });

      if (derniereDonnee) {
        console.log(
          `Donnée déjà existante pour ${donnee.ville} dans les dernières 24h`
        );
        continue;
      }

      // Préparation de la nouvelle donnée
      const nouvelleDonnee = {
        ...donnee,
        source: donnee.source || null,
        horodatage: donnee.horodatage
          ? new Date(donnee.horodatage)
          : maintenant,
        type: donnee.type || "donnee_reelle",
        localisation: donnee.localisation || null,
      };

      nouvellesDonnees.push(nouvelleDonnee);
    }

    if (nouvellesDonnees.length === 0) {
      return res.status(200).json({
        success: true,
        message:
          "Aucune nouvelle donnée à enregistrer (données déjà présentes pour les 24 dernières heures)",
      });
    }

    // Validation avec le modèle avant insertion
    const donneesValides = await Promise.all(
      nouvellesDonnees.map(async (donnee) => {
        try {
          const doc = new DonneesCollectees(donnee);
          await doc.validate();
          return doc.toObject();
        } catch (validationError) {
          console.error("Erreur de validation:", validationError);
          return null;
        }
      })
    );

    const donneesAFiltrer = donneesValides.filter((d) => d !== null);

    if (donneesAFiltrer.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucune donnée valide à enregistrer",
      });
    }

    const resultat = await DonneesCollectees.insertMany(donneesAFiltrer);

    res.status(201).json({
      success: true,
      message: `${resultat.length} enregistrements sauvegardés avec succès`,
      donnees: resultat,
    });
  } catch (erreur) {
    console.error("Erreur lors de l'enregistrement :", erreur);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      erreur: erreur.message,
    });
  }
};

/**
 * @desc    Récupère des données pour comparaison avec pagination
 * @route   GET /api/donnees/comparaison
 * @access  Public
 */
exports.obtenirComparaison = async (req, res) => {
  try {
    const { ville, jours = 7, page = 1, limit = 10 } = req.query;

    if (!ville) {
      return res.status(400).json({
        success: false,
        message: "Le paramètre 'ville' est requis",
      });
    }

    const dateLimite = moment().subtract(jours, "days").toDate();

    const [donneesReelles, previsions] = await Promise.all([
      DonneesCollectees.find({
        ville,
        type: "donnee_reelle",
        horodatage: { $gte: dateLimite },
      })
        .sort({ horodatage: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),

      DonneesCollectees.find({
        ville,
        type: "prevision",
        horodatage: { $gte: dateLimite },
      })
        .sort({ horodatage: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
    ]);

    // Calcul des totaux pour la pagination
    const [totalReelles, totalPrevisions] = await Promise.all([
      DonneesCollectees.countDocuments({
        ville,
        type: "donnee_reelle",
        horodatage: { $gte: dateLimite },
      }),
      DonneesCollectees.countDocuments({
        ville,
        type: "prevision",
        horodatage: { $gte: dateLimite },
      }),
    ]);

    // Calcul des écarts
    const comparaison = calculerEcarts(donneesReelles, previsions);

    res.status(200).json({
      success: true,
      ville,
      periode: `${jours} jours`,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalReelles,
        totalPrevisions,
        totalPagesReelles: Math.ceil(totalReelles / limit),
        totalPagesPrevisions: Math.ceil(totalPrevisions / limit),
      },
      donneesReelles,
      previsions,
      comparaison,
    });
  } catch (erreur) {
    console.error("Erreur lors de la récupération :", erreur);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: erreur.message,
    });
  }
};

/**
 * @desc    Fonction utilitaire améliorée pour calculer les écarts
 */
function calculerEcarts(reelles, previsions) {
  // Créer un map pour un accès plus rapide aux prévisions par date
  const previsionMap = new Map();
  previsions.forEach((prev) => {
    const dateKey = moment(prev.horodatage).format("YYYY-MM-DD");
    previsionMap.set(dateKey, prev);
  });

  const resultats = reelles
    .map((reelle) => {
      const dateKey = moment(reelle.horodatage).format("YYYY-MM-DD");
      const prevision = previsionMap.get(dateKey);

      if (!prevision) return null;

      return {
        date: reelle.horodatage,
        temperature: {
          reel: reelle.temperature,
          prevu: prevision.temperature,
          ecart: Math.abs(reelle.temperature - prevision.temperature),
          precision: calculerPrecision(
            reelle.temperature,
            prevision.temperature
          ),
        },
        humidite: {
          reel: reelle.humidite,
          prevu: prevision.humidite,
          ecart: Math.abs(reelle.humidite - prevision.humidite),
          precision: calculerPrecision(reelle.humidite, prevision.humidite),
        },
        vent: {
          reel: reelle.vitesseVent,
          prevu: prevision.vitesseVent,
          ecart: Math.abs(reelle.vitesseVent - prevision.vitesseVent),
          precision: calculerPrecision(
            reelle.vitesseVent,
            prevision.vitesseVent
          ),
        },
      };
    })
    .filter((item) => item !== null);

  // Calcul des moyennes et statistiques
  const stats = {
    temperature: calculerStats(resultats, "temperature"),
    humidite: calculerStats(resultats, "humidite"),
    vent: calculerStats(resultats, "vent"),
  };

  return {
    details: resultats,
    stats,
  };
}

function calculerPrecision(reel, prevu) {
  const ecart = Math.abs(reel - prevu);
  const pourcentage = (ecart / (reel || 1)) * 100;
  return 100 - Math.min(pourcentage, 100);
}

function calculerStats(data, champ) {
  if (data.length === 0) return null;

  const ecarts = data.map((item) => item[champ].ecart);
  const precisions = data.map((item) => item[champ].precision);

  return {
    moyenneEcart: ecarts.reduce((a, b) => a + b, 0) / ecarts.length,
    moyennePrecision: precisions.reduce((a, b) => a + b, 0) / precisions.length,
    maxEcart: Math.max(...ecarts),
    minEcart: Math.min(...ecarts),
    maxPrecision: Math.max(...precisions),
    minPrecision: Math.min(...precisions),
  };
}

/**
 * @desc    Récupère les dernières données pour une ville avec plus de détails
 * @route   GET /api/donnees/derniere/:ville
 * @access  Public
 */
exports.obtenirDerniereDonnee = async (req, res) => {
  try {
    const { ville } = req.params;

    const donnee = await DonneesCollectees.findOne({ ville })
      .sort({ horodatage: -1 })
      .populate("source", "nom description -_id")
      .lean();

    if (!donnee) {
      return res.status(404).json({
        success: false,
        message: `Aucune donnée trouvée pour ${ville}`,
      });
    }

    // Ajout d'informations calculées
    const donneeEnrichie = {
      ...donnee,
      niveauQualiteAir: getNiveauQualiteAir(donnee.qualiteAir),
      tendanceTemperature: await getTendanceTemperature(
        ville,
        donnee.temperature
      ),
      tendanceHumidite: await getTendanceHumidite(ville, donnee.humidite),
    };

    res.status(200).json({
      success: true,
      donnee: donneeEnrichie,
    });
  } catch (erreur) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: erreur.message,
    });
  }
};

// Fonctions utilitaires pour les tendances
async function getTendanceTemperature(ville, currentTemp) {
  const dateLimite = moment().subtract(2, "days").toDate();
  const donnees = await DonneesCollectees.find({
    ville,
    type: "donnee_reelle",
    horodatage: { $gte: dateLimite },
  })
    .sort({ horodatage: 1 })
    .limit(5);

  if (donnees.length < 2) return "stable";

  const previousTemp = donnees[donnees.length - 2].temperature;
  return currentTemp > previousTemp
    ? "hausse"
    : currentTemp < previousTemp
    ? "baisse"
    : "stable";
}

async function getTendanceHumidite(ville, currentHumidite) {
  const dateLimite = moment().subtract(2, "days").toDate();
  const donnees = await DonneesCollectees.find({
    ville,
    type: "donnee_reelle",
    horodatage: { $gte: dateLimite },
  })
    .sort({ horodatage: 1 })
    .limit(5);

  if (donnees.length < 2) return "stable";

  const previousHumidite = donnees[donnees.length - 2].humidite;
  return currentHumidite > previousHumidite
    ? "hausse"
    : currentHumidite < previousHumidite
    ? "baisse"
    : "stable";
}

function getNiveauQualiteAir(aqi) {
  if (aqi <= 50) return "Excellent";
  if (aqi <= 100) return "Bon";
  if (aqi <= 150) return "Modéré";
  if (aqi <= 200) return "Mauvais";
  return "Très mauvais";
}

/**
 * @desc    Récupère l'historique des données avec filtres
 * @route   GET /api/donnees/historique
 * @access  Public
 */
exports.obtenirHistorique = async (req, res) => {
  try {
    const { ville, startDate, endDate, type, champ } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = { ville };
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.horodatage = {};
      if (startDate) filter.horodatage.$gte = new Date(startDate);
      if (endDate) filter.horodatage.$lte = new Date(endDate);
    }

    const total = await DonneesCollectees.countDocuments(filter);
    const donnees = await DonneesCollectees.find(filter)
      .sort({ horodatage: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(champ ? `${champ} horodatage` : "");

    res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      donnees,
    });
  } catch (erreur) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: erreur.message,
    });
  }
};
