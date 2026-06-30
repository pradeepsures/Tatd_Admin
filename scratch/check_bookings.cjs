const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../tatdBackend/config.env") });

async function check() {
  try {
    console.log("Connecting to:", process.env.DB_URL);
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected.");
    
    // Get count of bookings
    const Booking = mongoose.model("Booking", new mongoose.Schema({}, { strict: false }));
    const count = await Booking.countDocuments();
    console.log("Total Bookings in DB:", count);

    const bookingTypes = await Booking.aggregate([
      { $group: { _id: "$bookingType", count: { $sum: 1 } } }
    ]);
    console.log("Booking Types distribution:", bookingTypes);

    const tripStatuses = await Booking.aggregate([
      { $group: { _id: "$tripStatus", count: { $sum: 1 } } }
    ]);
    console.log("Trip Statuses distribution:", tripStatuses);

    const sample = await Booking.findOne();
    console.log("Sample Booking:", sample);

    // Let's also check Hourly, Weekly, Monthly bookings collections
    const HourlyBooking = mongoose.model("HourlyBooking", new mongoose.Schema({}, { strict: false }), "hourlybookings");
    const WeeklyBooking = mongoose.model("WeeklyBooking", new mongoose.Schema({}, { strict: false }), "weeklybookings");
    const MonthlyBooking = mongoose.model("MonthlyBooking", new mongoose.Schema({}, { strict: false }), "monthlybookings");

    console.log("Hourly Bookings Count:", await HourlyBooking.countDocuments());
    console.log("Weekly Bookings Count:", await WeeklyBooking.countDocuments());
    console.log("Monthly Bookings Count:", await MonthlyBooking.countDocuments());

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

check();
