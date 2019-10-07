const mongoose = require('mongoose');
const { connection } = mongoose;
const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const movieRouter = express.Router();
const DATABASE = mongoose.connection.db;
const bodyParser = require('body-parser');
let page = 1;
let size = 15;

movieRouter.use(bodyParser.json());
movieRouter.route('/').get((req, res) => {
  res.redirect('/home');
});
movieRouter.route('/home').get(async (req, res) => {
  try {
    const p = req.query.page;
    const s = req.query.size;

    if (p != '') {
      page = parseInt(p);
    }
    if (s != '') {
      size = parseInt(s);
    }
    const result = await connection.db
      .collection('movieDetails')
      .find(
        {},
        {
          projection: {
            title: 1,
            year: 1,
            poster: 1,
            plot: 1
          }
        }
      )
      .skip(size * (page - 1))
      .limit(size)
      .toArray();
    res.json(result);
  } catch (err) {
    res.json({ status: 'wala' });
  }
});
movieRouter.route('/movie/:id').get(async (req, res, next) => {
  try {
    const result = await connection.db.collection('movieDetails').findOne(
      { _id: new ObjectId(req.params.id) },
      {
        projection: {
          title: 1,
          director: 1,
          year: 1,
          actors: 1,
          poster: 1,
          plot: 1,
          writers: 1
        }
      }
    );
    res.json(result);
  } catch (err) {
    res.json({ status: 'wala' });
  }
});
movieRouter.route('/movie/:id/countries').get(async (req, res) => {
  try {
    const result = await connection.db
      .collection('movieDetails')
      .find(
        { _id: new ObjectId(req.params.id) },
        {
          projection: {
            title: 1,
            director: 1,
            year: 1,
            actors: 1,
            poster: 1,
            plot: 1,
            writers: 1
          }
        }
      )
      .toArray();
    res.json(result);
  } catch (err) {
    res.json({ status: 'wala' });
  }
});
movieRouter.route('/movie/:id/writers').get(async (req, res) => {
  try {
    const writers = await connection.db
      .collection('movieDetails')
      .find(
        { _id: new ObjectId(req.params.id) },
        {
          projection: {
            title: 1,
            director: 1,
            year: 1,
            actors: 1,
            poster: 1,
            plot: 1,
            writers: 1
          }
        }
      )
      .toArray();
    res.json(writers);
  } catch (err) {
    res.json({ status: 'wala' });
  }
});
movieRouter.route('/writer').get(async (req, res) => {
  console.log(req.query.writer);
  try {
    const movies = await connection.db
      .collection('movieDetails')
      .find(
        { writers: req.query.writer },
        {
          projection: {
            title: 1,
            director: 1,
            year: 1,
            actors: 1,
            poster: 1,
            plot: 1,
            writers: 1
          }
        }
      )
      .toArray();
    res.json(movies);
  } catch (err) {
    res.json({ status: 'wala' });
  }
});

movieRouter.route('/search').get(async (req, res) => {
  const { title, actor, plot, all } = req.query;

  try {
    if (title != null) {
      const result = await titleSearch(title);
      res.json(result);
    } else if (actor != null) {
      const result = await actorSearch(actor);
      res.json(result);
    } else if (plot != null) {
      const result = await plotSearch(plot);
      res.json(result);
    } else {
      const result = await searchAll(all);
      res.json(result);
    }
  } catch (err) {
    res.json({ status: 'wala' });
  }
});

movieRouter.route('/delete/:id').get(async (req, res) => {
  try {
    const id = await connection.db
      .collection('movieDetails')
      .findOne({ _id: new ObjectId(req.params.id) });
    if (id) {
      const result = await connection.db
        .collection('movieDetails')
        .deleteOne({ _id: new ObjectId(req.params.id) });
      res.json({ status: 'success' });
    }
    res.json({ status: 'nabura na' });
  } catch (err) {
    res.json({ status: 'unsuccessful' });
  }
});
movieRouter.route('/update/:id').post(async (req, res) => {
  try {
    console.log(req.body, req.params.id);
    const id = await connection.db
      .collection('movieDetails')
      .findOne({ _id: new ObjectId(req.params.id) });
    if (id) {
      const result = await connection.db
        .collection('movieDetails')
        .updateOne(
          { _id: new ObjectId(id) },
          { $set: req.body },
          { new: true }
        );
    }
    res.json({ status: 'success' });
  } catch (err) {
    res.json({ status: 'unsuccessful' });
  }
});
async function titleSearch(title) {
  try {
    const result = await connection.db
      .collection('movieDetails')
      .find(
        { title: { $regex: title, $options: 'i' } },
        {
          projection: {
            title: 1,
            director: 1,
            year: 1,
            actors: 1,
            poster: 1,
            plot: 1,
            writers: 1
          }
        }
      )
      .toArray();
    console.log(`/${title}/i`);

    return result;
  } catch (err) {
    return { status: 'wala' };
  }
}
async function actorSearch(actor) {
  try {
    const result = await mongoose.connection.db
      .collection('movieDetails')
      .find(
        { actors: { $regex: actor, $options: 'i' } },
        {
          projection: {
            title: 1,
            director: 1,
            year: 1,
            actors: 1,
            poster: 1,
            plot: 1,
            writers: 1
          }
        }
      )
      .toArray();
    return result;
  } catch (err) {
    return { status: 'wala' };
  }
}
async function plotSearch(plot) {
  try {
    const result = await connection.db
      .collection('movieDetails')
      .find(
        { plot: { $regex: plot, $options: 'i' } },
        {
          projection: {
            title: 1,
            director: 1,
            year: 1,
            actors: 1,
            poster: 1,
            plot: 1,
            writers: 1
          }
        }
      )
      .toArray();
    return result;
  } catch (err) {
    return { status: 'wala' };
  }
}
async function searchAll(all) {
  console.log(all);

  try {
    const result = await connection.db
      .collection('movieDetails')
      .find(
        {
          $or: [
            { title: { $regex: all, $options: 'i' } },
            { actors: { $regex: all, $options: 'i' } },
            { plot: { $regex: all, $options: 'i' } }
          ]
        },
        {
          projection: {
            title: 1,
            director: 1,
            year: 1,
            actors: 1,
            poster: 1,
            plot: 1,
            writers: 1
          }
        }
      )
      .toArray();
    return result;
  } catch (err) {
    return { status: 'wala' };
  }
}
module.exports = movieRouter;
