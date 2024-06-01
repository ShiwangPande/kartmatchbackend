const mongoose = require('mongoose');

// Define the schema for the vendor
const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  foodItems: [String],
  hygieneRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  tasteRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  hospitalityRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  photoUrl: String
});

// Create a geospatial index on the location field
vendorSchema.index({ location: '2dsphere' });

// Define and export the Vendor model
module.exports = mongoose.model('Vendor', vendorSchema);
