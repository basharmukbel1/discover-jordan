const Destination = require("../models/Destination");
const Trip = require("../models/Trip");
const User = require("../models/User");

const getOverview = async (req, res) => {
  try {
    const now = new Date();
    const firstMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
    const [users, destinations, trips, favorites, recentUsers, monthlyUsers, monthlyTrips, categoryCounts] =
      await Promise.all([
        User.countDocuments(),
        Destination.countDocuments(),
        Trip.countDocuments(),
        User.aggregate([
          { $group: { _id: null, total: { $sum: { $size: { $ifNull: ["$favorites", []] } } } } },
        ]),
        User.find().select("name role createdAt").sort({ createdAt: -1 }).limit(5).lean(),
        User.aggregate([
          { $match: { createdAt: { $gte: firstMonth } } },
          {
            $group: {
              _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
              count: { $sum: 1 },
            },
          },
        ]),
        Trip.aggregate([
          { $match: { createdAt: { $gte: firstMonth } } },
          {
            $group: {
              _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
              count: { $sum: 1 },
            },
          },
        ]),
        Destination.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      ]);

    const userCounts = new Map(
      monthlyUsers.map(({ _id, count }) => [`${_id.year}-${_id.month}`, count]),
    );
    const tripCounts = new Map(
      monthlyTrips.map(({ _id, count }) => [`${_id.year}-${_id.month}`, count]),
    );
    const monthlyTrend = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(Date.UTC(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth() + index, 1));
      const key = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;
      return {
        label: new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" }).format(date),
        users: userCounts.get(key) || 0,
        trips: tripCounts.get(key) || 0,
      };
    });

    return res.status(200).json({
      success: true,
      overview: {
        totals: {
          users,
          destinations,
          trips,
          favorites: favorites[0]?.total || 0,
        },
        monthlyTrend,
        categories: categoryCounts.map(({ _id, count }) => ({ name: _id, count })),
        recentUsers,
      },
    });
  } catch (error) {
    console.error("Loading admin overview failed:", error.message);
    return res.status(500).json({ success: false, message: "Could not load the admin dashboard." });
  }
};

module.exports = { getOverview };
