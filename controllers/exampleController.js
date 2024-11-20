// Define a simple function to handle the /test route
exports.testFunction = (req, res) => {
    res.json({ message: 'This is from the controller!' });
  };