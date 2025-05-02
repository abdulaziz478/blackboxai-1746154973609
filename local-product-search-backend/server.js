const express = require("express");
const cors = require("cors");
const products = require("./products.json");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Helper function to calculate distance between two coordinates using Haversine formula
function haversineDistance(coords1, coords2) {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }

  const R = 6371; // km
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// API endpoint with optional search and location filtering
app.get("/api/products", (req, res) => {
  let filteredProducts = products;

  const { q, lat, lng, radius } = req.query;

  // Filter by search query (name)
  if (q) {
    const lowerQ = q.toLowerCase();
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(lowerQ)
    );
  }

  // Filter by location radius (in km)
  if (lat && lng && radius) {
    const userLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
    const radiusKm = parseFloat(radius);

    filteredProducts = filteredProducts
      .map((p) => {
        const distance = haversineDistance(userLocation, p.location);
        return { ...p, distance };
      })
      .filter((p) => p.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }

  res.json(filteredProducts);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
