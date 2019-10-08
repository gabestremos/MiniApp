function replacePoster(result) {
  result.forEach(movie => {
    if (movie.poster) {
      movie.poster = movie.poster.replace('http', 'https');
    }
  });
  return result;
}
module.exports = replacePoster;
