require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/db");
const { seedDestinations } = require("./seed/seedDestinations");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedDestinations();

    app.listen(PORT, () => {
      console.log(`Discover Jordan API is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
