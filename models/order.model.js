module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define("order", {
    orderId: {
      type: Sequelize.STRING
    },
    playerId: {
      type: Sequelize.STRING
    },
    productId: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.STRING
    },
    lastStep: {
      type: Sequelize.STRING
    }
  });

  return Order;
};