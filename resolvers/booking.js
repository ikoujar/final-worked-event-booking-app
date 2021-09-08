const Event = require('../models/event');
const Booking = require('../models/booking');
const { transformBooking, transformEvent } = require('./merge');

const bookingResolver = {
  Query: {
    bookings: async (_, __, context) => {
      // TODO: Authentication error should be in a middleware.
      if (!context.user) {
        throw new Error('أنت غير مسجل دخول!!');
      }
      try {
        const bookings = await Booking.find({ user: context.user._id });
        return bookings.map(booking => 
          transformBooking(booking)
        );
      } catch (err) {
        throw err;
      }
    }
  },
  Mutation: {
    bookEvent: async (_, args, context) => {
      // TODO: Authentication error should be in a middleware.
      if (!context.user) {
        throw new Error('أنت غير مسجل دخول!!');
      }
      const existingBooking = await Booking.find({ event: args.eventId }).find({ user: context.user });
      if (existingBooking.length > 0) {
        throw new Error('قد حجزت هذا الحدث بالفعل مسبقًا!!');
      }
      const fetchedEvent = await Event.findOne({ _id: args.eventId });
      const booking = new Booking({
        user: context.user._id,
        event: fetchedEvent
      });
      const result = await booking.save();
      return transformBooking(result);
    },
    cancelBooking: async (_, args, context) => {
      // TODO: Authentication error should be in a middleware.
      if (!context.user) {
        throw new Error('أنت غير مسجل دخول!!');
      }
      try {
        const booking = await Booking.findById(args.bookingId).populate('event');
        const event = transformEvent(booking.event);
        await Booking.deleteOne({ _id: args.bookingId });
        return event;
      } catch (err) {
        throw err;
      }
    }
  }
};

module.exports = { bookingResolver };

