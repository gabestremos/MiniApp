const mongoose = require('mongoose');
const { connection } = mongoose;
const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const movieRouter = express.Router();
const replacePoster = require('../util/replacePoster');
const bodyParser = require('body-parser');
const checkJwt = require('../util/jwt');
let page = 1;
let size = 10;

movieRouter.use(bodyParser.json());
movieRouter.route('/').get((req, res) => {
  res.redirect('/home');
});
movieRouter.route('/home').get(async (req, res) => {
  try {
    const p = req.query.page;
    if (p != null) {
      page = parseInt(p);
    }
    const count = await connection.db.collection('movieDetails').count({});
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
    const totalPages = Math.ceil(count / size);
    replacePoster(result);
    res.json({ result, totalSize: count, totalPages });
  } catch (err) {
    res.json({ message: 'wala' });
  }
});
movieRouter.route('/movie/:id').get(async (req, res, next) => {
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
  const { title, actor, plot, all, page } = req.query;

  try {
    if (title) {
      if (page) {
        const result = await searchTitle(title, page);
        res.json(result);
      } else {
        const result = await searchTitle(title, 1);
        res.json(result);
      }
    } else if (actor) {
      if (page) {
        const result = await searchActor(actor, page);
        res.json(result);
      } else {
        const result = await searchActor(actor, 1);
        res.json(result);
      }
    } else if (plot) {
      if (page) {
        const result = await searchPlot(plot, page);
        res.json(result);
      } else {
        const result = await searchPlot(plot, 1);
        res.json(result);
      }
    } else {
      if (page) {
        const result = await searchAll(all, page);
        res.json(result);
      } else {
        const result = await searchAll(all, 1);
        res.json(result);
      }
    }
  } catch (err) {
    res.json({ message: 'wala' });
  }
});

movieRouter.route('/delete/:id').get(checkJwt, async (req, res) => {
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
    res.json({ message: 'wala' });
  } catch (err) {
    res.json({ message: 'unsuccessful' });
  }
});
movieRouter
  .route('/update/:id')
  .get(checkJwt, async (req, res) => {
    try {
      const id = req.params.id;
      const result = await connection.db
        .collection('movieDetails')
        .findOne({ _id: new ObjectId(id) });
      res.json(result);
    } catch (err) {
      res.json({ message: 'wala' });
    }
  })
  .post(checkJwt, async (req, res) => {
    try {
      const id = req.params.id;
      const result = await connection.db
        .collection('movieDetails')
        .findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: req.body },
          { new: true }
        );
      return res.json({ message: 'success' });
    } catch (err) {
      return res.json({ message: 'unsuccessful' });
    }
  });
async function searchTitle(title, page) {
  try {
    const sizeCountTitle = await connection.db
      .collection('movieDetails')
      .count({ title: { $regex: title, $options: 'i' } });
    const result = await connection.db
      .collection('movieDetails')
      .find(
        { title: { $regex: title, $options: 'i' } },
        {
          projection: {
            title: 1,
            director: 1,
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
    const totalPagesTitle = Math.ceil(sizeCountTitle / size);
    return { result, sizeCountTitle, totalPagesTitle };
  } catch (err) {
    return { message: 'wala' };
  }
}
async function searchActor(actor, page) {
  try {
    const sizeCountActor = await connection.db
      .collection('movieDetails')
      .count({ actors: { $regex: actor, $options: 'i' } });
    const result = await mongoose.connection.db
      .collection('movieDetails')
      .find(
        { actors: { $regex: actor, $options: 'i' } },
        {
          projection: {
            title: 1,
            director: 1,
            year: 1,
            poster: 1,
            plot: 1
          }
        }
      )
      .skip(size * (page - 1))
      .limit(size)
      .toArray();
    const totalPagesActor = Math.ceil(sizeCountActor / size);
    replacePoster(result);
    return { result, sizeCountActor, totalPagesActor };
  } catch (err) {
    return { message: 'wala' };
  }
}
async function searchPlot(plot, page) {
  try {
    const sizeCountPlot = await connection.db
      .collection('movieDetails')
      .count({ plot: { $regex: plot, $options: 'i' } });
    const result = await connection.db
      .collection('movieDetails')
      .find(
        { plot: { $regex: plot, $options: 'i' } },
        {
          projection: {
            title: 1,
            director: 1,
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
    const totalPagesSearchPlot = Math.ceil(sizeCountPlot / size);
    return { result, sizeCountPlot, totalPagesSearchPlot };
  } catch (err) {
    return { message: 'wala' };
  }
}
async function searchAll(all, page) {
  try {
    const sizeCountAll = await connection.db.collection('movieDetails').count({
      $or: [
        { title: { $regex: all, $options: 'i' } },
        { actors: { $regex: all, $options: 'i' } },
        { plot: { $regex: all, $options: 'i' } }
      ]
    });
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
            poster: 1,
            plot: 1
          }
        }
      )
      .skip(size * (page - 1))
      .limit(size)
      .toArray();
    replacePoster(result);

    const totalPagesSearcAll = Math.ceil(sizeCountAll / size);
    return { result, totalSize: sizeCountAll, totalPagesSearcAll };
  } catch (err) {
    return { message: 'wala' };
  }
}

module.exports = movieRouter;
