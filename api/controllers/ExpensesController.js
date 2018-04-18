/**
 * ExpensesController
 *
 * @description :: Server-side logic for managing Expenses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

let moment = require('moment');
let slugify = require('slugify');

module.exports = {

  /**
   * main function
   *
   * @author Muhammad Amir
   * @param  req
   * @param  res
   */
  index: (req, res) => {

    // then applying pagination
    Expenses.find({})
      .sort({dates: 'ASC'})
      .then((expensesDetails) => {

        res.view('expenses/index', {
          expensesDetails: expensesDetails,
          moment: moment,
          last: (typeof req.session.last != 'undefined') ? req.session.last : null,
          edit: (typeof req.session.edit != 'undefined') ? req.session.edit : null,
        });

      })
      .catch((error) => {
        console.log(error);
        res.view(500, "Error while getting data from db.");
      })
  },


  /**
   * This is the add method for expenses
   *
   * @author Muhammad Amir
   * @param  req
   * @param  res
   */
  add: (req, res) => {

    // Setting up default fields
    let fields = {
      paid_from: 'credit_card',
      amount_type: 'subtracted',
      payment_type: 'credit_nab',
      product_type: 'essential',
    };

    // Getting todays date
    let dates = myProjService.getDateToday();

    // Field names to show error messages
    let expensesFieldNames = myProjService.getExpensesFields();

    // adding field values back if they exist in session
    if (typeof req.session.expenses !== 'undefined') {
      fields = req.session.expenses;
      req.session.expenses = undefined;
    }

    // Sending error message from session to add page
    let errors = null;
    if (typeof req.session.error !== 'undefined') {
      errors = req.session.error;
      req.session.error = undefined;
    }

    // Promise to fix the native mongo command
    let promise = new Promise((resolve, reject) => {

      Expenses.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);

        collection.distinct('category', (err, rows) => {

          // error then throw error
          if (err)
            reject(err);

          // if resolved the send to next promise
          resolve([rows]);
        });
      });

    });

    // Chaining with promise
    promise.then((categories) => {

      return new Promise((resolve, reject) => {

        Expenses.native((err, collection) => {

          // throw error when error
          if (err)
            reject(err);

          // Getting only categoryies
          collection.distinct('subcategory', (err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            categories.push(rows)

            // if resolved the send to next promise
            resolve(categories);
          });
        });

      });

    }).then((all_categories) => {

      return new Promise((resolve, reject) => {

        Expenses.native((err, collection) => {

          // throw error when error
          if (err)
            reject(err);

          // Getting only categoryies
          collection.distinct('title', (err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            all_categories.push(rows)
            // if resolved the send to next promise
            resolve(all_categories);
          });
        });

      });

    }).then((all_categories) => {

      return new Promise((resolve, reject) => {

        Expenses.native((err, collection) => {

          // throw error when error
          if (err)
            reject(err);

          // Getting only categoryies
          collection.distinct('unit', (err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            all_categories.push(rows)
            // if resolved the send to next promise
            resolve(all_categories);
          });
        });

      });

    }).then((all_categories_title) => {

      return new Promise((resolve, reject) => {

        Expenses.native((err, collection) => {

          // throw error when error
          if (err)
            reject(err);

          // Getting only categoryies
          collection.distinct('company', (err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            all_categories_title.push(rows)
            // if resolved the send to next promise
            resolve(all_categories_title);
          });
        });

      });

    })
      .then((array) => {

        let expenses_company = array.pop();
        let expenses_unit = array.pop();
        let expenses_title = array.pop();
        let expenses_sub_category = array.pop();
        let expenses_category = array.pop();

        // this is to add previous fields to the
        // add method
        if (typeof req.session.same != 'undefined') {
          fields.dates = moment(req.session.same.dates).format("DD-MM-YYYY");
          fields.paid_from = req.session.same.paid_from;
          fields.amount_type = req.session.same.amount_type;
          fields.payment_type = req.session.same.payment_type;
          fields.company = req.session.same.company;
          fields.category = req.session.same.category;
          fields.subcategory = req.session.same.subcategory;
          fields.product_type = req.session.same.product_type;
        }

        res.view('expenses/add', {
          dates: dates,
          fields: fields,
          errors: errors,
          expensesFieldNames: expensesFieldNames,
          expenses_company: expenses_company,
          expenses_unit: expenses_unit,
          expenses_title: expenses_title,
          expenses_sub_category: expenses_sub_category,
          expenses_category: expenses_category
        });
      })
      .catch((error) => {
        console.log(error)
      });

  },


  /**
   * This will save the change to the db
   *
   * @author Muhammad Amir
   * @param  req
   * @param  res
   */
  create: (req, res) => {

    let val = {
      dates: myProjService.parseDate(req.body.dates),
      paid_from: req.body.paid_from,
      amount_type: req.body.amount_type,
      payment_type: req.body.payment_type,
      company: req.body.company,
      category: req.body.category,
      subcategory: req.body.subcategory,
      title: req.body.title,
      description: req.body.description,
      product_type: req.body.product_type,
      quantity_per_unit: req.body.quantity_per_unit,
      quantity_bought: req.body.quantity_bought,
      unit: req.body.unit,
      quantity: req.body.quantity,
      amount: req.body.amount,
      total_amount: req.body.total_amount,
    };

    if (typeof req.body.salary != "undefined") {
      val.salary = req.body.salary;
    }

    Expenses.create(val)
      .then((reqs) => {

        // Adding last added row to the session
        req.session.edit = reqs.id;

        // if selected the add same as before
        if (typeof req.body.same_another != 'undefined') {
          req.session.same = {
            dates: myProjService.parseDate(req.body.dates),
            paid_from: req.body.paid_from,
            amount_type: req.body.amount_type,
            payment_type: req.body.payment_type,
            company: req.body.company,
            category: req.body.category,
            subcategory: req.body.subcategory,
            product_type: req.body.product_type,
          };
        }

        if (typeof req.body.add_another != 'undefined') {
          res.redirect('expenses/add');
        }
        else
        // return res.redirect('back')
          res.redirect('expenses');
      })
      .catch((error) => {

        console.log(error);

        // Adding fields to session
        req.session.expenses = req.body;

        // Adding error to session
        req.session.error = error.Errors;

        res.redirect('expenses/add');
      });

    // res.redirect("expenses")
  },


  /**
   * show the edit page
   *
   * @author Muhammad Amir
   * @param  req
   * @param  res
   */
  edit: (req, res) => {

    if (!req.params.id) {
      myProjService.setError(req, "Expenses id was not set");
      res.redirect('/expenses');
    }

    // Getting todays date
    let dates = myProjService.getDateToday();

    // Field names to show error messages
    let expensesFieldNames = myProjService.getExpensesFields();

    // adding field values back if they exist in session
    let fields = {};
    if (typeof req.session.expenses !== 'undefined') {
      fields = req.session.expenses;
      req.session.expenses = undefined;
    }

    // Sending error message from session to add page
    let errors = null;
    if (typeof req.session.error !== 'undefined') {
      errors = req.session.error;
      req.session.error = undefined;
    }


    // Promise to fix the native mongo command
    let promise = new Promise((resolve, reject) => {

      Expenses.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);

        collection.distinct('category', (err, rows) => {

          // error then throw error
          if (err)
            reject(err);

          // if resolved the send to next promise
          resolve([rows]);
        });
      });

    });

    // Chaining with promise
    promise.then((categories) => {

      return new Promise((resolve, reject) => {

        Expenses.native((err, collection) => {

          // throw error when error
          if (err)
            reject(err);

          // Getting only categoryies
          collection.distinct('subcategory', (err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            categories.push(rows)

            // if resolved the send to next promise
            resolve(categories);
          });
        });

      });

    }).then((all_categories) => {

      return new Promise((resolve, reject) => {

        Expenses.native((err, collection) => {

          // throw error when error
          if (err)
            reject(err);

          // Getting only categoryies
          collection.distinct('title', (err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            all_categories.push(rows)
            // if resolved the send to next promise
            resolve(all_categories);
          });
        });

      });

    }).then((all_categories) => {

      return new Promise((resolve, reject) => {

        Expenses.native((err, collection) => {

          // throw error when error
          if (err)
            reject(err);

          // Getting only categoryies
          collection.distinct('unit', (err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            all_categories.push(rows)
            // if resolved the send to next promise
            resolve(all_categories);
          });
        });

      });

    }).then((all_categories_title) => {

      return new Promise((resolve, reject) => {

        Expenses.native((err, collection) => {

          // throw error when error
          if (err)
            reject(err);

          // Getting only categoryies
          collection.distinct('company', (err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            all_categories_title.push(rows)
            // if resolved the send to next promise
            resolve(all_categories_title);
          });
        });

      });

    })
      .then((array) => {

        let expenses_company = array.pop();
        let expenses_unit = array.pop();
        let expenses_title = array.pop();
        let expenses_sub_category = array.pop();
        let expenses_category = array.pop();

        Expenses.findOne({id: req.params.id})
          .then((expenses) => {

            res.view('expenses/edit', {
              dates: dates,
              fields: expenses,
              errors: errors,
              moment: moment,
              expensesFieldNames: expensesFieldNames,
              expenses_company: expenses_company,
              expenses_unit: expenses_unit,
              expenses_title: expenses_title,
              expenses_sub_category: expenses_sub_category,
              expenses_category: expenses_category
            });

          })
          .catch((err) => {
            console.log(err)
          });
      })
      .catch((error) => {
        console.log(error)
      });

  },


  /**
   * Update expenses transection details
   *
   * @author Muhammad Amir
   * @param  req
   * @param  res
   */
  update: ((req, res) => {

    if (!req.params.id) {
      myProjService.setError(req, "Expenses id was not set");
      res.redirect('/expenses');
    }

    let val = {
      dates: myProjService.parseDate(req.body.dates),
      paid_from: req.body.paid_from,
      amount_type: req.body.amount_type,
      payment_type: req.body.payment_type,
      company: req.body.company,
      category: req.body.category,
      subcategory: req.body.subcategory,
      title: req.body.title,
      description: req.body.description,
      product_type: req.body.product_type,
      quantity_per_unit: req.body.quantity_per_unit,
      quantity_bought: req.body.quantity_bought,
      unit: req.body.unit,
      quantity: req.body.quantity,
      amount: req.body.amount,
      total_amount: req.body.total_amount,
    };

    if (typeof req.body.salary != "undefined") {
      val.salary = req.body.salary;
    }

    Expenses.update({
      id: req.params.id
    }, val)
      .then((reqs) => {

        let edit = reqs.pop();

        // Adding edit added row to the session
        req.session.edit = edit.id;

        res.redirect('expenses');
        // return res.redirect('back')
      })
      .catch((error) => {

        // Adding fields to session
        req.session.expenses = req.body;

        // Adding error to session
        req.session.error = error.Errors;

        res.redirect('expenses/edit/' + req.params.id);
      });

  }),


  /**
   * Delete expenses transection
   *
   * @author Muhammad Amir
   */
  delete: ((req, res) => {

    if (!req.params.id) {
      myProjService.setError(req, "Expenses id was not set");
      res.redirect('/expenses');
    }

    Expenses.destroy({id: req.params.id})
      .then((msg) => {
        myProjService.setSuccess(req, "Deleted Successfully!");
        res.redirect('/expenses');
      })
      .catch((error) => {
        console.log(error);
        res.send(500, "Issue while deleting");
      })
  }),


  /**
   * Filter page
   *
   * @author Muhammad Amir
   */
  filter: ((req, res) => {

    let obj = {};
    let catValue = null;
    let comValue = null;
    let expTitle = null;
    let sendObj = null;
    let subCatValue = null;
    let productType = null;
    let dates = myProjService.getToFromDate();

    let tDate = dates.pop();
    let fDate = dates.pop();

    if (req.param('to_date') && req.param('from_date')) {
      tDate = myProjService.getDateFromString(req.param('to_date'));
      fDate = myProjService.getDateFromString(req.param('from_date'));
    }

    /**
     * Setting up product type
     */
    if (req.param('product_type')) {
      obj.product_type = req.param('product_type');

      productType = req.param('product_type');
    }

    /**
     * getting category form query string
     */
    if (req.param('exp_company_filter')) {
      obj.company = req.param('exp_company_filter');

      comValue = req.param('exp_company_filter');
    }

    /**
     * getting company form query string
     */
    if (req.param('exp_category_filter')) {
      obj.category = req.param('exp_category_filter');

      catValue = req.param('exp_category_filter');
    }

    /**
     * getting sub category form query string
     */
    if (req.param('exp_subcategory_filter')) {
      obj.subcategory = req.param('exp_subcategory_filter');

      subCatValue = req.param('exp_subcategory_filter');
    }

    /**
     * getting title form query string
     */
    if (req.param('exp_title_filter')) {
      obj.title = req.param('exp_title_filter');

      expTitle = req.param('exp_title_filter');
    }


    // add date range to find object for mongodb
    obj.dates = {"$gte": fDate, "$lte": tDate};


    // getting the prev month range
    // this range will helpful to get the salary time
    let ffDate = new Date(fDate.getTime());
    ffDate.setDate(fDate.getDate() - 7);
    let ftDate = new Date(fDate.getTime());
    ftDate.setDate(fDate.getDate() + 7);

    // getting the next month range
    // this range will helpful to get the salary time
    let tfDate = new Date(tDate.getTime());
    tfDate.setDate(tDate.getDate() - 7);
    let ttDate = new Date(tDate.getTime());
    ttDate.setDate(tDate.getDate() + 7);


    let promise = new Promise((resolve, reject) => {

      Expenses.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);

        collection.aggregate(
          [{
            $match: {
              $and: [
                {dates: {$gte: ffDate, $lte: ftDate}},
                {salary: 'yes'}
              ]
            }
          }]
        )
          .toArray((err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            // if resolved the send to next promise
            resolve(rows);
          });

      });

    });

    promise
      .then((rows) => {

        return new Promise((resolve, reject) => {
          Expenses.native((err, collection) => {

            // throw error when error
            if (err)
              reject(err);

            collection.aggregate(
              [{
                $match: {
                  $and: [
                    {dates: {$gte: tfDate, $lte: ttDate}},
                    {salary: 'yes'}
                  ]
                }
              }]
            )
              .toArray((err, newrows) => {

                // error then throw error
                if (err)
                  reject(err);

                let arr = [];
                arr.push(rows);
                arr.push(newrows);

                // if resolved the send to next promise
                resolve(arr);
              });

          });
        });

      })


      .then((arr) => {

        // Promise to fix the native mongo command
        return new Promise((resolve, reject) => {

          Expenses.native((err, collection) => {

            // throw error when error
            if (err)
              reject(err);

            collection.distinct('category', (err, rows) => {

              // error then throw error
              if (err)
                reject(err);

              arr.push(rows)
              // if resolved the send to next promise
              resolve(arr);
            });
          });

        });
      })
      .then((arr) => {

        return new Promise((resolve, reject) => {
          Expenses.native((err, collection) => {

            // throw error when error
            if (err)
              reject(err);

            collection.distinct('company', (err, rows) => {

              // error then throw error
              if (err)
                reject(err);

              arr.push(rows);
              // if resolved the send to next promise
              resolve(arr);
            });
          });
        });

      })
      .then((array) => {

        let company = array.pop();
        let cat = array.pop();
        var next = array.pop();
        var prev = array.pop();

        // Replacing with new start date and time
        if (typeof prev != 'undefined' && typeof prev[0] != 'undefined') {
          fDate = new Date(prev[0].dates.getTime());
        }

        // Replacing with new start date and time
        if (typeof next != 'undefined' && typeof next[0] != 'undefined') {
          tDate = new Date(next[0].dates.getTime());
          // setting up one day before the salary came
          tDate.setDate(tDate.getDate() - 1);
        }

        let toDate = myProjService.formatFromDate(tDate);
        let fromDate = myProjService.formatFromDate(fDate);

        sendObj = {
          category: cat,
          company: company,
          catValue: catValue,
          comValue: comValue,
          subCatValue: subCatValue,
          toDate: toDate,
          expTitle: expTitle,
          productType: productType,
          fromDate: fromDate,
          moment: moment
        };

        if (obj !== null) {
          Expenses.find(obj)
            .sort({dates: 'ASC'})
            .then((rows) => {

              sendObj.expensesDetails = rows;
              sendObj.last = (typeof req.session.last != 'undefined') ? req.session.last : null;
              sendObj.edit = (typeof req.session.edit != 'undefined') ? req.session.edit : null;

              res.view('expenses/filter', sendObj);

            })
            .catch((error) => {
              console.log(error)
            });
        }
        else {

          sendObj.expensesDetails = [];
          res.view('expenses/filter', sendObj);

        }
      })
      .catch((error) => {
        console.log(error)
      });


  }),


  /**
   * Getting sub category form expenses collections
   *
   * @author Muhammad Amir
   */
  getSubCatExp: ((req, res) => {
    if (!req.body.cat)
      res.send(500, "Cat id is not set");

    let promise = new Promise((resolve, reject) => {

      Expenses.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);

        collection.distinct('subcategory', {category: req.body.cat}, (err, rows) => {

          // error then throw error
          if (err)
            reject(err);

          // if resolved the send to next promise
          resolve(rows);
        });
      });

    });

    promise
      .then((subcateogry) => {
        if (subcateogry.length > 0)
          return res.json(subcateogry);
      })
      .catch((error) => {
        console.log(error)
      });

  }),


  /**
   * Getting sub category form expenses collections
   *
   * @author Muhammad Amir
   */
  getTitleExp: ((req, res) => {
    if (!req.body.cat)
      res.send(500, "Sub-Cat id is not set");

    let promise = new Promise((resolve, reject) => {

      Expenses.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);

        collection.distinct('title', {
          subcategory: req.body.subcat,
          category: req.body.cat
        }, (err, rows) => {

          // error then throw error
          if (err)
            reject(err);

          // if resolved the send to next promise
          resolve(rows);
        });
      });

    });

    promise
      .then((title) => {
        if (title.length > 0)
          return res.json(title);
      })
      .catch((error) => {
        console.log(error)
      });

  }),


  /**
   * monthly page
   *
   * @author Muhammad Amir
   */
  monthly: ((req, res) => {

    [fDate, tDate] = myProjService.getToFromDate();

    // getting the prev month range
    // this range will helpful to get the salary time
    let ffDate = new Date(fDate.getTime());
    ffDate.setDate(fDate.getDate() - 7);
    let ftDate = new Date(fDate.getTime());
    ftDate.setDate(fDate.getDate() + 7);

    // getting the next month range
    // this range will helpful to get the salary time
    let tfDate = new Date(tDate.getTime());
    tfDate.setDate(tDate.getDate() - 7);
    let ttDate = new Date(tDate.getTime());
    ttDate.setDate(tDate.getDate() + 7);


    let promise = new Promise((resolve, reject) => {

      Expenses.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);

        collection.aggregate(
          [{
            $match: {
              $and: [
                {dates: {$gte: ffDate, $lte: ftDate}},
                {salary: 'yes'}
              ]
            }
          }]
        )
          .toArray((err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            // if resolved the send to next promise
            resolve(rows);
          });

      });

    });

    promise
      .then((rows) => {

        return new Promise((resolve, reject) => {
          Expenses.native((err, collection) => {

            // throw error when error
            if (err)
              reject(err);

            collection.aggregate(
              [{
                $match: {
                  $and: [
                    {dates: {$gte: tfDate, $lte: ttDate}},
                    {salary: 'yes'}
                  ]
                }
              }]
            )
              .toArray((err, newrows) => {

                // error then throw error
                if (err)
                  reject(err);

                let arr = [];
                arr.push(rows);
                arr.push(newrows);

                // if resolved the send to next promise
                resolve(arr);
              });

          });
        });

      })
      .then((rows) => {

        var next = rows.pop();
        var prev = rows.pop();

        // Replacing with new start date and time
        if (typeof prev != 'undefined' && typeof prev[0] != 'undefined') {
          fDate = new Date(prev[0].dates.getTime());
        }

        // Replacing with new start date and time
        if (typeof next != 'undefined' && typeof next[0] != 'undefined') {
          tDate = new Date(next[0].dates.getTime());
          // setting up one day before the salary came
          tDate.setDate(tDate.getDate() - 1);
        }


        Expenses.find({
          dates: {"$gte": fDate, "$lte": tDate}
        })
          .then((expensesDetails) => {

            res.view("expenses/monthly", {
              expensesDetails: expensesDetails,
              moment: moment,
              last: (typeof req.session.last != 'undefined') ? req.session.last : null,
              edit: (typeof req.session.edit != 'undefined') ? req.session.edit : null,
              fromDate: moment(fDate).format('Do MMMM  YYYY'),
              toDate: moment(tDate).format('Do MMMM  YYYY'),
            })
          })
          .catch((error) => {
            console.log(error)
          });
      })
      .catch((error) => {
        console.log(error)
      });

  }),


  /**
   * Chart page
   *
   * @author Muhammad Amir
   */
  chart: ((req, res) => {

    let dates = myProjService.getToFromDate();

    let tDate = dates.pop();
    let fDate = dates.pop();

    if (req.param('exp_to_date') && req.param('exp_from_date')) {
      tDate = myProjService.getDateFromString(req.param('exp_to_date'));
      fDate = myProjService.getDateFromString(req.param('exp_from_date'));
    }

    // getting the prev month range
    // this range will helpful to get the salary time
    let ffDate = new Date(fDate.getTime());
    ffDate.setDate(fDate.getDate() - 7);
    let ftDate = new Date(fDate.getTime());
    ftDate.setDate(fDate.getDate() + 7);

    // getting the next month range
    // this range will helpful to get the salary time
    let tfDate = new Date(tDate.getTime());
    tfDate.setDate(tDate.getDate() - 7);
    let ttDate = new Date(tDate.getTime());
    ttDate.setDate(tDate.getDate() + 7);


    let promise = new Promise((resolve, reject) => {

      Expenses.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);

        collection.aggregate(
          [{
            $match: {
              $and: [
                {dates: {$gte: ffDate, $lte: ftDate}},
                {salary: 'yes'}
              ]
            }
          }]
        )
          .toArray((err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            // if resolved the send to next promise
            resolve(rows);
          });

      });

    });

    promise
      .then((rows) => {

        return new Promise((resolve, reject) => {
          Expenses.native((err, collection) => {

            // throw error when error
            if (err)
              reject(err);

            collection.aggregate(
              [{
                $match: {
                  $and: [
                    {dates: {$gte: tfDate, $lte: ttDate}},
                    {salary: 'yes'}
                  ]
                }
              }]
            )
              .toArray((err, newrows) => {

                // error then throw error
                if (err)
                  reject(err);

                let arr = [];
                arr.push(rows);
                arr.push(newrows);

                // if resolved the send to next promise
                resolve(arr);
              });

          });
        });

      })
      .then((arr) => {

        // Promise to fix the native mongo command
        return new Promise((resolve, reject) => {

          Expenses.native((err, collection) => {

            // throw error when error
            if (err)
              reject(err);

            collection.aggregate([{
              $match: {
                $and: [
                  {dates: {$gte: fDate, $lte: tDate}},
                  {amount_type: 'subtracted'}
                ]
              }
            },
              {
                $group: {_id: '$category', sum: {$sum: "$total_amount"}}
              }
            ])

              .toArray((err, rows) => {

                // error then throw error
                if (err)
                  reject(err);

                arr.push(rows);
                // if resolved the send to next promise
                resolve(arr);
              });

          });

        });
      })
      .then((rows) => {

        var cat = rows.pop();
        var next = rows.pop();
        var prev = rows.pop();

        // Replacing with new start date and time
        if (typeof prev != 'undefined' && typeof prev[0] != 'undefined') {
          fDate = new Date(prev[0].dates.getTime());
        }

        // Replacing with new start date and time
        if (typeof next != 'undefined' && typeof next[0] != 'undefined') {
          tDate = new Date(next[0].dates.getTime());
          // setting up one day before the salary came
          tDate.setDate(tDate.getDate() - 1);
        }

        let toDate = myProjService.formatFromDate(tDate);
        let fromDate = myProjService.formatFromDate(fDate);

        res.view('expenses/chart', {
          chart_exp_filter: cat,
          toDate: toDate,
          fromDate: fromDate,
        });

      })
      .catch((error) => {
        console.log(error)
      })

  }),


  /**
   * Getting sub category form expenses collections
   *
   * @author Muhammad Amir
   */
  getExpSubCatSum: ((req, res) => {
    if (!req.param('cat'))
      res.send(500, "Cat id is not set");

    let dates = myProjService.getToFromDate();

    let tDate = dates.pop();
    let fDate = dates.pop();

    if (req.param('to_date') && req.param('from_date')) {
      tDate = myProjService.getDateFromString(req.param('to_date'));
      fDate = myProjService.getDateFromString(req.param('from_date'));
    }

    // Promise to fix the native mongo command
    let promise = new Promise((resolve, reject) => {

      Expenses.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);

        collection.aggregate([{
          $match: {
            $and: [
              {dates: {$gte: fDate, $lte: tDate}},
              {category: req.param('cat')},
              {amount_type: 'subtracted'}
            ]
          }
        },
          {
            $group: {_id: '$subcategory', sum: {$sum: "$total_amount"}}
          }
        ])

          .toArray((err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            // if resolved the send to next promise
            resolve(rows);
          });

      });

    });


    // Promise returned from getting cat or subcat
    promise
      .then((cat) => {
        if (cat.length > 0)
          return res.json(cat)
      })
      .catch((error) => {
        console.log(error)
      })

  }),


  /**
   * Getting title form expenses collections
   *
   * @author Muhammad Amir
   */
  getExpTitleSum: ((req, res) => {
    if (!req.param('subcat') && !req.param('cat'))
      res.send(500, "subCat id is not set");

    let dates = myProjService.getToFromDate();

    let tDate = dates.pop();
    let fDate = dates.pop();

    if (req.param('to_date') && req.param('from_date')) {
      tDate = myProjService.getDateFromString(req.param('to_date'));
      fDate = myProjService.getDateFromString(req.param('from_date'));
    }

    // Promise to fix the native mongo command
    let promise = new Promise((resolve, reject) => {

      Expenses.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);

        collection.aggregate([{
          $match: {
            $and: [
              {dates: {$gte: fDate, $lte: tDate}},
              {category: req.param('cat')},
              {subcategory: req.param('subcat')},
              {amount_type: 'subtracted'}
            ]
          }
        },
          {
            $group: {_id: '$title', sum: {$sum: "$total_amount"}}
          }
        ])

          .toArray((err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            // if resolved the send to next promise
            resolve(rows);
          });

      });

    });


    // Promise returned from getting cat or subcat
    promise
      .then((title) => {
        if (title.length > 0)
          return res.json(title)
      })
      .catch((error) => {
        console.log(error)
      })

  }),


  /**
   * this will weekly date form monthly date
   * display week by week
   *
   * @author Muhammad Amir
   */
  weekly: ((req, res) => {

    let dates = myProjService.getToFromDate();

    let tDate = dates.pop();
    let fDate = dates.pop();

    if (req.param('exp_to_date') && req.param('exp_from_date')) {
      tDate = myProjService.getDateFromString(req.param('exp_to_date'));
      fDate = myProjService.getDateFromString(req.param('exp_from_date'));
    }

    // getting the prev month range
    // this range will helpful to get the salary time
    let ffDate = new Date(fDate.getTime());
    ffDate.setDate(fDate.getDate() - 7);
    let ftDate = new Date(fDate.getTime());
    ftDate.setDate(fDate.getDate() + 7);

    // getting the next month range
    // this range will helpful to get the salary time
    let tfDate = new Date(tDate.getTime());
    tfDate.setDate(tDate.getDate() - 7);
    let ttDate = new Date(tDate.getTime());
    ttDate.setDate(tDate.getDate() + 7);


    let promise = new Promise((resolve, reject) => {

      Expenses.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);

        collection.aggregate(
          [{
            $match: {
              $and: [
                {dates: {$gte: ffDate, $lte: ftDate}},
                {salary: 'yes'}
              ]
            }
          }]
        )
          .toArray((err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            // if resolved the send to next promise
            resolve(rows);
          });

      });

    });

    promise
      .then((rows) => {

        return new Promise((resolve, reject) => {
          Expenses.native((err, collection) => {

            // throw error when error
            if (err)
              reject(err);

            collection.aggregate(
              [{
                $match: {
                  $and: [
                    {dates: {$gte: tfDate, $lte: ttDate}},
                    {salary: 'yes'}
                  ]
                }
              }]
            )
              .toArray((err, newrows) => {

                // error then throw error
                if (err)
                  reject(err);

                let arr = [];
                arr.push(rows);
                arr.push(newrows);

                // if resolved the send to next promise
                resolve(arr);
              });

          });
        });

      })
      .then((rows) => {

        var next = rows.pop();
        var prev = rows.pop();

        // Replacing with new start date and time
        if (typeof prev != 'undefined' && typeof prev[0] != 'undefined') {
          fDate = new Date(prev[0].dates.getTime());
        }

        // Replacing with new start date and time
        if (typeof next != 'undefined' && typeof next[0] != 'undefined') {
          tDate = new Date(next[0].dates.getTime());
          // setting up one day before the salary came
          tDate.setDate(tDate.getDate() - 1);
        }

        // Getting the range of dates and pushing them into array
        let newDate = new Date();
        newDate.setDate(fDate.getDate() - 7);
        newDate.setFullYear(fDate.getFullYear());
        newDate.setMonth(fDate.getMonth());
        var arr = [];
        while (newDate < tDate) {
          newDate.setDate(newDate.getDate() + 7)
          arr.push(myProjService.getFirstAndLastDayOfTheWeek(newDate));
        }

        let toDate = myProjService.formatFromDate(tDate);
        let fromDate = myProjService.formatFromDate(fDate);

        res.view('expenses/weekly', {
          toDate: toDate,
          fromDate: fromDate,
          arrExpWeekly: arr,
        });


      }).catch((error) => {
      console.log(error)
    });


  }),


  /**
   * Getting sub category form expenses collections
   *
   * @author Muhammad Amir
   */
  getExpWeeklyCatSum: ((req, res) => {

    let dates = myProjService.getToFromDate();

    let tDate = dates.pop();
    let fDate = dates.pop();

    if (req.param('exp_to_date') && req.param('exp_from_date')) {
      tDate = myProjService.getDateFromString(req.param('exp_to_date'));
      fDate = myProjService.getDateFromString(req.param('exp_from_date'));
    }

    // Promise to fix the native mongo command
    let promise = new Promise((resolve, reject) => {

      Expenses.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);

        collection.aggregate([{
          $match: {
            $and: [
              {dates: {$gte: fDate, $lte: tDate}},
              {amount_type: 'subtracted'}
            ]
          }
        },
          {
            $group: {_id: '$category', sum: {$sum: "$total_amount"}}
          }
        ])

          .toArray((err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            // if resolved the send to next promise
            resolve(rows);
          });

      });

    });


    // Promise returned from getting cat or subcat
    promise
      .then((cat) => {
        if (cat.length > 0)
          return res.json(cat)
      })
      .catch((error) => {
        console.log(error)
      })

  }),


  /**
   * this will weekly date form monthly date
   * display week by week
   *
   * @author Muhammad Amir
   */
  weeklybar: ((req, res) => {

    let dates = myProjService.getToFromDate();

    let tDate = dates.pop();
    let fDate = dates.pop();

    if (req.param('exp_to_date') && req.param('exp_from_date')) {
      tDate = myProjService.getDateFromString(req.param('exp_to_date'));
      fDate = myProjService.getDateFromString(req.param('exp_from_date'));
    }


    // getting the prev month range
    // this range will helpful to get the salary time
    let ffDate = new Date(fDate.getTime());
    ffDate.setDate(fDate.getDate() - 7);
    let ftDate = new Date(fDate.getTime());
    ftDate.setDate(fDate.getDate() + 7);

    // getting the next month range
    // this range will helpful to get the salary time
    let tfDate = new Date(tDate.getTime());
    tfDate.setDate(tDate.getDate() - 7);
    let ttDate = new Date(tDate.getTime());
    ttDate.setDate(tDate.getDate() + 7);


    let promise = new Promise((resolve, reject) => {

      Expenses.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);

        collection.aggregate(
          [{
            $match: {
              $and: [
                {dates: {$gte: ffDate, $lte: ftDate}},
                {salary: 'yes'}
              ]
            }
          }]
        )
          .toArray((err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            // if resolved the send to next promise
            resolve(rows);
          });

      });

    });

    promise
      .then((rows) => {

        return new Promise((resolve, reject) => {
          Expenses.native((err, collection) => {

            // throw error when error
            if (err)
              reject(err);

            collection.aggregate(
              [{
                $match: {
                  $and: [
                    {dates: {$gte: tfDate, $lte: ttDate}},
                    {salary: 'yes'}
                  ]
                }
              }]
            )
              .toArray((err, newrows) => {

                // error then throw error
                if (err)
                  reject(err);

                let arr = [];
                arr.push(rows);
                arr.push(newrows);

                // if resolved the send to next promise
                resolve(arr);
              });

          });
        });

      })


      .then((arr) => {

        // Promise to fix the native mongo command
        return new Promise((resolve, reject) => {

          Expenses.native((err, collection) => {

            // throw error when error
            if (err)
              reject(err);

            collection.distinct('category', (err, rows) => {

              // error then throw error
              if (err)
                reject(err);

              arr.push(rows)
              // if resolved the send to next promise
              resolve(arr);
            });
          });

        });
      })
      .then((rows) => {


        var category = rows.pop();
        var next = rows.pop();
        var prev = rows.pop();

        // Replacing with new start date and time
        if (typeof prev != 'undefined' && typeof prev[0] != 'undefined') {
          fDate = new Date(prev[0].dates.getTime());
        }

        // Replacing with new start date and time
        if (typeof next != 'undefined' && typeof next[0] != 'undefined') {
          tDate = new Date(next[0].dates.getTime());
          // setting up one day before the salary came
          tDate.setDate(tDate.getDate() - 1);
        }


        // Getting the range of dates and pushing them into array
        let newDate = new Date();
        newDate.setDate(fDate.getDate() - 7);
        newDate.setFullYear(fDate.getFullYear());
        newDate.setMonth(fDate.getMonth());

        var arr = [];
        while (newDate < tDate) {
          newDate.setDate(newDate.getDate() + 7)
          arr.push(myProjService.getFirstAndLastDayOfTheWeek(newDate));
        }

        let toDate = myProjService.formatFromDate(tDate);
        let fromDate = myProjService.formatFromDate(fDate);

        res.view('expenses/weeklybarchart', {
          toDate: toDate.toLocaleString(),
          fromDate: fromDate.toLocaleString(),
          arrExpWeeklyBar: arr,
          category: category,
        });

      }).catch((error) => {
      console.log(error)
    });

  }),


  /**
   * getWeekly bar ajax data
   *
   * @author Muhammad Amir
   */
  getExpWeeklyBarCatSum: ((req, res) => {

    let dates = myProjService.getToFromDate();

    let tDate = dates.pop();
    let fDate = dates.pop();

    if (req.param('exp_to_date') && req.param('exp_from_date')) {
      tDate = myProjService.getDateFromString(req.param('exp_to_date'));
      fDate = myProjService.getDateFromString(req.param('exp_from_date'));
    }


    // Promise to fix the native mongo command
    let promise = new Promise((resolve, reject) => {

      Expenses.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);

        collection.aggregate([{
          $match: {
            $and: [
              {dates: {$gte: fDate, $lte: tDate}},
              {amount_type: 'subtracted'}
            ]
          }
        },
          {
            $group: {_id: '$category', sum: {$sum: "$total_amount"}}
          }
        ])
          .toArray((err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            // if resolved the send to next promise
            resolve(rows);
          });
      });
    });


    // Promise returned from getting cat or subcat
    promise
      .then((cat) => {
        if (cat.length > 0) {
          return res.json(cat);
        }
        else
          return res.json({});
      })
      .catch((error) => {
        console.log(error)
      })
  }),


  /**
   * getWeekly stack ajax data
   *
   * @author Muhammad Amir
   */
  getExpWeeklyStackCatSum: ((req, res) => {

    let dates = myProjService.getToFromDate();

    let tDate = dates.pop();
    let fDate = dates.pop();

    if (req.param('exp_to_date') && req.param('exp_from_date')) {
      tDate = myProjService.getDateFromString(req.param('exp_to_date'));
      fDate = myProjService.getDateFromString(req.param('exp_from_date'));
    }


    // Promise to fix the native mongo command
    let promise = new Promise((resolve, reject) => {

      Expenses.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);

        collection.aggregate([{
          $match: {
            $and: [
              {dates: {$gte: fDate, $lte: tDate}},
              {amount_type: 'subtracted'}
            ]
          }
        },
          {
            $group: {_id: '$category', sum: {$sum: "$total_amount"}}
          }
        ])
          .toArray((err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            // if resolved the send to next promise
            resolve(rows);
          });
      });
    });


    // Promise returned from getting cat or subcat
    promise
      .then((cat) => {
        if (cat.length > 0) {

          // converting data to object with key as category name and sum and value
          // which will be used by js to show the stack barchart
          let category = {};
          cat.forEach(function (item) {
            category[item._id] = item.sum;
          });

          return res.json(category);
        }
        else
          return res.json({});
      })
      .catch((error) => {
        console.log(error)
      })
  }),


};

