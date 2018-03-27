/**
 * BankController
 *
 * @description :: Server-side logic for managing banks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

let moment = require('moment');
let slugify = require('slugify');

module.exports = {

  /**
   * Main index function
   *
   * @author Muhammad Amir
   */
  index: ((req, res) => {

    // getting first total count
    Bank.count({})
      .then((count) => {

        // then applying pagination
        Bank.find({})
          .sort({dates: 'ASC'})
          .then((bankDetails) => {

            res.view('bank/index', {
              bankDetails: bankDetails,
              moment: moment,
              last: (typeof req.session.last != 'undefined') ? req.session.last : null,
              edit: (typeof req.session.edit != 'undefined') ? req.session.edit : null,
            });

          })
          .catch((error) => {
            console.log(error);
            res.view(500, "Error while getting data from db.");
          })
      })

  }),


  /**
   * Main index function
   *
   * @author Muhammad Amir
   */
  pagination: ((req, res) => {

    // Setting up limit
    let limit = 5;

    // Getting specific page value or setting default
    let page = 1;
    if (req.param('page')) {
      page = req.param('page');
    }

    // getting first total cound
    Bank.count({})
      .then((count) => {

        // then applying pagination
        Bank.find({})
          .paginate({page: page, limit: limit})
          .sort({dates: 'ASC'})
          .then((bankDetails) => {

            res.view('bank/pagination', {
              bankDetails: bankDetails,
              moment: moment,
              count: count,
              last: (typeof req.session.last != 'undefined') ? req.session.last : null,
              page: parseInt(page),
              limit: parseInt(limit)
            });

          })
          .catch((error) => {
            console.log(error);
            res.view(500, "Error while getting data from db.");
          })
      })

  }),


  /**
   * Showing add method
   *
   * @author Muhammad Amir
   */
  add: ((req, res) => {

    // Getting todays date
    let dates = myProjService.getDateToday();

    // Field names to show error messages
    let fieldNames = myProjService.getBankFields();

    // adding field values back if they exist in session
    let fields = {};
    if (typeof req.session.bank !== 'undefined') {
      fields = req.session.bank;
      req.session.bank = undefined;
    }

    // Sending error message from session to add page
    let errors = null;
    if (typeof req.session.error !== 'undefined') {
      errors = req.session.error;
      req.session.error = undefined;
    }

    // Promise to fix the native mongo command
    let promise = new Promise((resolve, reject) => {

      Bank.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);

        collection.distinct('category', (err, rows) => {

          // error then throw error
          if (err)
            reject(err);

          // if resolved the send to next promise
          resolve(rows);
        });
      });

    });

    promise.then((categories) => {

      return new Promise((resolve, reject) => {

        Bank.native((err, collection) => {

          // throw error when error
          if (err)
            reject(err);

          collection.distinct('subcategory', (err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            // if resolved the send to next promise
            resolve([categories, rows]);
          });
        });

      });

    })
      .then((array) => {

        let subcat = array.pop();
        let cat = array.pop();

        res.view('bank/add', {
          dates: dates,
          fields: fields,
          errors: errors,
          fieldNames: fieldNames,
          subcat: subcat,
          cat: cat
        });
      });


  }),


  /**
   * Creating method
   *
   * @author Muhammad Amir
   */
  create: ((req, res) => {

    Bank.create({
      dates: myProjService.parseDate(req.body.dates),
      title: req.body.title,
      category: req.body.category,
      slug_category: slugify(req.body.category), // saving slug value, will be used for searching
      subcategory: req.body.subcategory,
      slug_subcategory: slugify(req.body.subcategory), // saving slug value, will be used for searching
      amount: req.body.amount,
      descp: req.body.descp,
      amount_type: req.body.amount_type,
    })
      .then((reqs) => {

        // Adding last added row to the session
        req.session.edit = reqs.id;

        if (typeof req.body.add_another != 'undefined')
          res.redirect('bank/add');
        else
          res.redirect('bank');
      })
      .catch((error) => {

        console.log(error);

        // Adding fields to session
        req.session.bank = req.body;

        // Adding error to session
        req.session.error = error.Errors;

        res.redirect('bank/add');
      });

  }),


  /**
   * Showing edit page
   *
   * @author Muhammad Amir
   */
  edit: ((req, res) => {

    if (!req.params.id) {
      myProjService.setError(req, "Bank id was not set");
      res.redirect('/bank');
    }

    // Field names to show error messages
    let fieldNames = myProjService.getBankFields();

    // adding field values back if they exist in session
    let fields = {};
    if (typeof req.session.bank !== 'undefined') {
      fields = req.session.bank;
      req.session.bank = undefined;
    }

    // Sending error message from session to add page
    let errors = null;
    if (typeof req.session.error !== 'undefined') {
      errors = req.session.error;
      req.session.error = undefined;
    }


    // Promise to fix the native mongo command
    let promise = new Promise((resolve, reject) => {

      Bank.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);

        collection.distinct('category', (err, rows) => {

          // error then throw error
          if (err)
            reject(err);

          // if resolved the send to next promise
          resolve(rows);
        });
      });

    });

    promise.then((categories) => {

      return new Promise((resolve, reject) => {

        Bank.native((err, collection) => {

          // throw error when error
          if (err)
            reject(err);

          collection.distinct('subcategory', (err, rows) => {

            // error then throw error
            if (err)
              reject(err);

            // if resolved the send to next promise
            resolve([categories, rows]);
          });
        });

      });

    })
      .then((array) => {

        let subcat = array.pop()
        let cat = array.pop()

        Bank.findOne({id: req.params.id})
          .then((bank) => {

            res.view('bank/edit', {
              fields: bank,
              errors: errors,
              fieldNames: fieldNames,
              subcat: subcat,
              cat: cat,
              moment: moment
            });

          })
          .catch((err) => {
            console.log(err)
          });
      });

  }),


  /**
   * Update bank transection details
   *
   * @author Muhammad Amir
   */
  update: ((req, res) => {

    if (!req.params.id) {
      myProjService.setError(req, "Bank id was not set");
      res.redirect('/bank');
    }

    Bank.update({
      id: req.params.id
    }, {
      dates: myProjService.parseDate(req.body.dates),
      title: req.body.title,
      category: req.body.category,
      slug_category: slugify(req.body.category), // saving slug value, will be used for searching
      subcategory: req.body.subcategory,
      slug_subcategory: slugify(req.body.subcategory), // saving slug value, will be used for searching
      amount: req.body.amount,
      descp: req.body.descp,
      amount_type: req.body.amount_type,
    })
      .then((reqs) => {

        let edit = reqs.pop();

        // Adding edit added row to the session
        req.session.edit = edit.id;

        res.redirect('bank');
      })
      .catch((error) => {

        // Adding fields to session
        req.session.bank = req.body;

        // Adding error to session
        req.session.error = error.Errors;

        res.redirect('bank/edit/' + req.params.id);
      })


  }),


  /**
   * Delete bank transection
   *
   * @author Muhammad Amir
   */
  delete: ((req, res) => {

    if (!req.params.id) {
      myProjService.setError(req, "Bank id was not set");
      res.redirect('/bank');
    }

    Bank.destroy({id: req.params.id})
      .then((msg) => {
        myProjService.setSuccess(req, "Deleted Successfully!");
        res.redirect('/bank');
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
    let subCatValue = null;
    let dates = myProjService.getToFromDate();

    let tDate = dates.pop();
    let fDate = dates.pop();

    if (req.param('to_date') && req.param('from_date')) {
      tDate = myProjService.getDateFromString(req.param('to_date'));
      fDate = myProjService.getDateFromString(req.param('from_date'));
    }

    let toDate = myProjService.formatFromDate(tDate);
    let fromDate = myProjService.formatFromDate(fDate);

    /**
     * getting category if sub-category is set then
     * select only subcategory
     * otherwise return empty object
     */
    if (req.param('category_filter')) {

      obj.category = req.param('category_filter');

      catValue = req.param('category_filter');

      if (req.param('subcategory_filter')) {
        obj.subcategory = req.param('subcategory_filter');

        subCatValue = req.param('subcategory_filter');
      }
    }

    // add date range to find object for mongodb
    obj.dates = {"$gte": fDate, "$lte": tDate};


    // Promise to fix the native mongo command
    let promise = new Promise((resolve, reject) => {

      Bank.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);

        collection.distinct('category', (err, rows) => {

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

        if (obj !== null) {
          Bank.find(obj)
            .sort({dates: 'ASC'})
            .then((rows) => {

              res.view('bank/filter', {
                category: cat,
                catValue: catValue,
                subCatValue: subCatValue,
                rows: rows,
                toDate: toDate,
                fromDate: fromDate,
                moment: moment
              });

            });
        }
        else {
          res.view('bank/filter', {
            category: cat,
            catValue: catValue,
            subCatValue: subCatValue,
            toDate: toDate,
            fromDate: fromDate,
            rows: [],
            moment: moment
          });
        }
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

    if (req.param('to_date') && req.param('from_date')) {
      tDate = myProjService.getDateFromString(req.param('to_date'));
      fDate = myProjService.getDateFromString(req.param('from_date'));
    }


    // Promise to fix the native mongo command
    let promise = new Promise((resolve, reject) => {

      Bank.native((err, collection) => {

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
            $group: {_id: '$category', sum: {$sum: "$amount"}}
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

    let toDate = myProjService.formatFromDate(tDate);
    let fromDate = myProjService.formatFromDate(fDate);

    // Promise returned from getting cat or subcat
    promise
      .then((cat) => {

        res.view('bank/chart', {
          chart_filter: cat,
          toDate: toDate,
          fromDate: fromDate,
        });

      })
      .catch((error) => {
        console.log(error)
      })

  }),


  /**
   * monthly page
   *
   * @author Muhammad Amir
   */
  monthly: ((req, res) => {

    [fromDate, toDate] = myProjService.getToFromDate();


    Bank.find({
      dates: {"$gte": fromDate, "$lte": toDate}
    })
      .then((bankDetails) => {

        res.view("bank/monthly", {
          bankDetails: bankDetails,
          moment: moment,
          fromDate: fromDate.toDateString(),
          toDate: toDate.toDateString(),
          bankAmountType: myProjService.getBankAmountType(),
        })
      });

  }),


  /**
   * Getting sub category form bank collections
   *
   * @author Muhammad Amir
   */
  getSubCat: ((req, res) => {
    if (!req.body.cat)
      res.send(500, "Cat id is not set");

    let promise = new Promise((resolve, reject) => {

      Bank.native((err, collection) => {

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
        res.json(subcateogry);
      });

  }),


  /**
   * Getting sub category form bank collections
   *
   * @author Muhammad Amir
   */
  getSubCatSum: ((req, res) => {
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

      Bank.native((err, collection) => {

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
            $group: {_id: '$subcategory', sum: {$sum: "$amount"}}
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
        res.json(cat)
      })
      .catch((error) => {
        console.log(error)
      })

  }),


  /**
   * Getting title form bank collections
   *
   * @author Muhammad Amir
   */
  getTitleSum: ((req, res) => {
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

      Bank.native((err, collection) => {

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
            $group: {_id: '$title', sum: {$sum: "$amount"}}
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
        res.json(title)
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

    if (req.param('to_date') && req.param('from_date')) {
      tDate = myProjService.getDateFromString(req.param('to_date'));
      fDate = myProjService.getDateFromString(req.param('from_date'));
    }

    // Getting the range of dates and pushing them into array
    let newDate = new Date();
    newDate.setDate(fDate.getDate())
    var arr = [];
    while (newDate < tDate) {
      newDate.setDate(newDate.getDate() + 7)
      arr.push(myProjService.getFirstAndLastDayOfTheWeek(newDate));
    }

    let toDate = myProjService.formatFromDate(tDate);
    let fromDate = myProjService.formatFromDate(fDate);

    res.view('bank/weekly', {
      toDate: toDate,
      fromDate: fromDate,
      arrWeekly: arr,
    });

  }),


  /**
   * Getting sub category form bank collections
   *
   * @author Muhammad Amir
   */
  getWeeklyCatSum: ((req, res) => {

    let dates = myProjService.getToFromDate();

    let tDate = dates.pop();
    let fDate = dates.pop();

    if (req.param('to_date') && req.param('from_date')) {
      tDate = myProjService.getDateFromString(req.param('to_date'));
      fDate = myProjService.getDateFromString(req.param('from_date'));
    }

    // Promise to fix the native mongo command
    let promise = new Promise((resolve, reject) => {

      Bank.native((err, collection) => {

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
            $group: {_id: '$category', sum: {$sum: "$amount"}}
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
        res.json(cat)
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

    if (req.param('to_date') && req.param('from_date')) {
      tDate = myProjService.getDateFromString(req.param('to_date'));
      fDate = myProjService.getDateFromString(req.param('from_date'));
    }

    // Getting the range of dates and pushing them into array
    let newDate = new Date();
    newDate.setDate(fDate.getDate())
    var arr = [];
    while (newDate < tDate) {
      newDate.setDate(newDate.getDate() + 7)
      arr.push(myProjService.getFirstAndLastDayOfTheWeek(newDate));
    }

    let toDate = myProjService.formatFromDate(tDate);
    let fromDate = myProjService.formatFromDate(fDate);

    res.view('bank/weeklybarchart', {
      toDate: toDate.toLocaleString(),
      fromDate: fromDate.toLocaleString(),
      arrWeeklyBar: arr,
    });

  }),


  getWeeklyBarCatSum: ((req, res) => {

    let dates = myProjService.getToFromDate();

    let tDate = dates.pop();
    let fDate = dates.pop();

    if (req.param('to_date') && req.param('from_date')) {
      tDate = myProjService.getDateFromString(req.param('to_date'));
      fDate = myProjService.getDateFromString(req.param('from_date'));
    }


    // Promise to fix the native mongo command
    let promise = new Promise((resolve, reject) => {

      Bank.native((err, collection) => {

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
            $group: {_id: '$category', sum: {$sum: "$amount"}}
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
        res.json(cat)
      })
      .catch((error) => {
        console.log(error)
      })

  }),
};


