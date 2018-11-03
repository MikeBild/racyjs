import { PubSub } from 'apollo-server-express';

const CHANGED_ITEM = 'CHANGED_ITEM';
const pubsub = new PubSub();
let c = 0;

setInterval(
  () => pubsub.publish(CHANGED_ITEM, { changed: { id: c++, name: 'Demo' } }),
  1000,
);

export default {
  Query: {
    items() {
      return [];
    },
  },
  Subscription: {
    changed: {
      subscribe() {
        return pubsub.asyncIterator([CHANGED_ITEM]);
      },
    },
  },
};
