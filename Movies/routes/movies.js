const mongoose = require('mongoose');
const { connection } = mongoose;
const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const movieRouter = express.Router();
const DATABASE = mongoose.connection.db;
const bodyParser = require('body-parser');
let page = 1;
let size = 10;

movieRouter.use(bodyParser.json());
movieRouter.route('/').get((req, res) => {
  res.redirect('/home');
});
movieRouter.route('/home').get(async (req, res) => {
  try {
    const p = req.query.page;
    const s = req.query.size;
    if (p != null) {
      page = parseInt(p);
    }
    if (s != null) {
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
    replacePoster(result);
    res.json(result);
  } catch (err) {
    res.json({ message: 'wala' });
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
    replacePoster(result);
    res.json(result);
  } catch (err) {
    res.json({ message: 'wala' });
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
            writers: 1,
            countries: 1
          }
        }
      )
      .toArray();
    replacePoster(result);
    res.json(result);
  } catch (err) {
    res.json({ message: 'wala' });
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
    replacePoster(result);
    res.json(writers);
  } catch (err) {
    res.json({ message: 'wala' });
  }
});
movieRouter.route('/writers').get(async (req, res) => {
  try {
    const writer = req.query.writer;
    const movies = await connection.db
      .collection('movieDetails')
      .find(
        { writers: { $regex: writer, $options: 'i' } },
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

    replacePoster(movies);
    res.json(movies);
  } catch (err) {
    res.json({ message: 'wala' });
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
    res.json({ message: 'wala' });
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
      res.json({ message: 'success' });
    }
    res.json({ message: 'nabura na' });
  } catch (err) {
    res.json({ message: 'unsuccessful' });
  }
});
movieRouter.route('/update/:id').post(async (req, res) => {
  try {
    const id = req.params.id;
    const value = await connection.db
      .collection('movieDetails')
      .findOne({ _id: new ObjectId(id) });
    if (value) {
      const result = await connection.db
        .collection('movieDetails')
        .findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: req.body },
          { new: true }
        );
      return res.json({ message: 'success' });
    }
    return res.json({ message: 'Movie with ' + id + ' not found!' });
  } catch (err) {
    return res.json({ message: 'unsuccessful' });
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
    replacePoster(result);
    return result;
  } catch (err) {
    return { message: 'wala' };
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
    replacePoster(result);
    return result;
  } catch (err) {
    return { message: 'wala' };
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
    replacePoster(result);
    return result;
  } catch (err) {
    return { message: 'wala' };
  }
}
async function searchAll(all) {
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
    replacePoster(result);
    return result;
  } catch (err) {
    return { message: 'wala' };
  }
}

function replacePoster(result) {
  result.forEach(movie => {
    if (movie.poster) {
      movie.poster = movie.poster.replace('http', 'https');
    }
  });
  return result;
}
module.exports = movieRouter;
