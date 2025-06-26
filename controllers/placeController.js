const Place = require("../models/Place");

// Get all places
exports.getAllPlaces = async (req, res) => {
  try {
    const places = await Place.find().sort({ createdAt: -1 });
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single place by ID
exports.getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({ message: "Vendi nuk u gjet" });
    }
    res.json(place);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new place
exports.createPlace = async (req, res) => {
  try {
    // Kontrollo nëse ekziston vend me të njëjtin emër
    const existingPlace = await Place.findOne({ name: req.body.name });
    if (existingPlace) {
      return res.status(400).json({
        message: "Ekziston një vend me të njëjtin emër",
      });
    }

    const place = new Place({
      name: req.body.name,
      description: req.body.description,
      location: req.body.location,
      historicalSignificance: req.body.historicalSignificance,
      imageUrl: req.body.imageUrl,
      coordinates: req.body.coordinates,
    });

    await place.save();
    res.status(201).json({ message: "OK" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update place
exports.updatePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({ message: "Vendi nuk u gjet" });
    }

    // Nëse po përditësohet emri, kontrollo nëse ekziston tjetër vend me të njëjtin emër
    if (req.body.name && req.body.name !== place.name) {
      const existingPlace = await Place.findOne({ name: req.body.name });
      if (existingPlace) {
        return res.status(400).json({
          message: "Ekziston një vend tjetër me të njëjtin emër",
        });
      }
    }

    Object.keys(req.body).forEach((key) => {
      place[key] = req.body[key];
    });

    await place.save();
    res.status(200).json({ message: "OK" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete place
exports.deletePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({ message: "Vendi nuk u gjet" });
    }

    await place.deleteOne();
    res.status(200).json({ message: "OK" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
