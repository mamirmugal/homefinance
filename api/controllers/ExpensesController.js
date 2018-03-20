/**
 * ExpensesController
 *
 * @description :: Server-side logic for managing Expenses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // main function
  index: (req, res) => {
    let expenses = [{}];
    res.view("expenses/index", {expenses: expenses})
  },

  add: (req, res) => {
    Category.find({})
      .then((categories) => {
        return categories;
      })
      .then((categories) => {
        res.view("expenses/add" ,{categories:categories})
      });
  },

  create: (req, res) => {
    // var isodate = new Date().toISOString()
    res.redirect("expenses")
  }

};

