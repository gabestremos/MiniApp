const mongoose = require('mongoose');

const { connection } = mongoose;

const express = require('express');

const { ObjectId } = require('mongodb');

const movieRouter = express.Router();

// const bodyParser = require('body-parser');

const replacePoster = require('../util/replacePoster');

const checkJwt = require('../middleware/jwt');

let pageNo = 1;
const size = 10;

// movieRouter.use(bodyParser.json());

movieRouter.use(function(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).send({ msg: 'Invalid token' });
  }

  return next(err, req, res);
});
movieRouter.route('/').get((req, res) => {
  res.redirect('/home');
});
movieRouter.route('/home').get(async (req, res) => {
  try {
    const p = req.query.page;
    if (p != null) {
      pageNo = parseInt(p);
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
      .skip(size * (pageNo - 1))
      .limit(size)
      .toArray();
    const totalPages = Math.ceil(count / size);
    replacePoster(result);
    res.json({ result, totalSize: count, totalPages });
  } catch (err) {
    res.json({ message: 'wala' });
  }
});
movieRouter.route('/movie/genres/:genre').get(async (req, res) => {
  try {
    const p = req.query.page;
    const { genre } = req.params;
    if (p) {
      pageNo = parseInt(p);
    }

    const count = await connection.db
      .collection('movieDetails')
      .count({ genres: { $regex: genre, $options: 'i' } });
    const result = await connection.db
      .collection('movieDetails')
      .find(
        { genres: { $regex: genre, $options: 'i' } },
        {
          projection: {
            title: 1,
            director: 1,
            year: 1,
            actors: 1,
            poster: 1,
            plot: 1,
            writers: 1,
            genres: 1,
            imdb: 1,
            runtime: 1,
            rated: 1
          }
        }
      )
      .skip(size * (pageNo - 1))
      .limit(10)
      .toArray();
    const totalPages = Math.ceil(count / size);
    replacePoster(result);
    res.json({ result, totalSize: count, totalPages });
  } catch (err) {
    res.json({ message: 'wala' });
  }
});
movieRouter.route('/movie/:id').get(async (req, res) => {
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
            genres: 1,
            imdb: 1,
            runtime: 1,
            rated: 1
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
            countries: 1,
            rated: 1
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
            writers: 1,
            rated: 1
          }
        }
      )
      .toArray();
    replacePoster(writers);
    res.json(writers);
  } catch (err) {
    res.json({ message: 'wala' });
  }
});
movieRouter.route('/writers').get(async (req, res) => {
  try {
    const { writer } = req.query;
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
            writers: 1,
            rated: 1
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
async function searchTitle(title, page) {
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
            poster: 1,
            plot: 1
          }
        }
      )
      .skip(size * (page - 1))
      .limit(size)
      .toArray();
    replacePoster(result);
    const sizeCountTitle = await connection.db
      .collection('movieDetails')
      .count({ title: { $regex: title, $options: 'i' } });
    const totalPagesTitle = Math.ceil(sizeCountTitle / size);
    return { result, sizeCountTitle, totalPagesTitle };
  } catch (err) {
    return { message: 'wala' };
  }
}
async function searchActor(actor, page) {
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
            poster: 1,
            plot: 1,
            rated: 1
          }
        }
      )
      .skip(size * (page - 1))
      .limit(size)
      .toArray();
    const sizeCountActor = await connection.db
      .collection('movieDetails')
      .count({ actors: { $regex: actor, $options: 'i' } });
    const totalPagesActor = Math.ceil(sizeCountActor / size);
    replacePoster(result);
    return { result, sizeCountActor, totalPagesActor };
  } catch (err) {
    return { message: 'wala' };
  }
}
async function searchPlot(plot, page) {
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
            poster: 1,
            plot: 1,
            rated: 1
          }
        }
      )
      .skip(size * (page - 1))
      .limit(size)
      .toArray();
    replacePoster(result);
    const sizeCountPlot = await connection.db
      .collection('movieDetails')
      .count({ plot: { $regex: plot, $options: 'i' } });
    const totalPagesSearchPlot = Math.ceil(sizeCountPlot / size);
    return { result, sizeCountPlot, totalPagesSearchPlot };
  } catch (err) {
    return { message: 'wala' };
  }
}
async function searchAll(all, page) {
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
            poster: 1,
            plot: 1,
            rated: 1
          }
        }
      )
      .skip(size * (page - 1))
      .limit(size)
      .toArray();
    replacePoster(result);

    const sizeCountAll = await connection.db.collection('movieDetails').count({
      $or: [
        { title: { $regex: all, $options: 'i' } },
        { actors: { $regex: all, $options: 'i' } },
        { plot: { $regex: all, $options: 'i' } }
      ]
    });
    const totalPagesSearcAll = Math.ceil(sizeCountAll / size);
    return { result, totalSize: sizeCountAll, totalPagesSearcAll };
  } catch (err) {
    return { message: 'wala' };
  }
}
movieRouter.route('/search').get(async (req, res) => {
  const { title, actor, plot, all, page } = req.query;

  try {
    if (title) {
      if (page) {
        const result = await searchTitle(title, page);
        res.json(result);
      } else {
        const result = await searchTitle(title, pageNo);
        res.json(result);
      }
    } else if (actor) {
      if (page) {
        const result = await searchActor(actor, page);
        res.json(result);
      } else {
        const result = await searchActor(actor, pageNo);
        res.json(result);
      }
    } else if (plot) {
      if (page) {
        const result = await searchPlot(plot, page);
        res.json(result);
      } else {
        const result = await searchPlot(plot, pageNo);
        res.json(result);
      }
    } else if (all) {
      if (page) {
        const result = await searchAll(all, page);
        res.json(result);
      } else {
        const result = await searchAll(all, pageNo);
        res.json(result);
      }
    }
  } catch (err) {
    res.json({ message: 'wala' });
  }
});

movieRouter.route('/delete/:id').get(checkJwt, async (req, res) => {
  try {
    await connection.db
      .collection('movieDetails')
      .findOneAndDelete({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'success' });
  } catch (err) {
    res.json({ message: 'unsuccessful' });
  }
});
movieRouter
  .route('/update/:id')
  .get(checkJwt, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await connection.db.collection('movieDetails').findOne(
        { _id: new ObjectId(id) },
        {
          projection: {
            title: 1,
            director: 1,
            year: 1,
            actors: 1,
            poster: 1,
            plot: 1,
            writers: 1,
            imdb: 1,
            runtime: 1,
            rated: 1
          }
        }
      );
      res.json(result);
    } catch (err) {
      res.json({ message: 'wala' });
    }
  })
  .put(checkJwt, async (req, res) => {
    try {
      const { id } = req.params;
      await connection.db
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

module.exports = movieRouter;
