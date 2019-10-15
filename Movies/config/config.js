const url =
  'mongodb+srv://m001-student:m001-mongodb-basics@cluster0-wuk1g.mongodb.net/video?retryWrites=true&w=majority';
const mongoose = require('mongoose');

module.exports = () => {
  mongoose.connect(url).then(() => {
    console.log('Connected to port 3000!');
  });
};
