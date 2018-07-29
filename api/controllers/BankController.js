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
    // Bank.count({})
    //   .then((count) => {

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
    // })

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
      .catch((error) => {
        console.log(error)
      });

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

      }).catch((error) => {
        console.log(error)
      });

    })
      .then((array) => {

        let subcat = array.pop();
        let cat = array.pop();

        // this is to add previous fields to the
        // add method
        if (typeof req.session.banksame != 'undefined') {
          fields.dates = moment(req.session.banksame.dates).format("DD-MM-YYYY");
          fields.category = req.session.banksame.category;
          fields.subcategory = req.session.banksame.subcategory;
          fields.title = req.session.banksame.title;
          fields.amount = req.session.banksame.amount;
        }

        res.view('bank/add', {
          dates: dates,
          fields: fields,
          errors: errors,
          fieldNames: fieldNames,
          subcat: subcat,
          cat: cat
        });
      })
      .catch((error) => {
        console.log(error)
      });


  }),


  /**
   * Creating method
   *
   * @author Muhammad Amir
   */
  create: ((req, res) => {

    let val = {
      dates: myProjService.parseDate(req.body.dates),
      title: req.body.title,
      category: req.body.category,
      slug_category: slugify(req.body.category), // saving slug value, will be used for searching
      subcategory: req.body.subcategory,
      slug_subcategory: slugify(req.body.subcategory), // saving slug value, will be used for searching
      amount: req.body.amount,
      descp: req.body.descp,
      amount_type: req.body.amount_type,
    };

    if (typeof req.body.salary != "undefined") {
      val.salary = req.body.salary;
    }

    Bank.create(val)
      .then((reqs) => {

        // Adding last added row to the session
        req.session.edit = reqs.id;

        if (typeof req.body.add_another != 'undefined') {

          req.session.banksame = {
            dates: myProjService.parseDate(req.body.dates),
            title: req.body.title,
            category: req.body.category,
            subcategory: req.body.subcategory,
            amount: req.body.amount,
          };

          res.redirect('bank/add');
        }
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
      })
      .catch((error) => {
        console.log(error)
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

    let val = {
      dates: myProjService.parseDate(req.body.dates),
      title: req.body.title,
      category: req.body.category,
      slug_category: slugify(req.body.category), // saving slug value, will be used for searching
      subcategory: req.body.subcategory,
      slug_subcategory: slugify(req.body.subcategory), // saving slug value, will be used for searching
      amount: req.body.amount,
      descp: req.body.descp,
      amount_type: req.body.amount_type
    };

    if (typeof req.body.salary != "undefined") {
      val.salary = req.body.salary;
    }

    Bank.update({
      id: req.params.id
    }, val)
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
      });

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

      Bank.native((err, collection) => {

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
      .then((prevs) => {

        return new Promise((resolve, reject) => {
          Bank.native((err, collection) => {

            // throw error when error
            if (err)
              reject(err);

            collection.aggregate([{
              $match: {
                $and: [
                  {dates: {$gte: tfDate, $lte: ttDate}},
                  {salary: 'yes'}
                ]
              }
            }])
              .toArray((err, newrows) => {

                // error then throw error
                if (err)
                  reject(err);

                let arr = [];
                arr.push(prevs);
                arr.push(newrows);

                // if resolved the send to next promise
                resolve(arr);
              });

          });
        });

      })
      .then((array) => {

        // Promise to fix the native mongo command
        return new Promise((resolve, reject) => {

          Bank.native((err, collection) => {

            // throw error when error
            if (err)
              reject(err);

            collection.distinct('category', (err, rows) => {

              // error then throw error
              if (err)
                reject(err);

              array.push(rows)
              // if resolved the send to next promise
              resolve(array);
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

        // add date range to find object for mongodb
        obj.dates = {"$gte": fDate, "$lte": tDate};


        if (obj !== null) {
          Bank.find(obj)
            .sort({dates: 'ASC'})
            .then((rows) => {

              res.view('bank/filter', {
                category: cat,
                catValue: catValue,
                subCatValue: subCatValue,
                bankDetails: rows,
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
            bankDetails: [],
            moment: moment
          });
        }

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

    if (req.param('to_date') && req.param('from_date')) {
      tDate = myProjService.getDateFromString(req.param('to_date'));
      fDate = myProjService.getDateFromString(req.param('from_date'));
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

      Bank.native((err, collection) => {

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
      .then((prevs) => {

        return new Promise((resolve, reject) => {
          Bank.native((err, collection) => {

            // throw error when error
            if (err)
              reject(err);

            collection.aggregate([{
              $match: {
                $and: [
                  {dates: {$gte: tfDate, $lte: ttDate}},
                  {salary: 'yes'}
                ]
              }
            }])
              .toArray((err, newrows) => {

                // error then throw error
                if (err)
                  reject(err);

                let arr = [];
                arr.push(prevs);
                arr.push(newrows);

                // if resolved the send to next promise
                resolve(arr);
              });

          });
        });

      })
      .then((array) => {



        // Promise to fix the native mongo command
        return new Promise((resolve, reject) => {

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

                array.push(rows)

                // if resolved the send to next promise
                resolve(array);
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

      Bank.native((err, collection) => {

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
      .then((prevs) => {

        return new Promise((resolve, reject) => {
          Bank.native((err, collection) => {

            // throw error when error
            if (err)
              reject(err);

            collection.aggregate([{
              $match: {
                $and: [
                  {dates: {$gte: tfDate, $lte: ttDate}},
                  {salary: 'yes'}
                ]
              }
            }])
              .toArray((err, newrows) => {

                // error then throw error
                if (err)
                  reject(err);

                let arr = [];
                arr.push(prevs);
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


        Bank.find({
          dates: {"$gte": fDate, "$lte": tDate}
        })
          .sort({dates: 'ASC'})
          .then((bankDetails) => {

            res.view("bank/monthly", {
              bankDetails: bankDetails,
              moment: moment,
              fromDate: moment(fDate).format('Do MMMM  YYYY'),
              toDate: moment(tDate).format('Do MMMM  YYYY'),
              bankAmountType: myProjService.getBankAmountType(),
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

        if (subcateogry.length > 0)
          return res.json(subcateogry);
      })
      .catch((error) => {
        console.log(error)
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
        if (cat.length > 0)
          return res.json(cat)
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

    if (req.param('to_date') && req.param('from_date')) {
      tDate = myProjService.getDateFromString(req.param('to_date'));
      fDate = myProjService.getDateFromString(req.param('from_date'));
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

      Bank.native((err, collection) => {

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
      .then((prevs) => {

        return new Promise((resolve, reject) => {
          Bank.native((err, collection) => {

            // throw error when error
            if (err)
              reject(err);

            collection.aggregate([{
              $match: {
                $and: [
                  {dates: {$gte: tfDate, $lte: ttDate}},
                  {salary: 'yes'}
                ]
              }
            }])
              .toArray((err, newrows) => {

                // error then throw error
                if (err)
                  reject(err);

                let arr = [];
                arr.push(prevs);
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

        res.view('bank/weekly', {
          toDate: toDate,
          fromDate: fromDate,
          arrWeekly: arr,
        });

      }).catch((error) => {
      console.log(error)
    })

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

    if (req.param('to_date') && req.param('from_date')) {
      tDate = myProjService.getDateFromString(req.param('to_date'));
      fDate = myProjService.getDateFromString(req.param('from_date'));
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

      Bank.native((err, collection) => {

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
      .then((prevs) => {

        return new Promise((resolve, reject) => {
          Bank.native((err, collection) => {

            // throw error when error
            if (err)
              reject(err);

            collection.aggregate([{
              $match: {
                $and: [
                  {dates: {$gte: tfDate, $lte: ttDate}},
                  {salary: 'yes'}
                ]
              }
            }])
              .toArray((err, newrows) => {

                // error then throw error
                if (err)
                  reject(err);

                let arr = [];
                arr.push(prevs);
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

        res.view('bank/weeklybarchart', {
          toDate: toDate.toLocaleString(),
          fromDate: fromDate.toLocaleString(),
          arrWeeklyBar: arr,
        });
      })
      .catch((error) => {
        console.log(error)
      })

  }),


  /**
   * getWeekly bar ajax data
   *
   * @author Muhammad Amir
   */
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
        if (cat.length > 0)
          return res.json(cat);
        else
          return res.json({});
      })
      .catch((error) => {
        console.log(error)
      })
  }),


  /**
   * This will show monthly chat
   *
   * @author Muhammad Amir
   */
  monthlybar: ((req, res) => {

    let dates = myProjService.getMonthlyToFromDate();

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

    // getting the next month range
    // this range will helpful to get the salary time
    let ttDate = new Date(tDate.getTime());
    ttDate.setDate(tDate.getDate() + 7);


    // db.expenses.find({ salary: {$exists:1}, dates: {$gte: "2018-02-06T13:00:00.000Z", $lte: "2018-08-21T14:00:00.000Z"}});
    let promise = new Promise((resolve, reject) => {

      // getting only the salary dates from specific date range
      Bank.find(
        {
          salary: {$exists: 1},
          dates: {$gte: ffDate, $lte: ttDate}
        },
        {
          fields: ['dates']
        })
        .then((rows) => {

          resolve([rows]);

        }).catch((error) => {
        reject(error);
      })


    });

    promise
      .then((arr) => {

        // Promise to fix the native mongo command
        return new Promise((resolve, reject) => {

          Bank.native((err, collection) => {

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
        var monthlyDates = rows.pop();

        let dates = [];
        // creating dates arrays for bar chart
        for (let x = 0; x < monthlyDates.length - 1; x++) {

          // Getting one day previous
          // so that the days dont clash and payment get transferred to next month
          let nextDate = new Date(monthlyDates[x + 1].dates.getTime());
          nextDate.setDate(nextDate.getDate() - 1);

          dates.push([
            new Date(monthlyDates[x].dates.getTime()),
            nextDate
          ]);
        }

        // Pushing last date from loop and also the date which
        // is selected by user
        let nextDate = new Date(monthlyDates[monthlyDates.length-1].dates.getTime());
        nextDate.setDate(nextDate.getDate() - 1);
        dates.push([
          nextDate,
          ttDate
        ]);

        // converting the date to show on browser
        let toDate = myProjService.formatFromDate(tDate);
        let fromDate = myProjService.formatFromDate(fDate);

        res.view('bank/monthlybarchart', {
          toDate: toDate.toLocaleString(),
          fromDate: fromDate.toLocaleString(),
          arrBankMonthlyBar: dates,
          category: category,
        });

      }).catch((error) => {
      console.log(error)
    });

  }),


  /**
   * getMonthly stack ajax data
   *
   * @author Muhammad Amir
   */
  getBankMonthlyStackCatSum: ((req, res) => {

    let dates = myProjService.getToFromDate();

    let tDate = dates.pop();
    let fDate = dates.pop();

    if (req.param('exp_to_date') && req.param('exp_from_date')) {
      tDate = myProjService.getDateFromString(req.param('exp_to_date'));
      fDate = myProjService.getDateFromString(req.param('exp_from_date'));
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


  /**
   * Chart page
   *
   * @author Muhammad Amir
   */
  chartsimple: ((req, res) => {

    let dates = myProjService.getToFromDate();

    let tDate = dates.pop();
    let fDate = dates.pop();

    if (req.param('to_date') && req.param('from_date')) {
      tDate = myProjService.getDateFromString(req.param('to_date'));
      fDate = myProjService.getDateFromString(req.param('from_date'));
    }

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

    promise
      .then((cat) => {

        res.view('bank/chartsimple', {
          chart_bank_filter: cat,
          toDate: toDate,
          fromDate: fromDate,
        });

      })
      .catch((error) => {
        console.log(error)
      })

  }),

};


