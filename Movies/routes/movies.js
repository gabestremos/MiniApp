const mongoose = require('mongoose');
const { connection } = mongoose;
const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const movieRouter = express.Router();
const DATABASE = mongoose.connection.db;

movieRouter.route('/movie/:id').get(async (req, res, next) => {
  try {
    const result = await mongoose.connection.db
      .collection('movieDetails')
      .findOne(
        { _id: new ObjectId(req.params.id) },
        { projection: { title: 1 } }
      );
    res.json(result);
  } catch (err) {
    res.json({ status: 'di mo nakuha' });
  }
});
movieRouter.route('/movie/:id/countries').get(async (req, res) => {
  try {
    const result = await mongoose.connection.db
      .collection('movieDetails')
      .find(
        { _id: new ObjectId(req.params.id) },
        { projection: { title: 1, countries: 1 } }
      )
      .toArray();
    res.json(result);
  } catch (err) {
    res.json({ status: 'wala' });
  }
});
movieRouter.route('/movie/:id/writers').get(async (req, res) => {
  try {
    const writers = await mongoose.connection.db
      .collection('movieDetails')
      .find(
        { _id: new ObjectId(req.params.id) },
        { projection: { title: 1, writers: 1 } }
      )
      .toArray();
    res.json(writers);
  } catch (err) {
    res.json({ status: 'wala' });
  }
});
movieRouter.route('/writer').get(async (req, res) => {
  try {
    console.log(req.query.wr);
    const movies = await mongoose.connection.db
      .collection('movieDetails')
      .find({ writers: req.query.wr }, { projection: { title: 1 } })
      .toArray();
    res.json(movies);
  } catch (err) {
    res.json({ status: 'wala' });
  }
});

movieRouter.route('/search').get(async (req, res) => {
  try {
    const title = await mongoose.connection.db
      .collection('movieDetails')
      .find(
        {
          title: { $regex: req.body }
        },
        { projection: { title: 1 } }
      )
      .toArray();
    res.json(title);
  } catch (err) {
    res.json({ status: 'wala' });
  }
});
module.exports = movieRouter;
