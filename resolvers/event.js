const Event = require('../models/event');
const User = require('../models/user');
const Booking = require('../models/booking');
const { transformEvent } = require('./merge');
const { PubSub } = require ('graphql-subscriptions');
const pubsub = new PubSub();

const eventResolver = {
  Query: {
    events: async () => {
      try {
        const events = await Event.find();
        return events.map(event => transformEvent(event));
      } catch (error) {
        throw error;
      }
    },
  },
  Mutation: {
    createEvent: async (_, args, context) => {
      // TODO: Authentication error should be in a middleware.
      if (!context.user) {
        throw new Error('أنت غير مسجل دخول!!');
      }
      const ExistingEvent = await Event.findOne({ title: args.eventInput.title });
      if (ExistingEvent) {
        throw new Error('يوجد لدينا حدث بنفس هذا العنوان، الرجاء اختيار عنوان آخر!!');
      }
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: context.user._id,
      });

      let createdEvent;
      try {
        const result = await event.save();
        createdEvent = transformEvent(result);
        const creator = await User.findById(context.user._id);

        if (!creator) {
          // TODO: Check the message.
          throw new Error('صاحب هذا الحدث غير');
        }
        creator.createdEvents.push(event);
        await creator.save();
        pubsub.publish('EVENT_ADDED', { eventAdded: createdEvent })
        return createdEvent;
      } catch (err) {
        throw err;
      }
    }
  },
  Subscription: {
    eventAdded: {
      subscribe: () => pubsub.asyncIterator(['EVENT_ADDED']),
    },
  },
};

module.exports = { eventResolver };
