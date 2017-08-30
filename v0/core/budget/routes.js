const getNextBudget = require("./getNextBudget");

module.exports = function(app) {
  app.get("/", async (req, res) => {
    const data = await getNextBudget();
    res.json(data);
  });
};
