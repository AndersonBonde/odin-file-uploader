const index = async (req, res) => {
  res.render('index', {
    title: 'Index page',
  });
};

module.exports = {
  index,
}
