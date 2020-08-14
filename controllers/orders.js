const mongoose = require('mongoose');
const Order = require('../models/order');
const HttpError = require('../models/http-error');
const User = require('../models/user');
const Car = require('../models/car');

exports.addOrder = async (req, res, next) => {
  const { car, washrequest, washPlan, price } = req.body;
  const newOrder = new Order({
    car,
    washrequest,
    customer: req.userData.userId,
    washPlan,
    price,
    status: 'Pending',
  });
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      'Adding new order failed. Please try again later.',
      500
    );
    console.log(err);
    return next(error);
  }
  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newOrder.save({ session: sess });
    user.orders.push(newOrder);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Adding new order failed. Please try again later.',
      500
    );
    console.log(err);
    return next(error);
  }
  res.status(201).json({ order: newOrder });
};

exports.updateOrderById = async (req, res, next) => {
  const { washer, status } = req.body;
  const orderId = req.params.oid;

  let order;
  try {
    order = await Order.findById(orderId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update order.',
      500
    );
    console.log(err);
    return next(error);
  }
  order.washer = washer;
  order.status = status;
  try {
    await order.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update order.',
      500
    );
    console.log(err);
    return next(error);
  }
  res.json({ order: order.toObject({ getters: true }) });
};

exports.getOrdersByIds = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      'Fetching orders failed. Please try again later.',
      500
    );
    console.log(err);
    return next(error);
  }
  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }
  const ids = user.orders;
  let orders;
  try {
    orders = await Order.find({ _id: { $in: ids } })
      .populate({
        path: 'car',
        model: Car,
        select: 'carModel carRegNo carImage',
      })
      .populate({ path: 'customer', model: User, select: 'name' })
      .populate({ path: 'washer', model: User, select: 'name' });
  } catch (err) {
    const error = new HttpError(
      'Fetching orders failed, please try again later.',
      500
    );
    console.log(err);
    return next(error);
  }
  res.json({
    orders: orders.map((order) => order.toObject({ getters: true })),
  });
};

exports.getAllOrders = async (req, res, next) => {
  let orders;

  try {
    orders = await Order.find({})
      .populate({
        path: 'car',
        model: Car,
        select: 'carModel carRegNo carImage',
      })
      .populate({
        path: 'customer',
        model: User,
        select: 'name',
      })
      .populate({ path: 'washer', model: User, select: 'name' });
  } catch (err) {
    const error = new HttpError('Fetching orders failed.', 500);
    console.log(err);
    return next(error);
  }

  res.json({
    orders: orders.map((order) => order.toObject({ getters: true })),
  });
};
