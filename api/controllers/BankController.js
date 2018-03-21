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
   */
  index: ((req, res) => {

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
          .then((bankDetails) => {

            res.view('bank/index', {
              bankDetails: bankDetails,
              moment: moment,
              count: count,
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

    // Bank.find({
    //   select: ['category']
    // })
    //   .then((category) => {
    //
    //     // returning values not promise object
    //     return Bank.find({
    //       select: ['subcategory']
    //     })
    //       .then((subcategory) => {
    //
    //         // returning cat and subcat
    //         // NOTE:: cat cannot be returned from its own scope
    //         // cat should be returned form nested scope i.e. from here
    //         // otherwise it will return promise instead of cat
    //         return [category, subcategory];
    //       });
    //   })
    //   .then((array) => {
    //
    //     let subcat = array.pop();
    //     let cat = array.pop();
    //
    //     console.log(subcat)
    //     console.log(cat)
    //
    //     res.view('bank/add', {
    //       dates: dates,
    //       fields: fields,
    //       errors: errors,
    //       fieldNames: fieldNames,
    //       subcat: subcat,
    //       cat: cat,
    //       test: "test worked"
    //     });
    //
    //   });


    // Promise to fix the native mongo command
    let promise = new Promise((resolve, reject) => {

      Bank.native((err, collection) => {

        // throw error when error
        if (err)
          reject(err);


        // collection.find(
        //   {},
        //   {category: 1, _id: 0}
        // ).toArray(function (err, rows) {

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

          // collection.find(
          //   {},
          //   {subcategory: 1, _id: 0}
          // ).toArray(function (err, rows) {

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
      .then((req) => {
        res.redirect('bank');
      })
      .catch((error) => {

        // Adding fields to session
        req.session.bank = req.body;

        // Adding error to session
        req.session.error = error.Errors;

        res.redirect('bank/add');
      });

  }),


  /**
   * Showing edit page
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


        // collection.find(
        //   {},
        //   {category: 1, _id: 0}
        // ).toArray(function (err, rows) {

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

          // collection.find(
          //   {},
          //   {subcategory: 1, _id: 0}
          // ).toArray(function (err, rows) {

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

        console.log(subcat)
        console.log(cat)

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


    // Bank.find({
    //   select: ['category']
    // })
    //   .then((category) => {
    //
    //     // returning values not promise object
    //     return  Bank.find({}, {
    //       subcategory:1, id:0
    //     })
    //       .then((subcategory) => {
    //
    //         // returning cat and subcat
    //         // NOTE:: cat cannot be returned from its own scope
    //         // cat should be returned form nested scope i.e. from here
    //         // otherwise it will return promise instead of cat
    //         return [category, subcategory];
    //       });
    //   })
    //   .then((array) => {
    //
    //     let subcat = array.pop();
    //     let cat = array.pop();
    //
    //     console.log(subcat)
    //     console.log(cat)
    //
    //     Bank.findOne({id: req.params.id})
    //       .then((bank) => {
    //
    //         res.view('bank/edit', {
    //           fields: bank,
    //           errors: errors,
    //           fieldNames: fieldNames,
    //           subcat: subcat,
    //           cat: cat,
    //           moment: moment
    //         });
    //
    //
    //       })
    //       .catch((error) => {
    //         console.log(error);
    //         res.redirect("/bank/edit/" + req.params.id);
    //
    //       });
    //
    //   });


  }),


  /**
   * Update bank transection details
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
      .then((req) => {
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
   */
  delete:
    ((req, res) => {

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
   * This is ajax call to get autocomplete value for category
   */
  /*  category: ((req, res) => {

      if (!req.param('term')) {
        req.json({
          error: "Value not sent"
        })
      }

      Bank.find({
        slug_category: {
          'contains': req.param('term')
        },
        select: ['category']
      })
        .then((categories) => {

          let ret = {};
          let array = [];
          let i = 1;
          categories.forEach((item) => {
            ret.id = i;
            //ret.label = item.category;
            ret.value = item.category;
            array.push(ret);
            i++;
          });

          res.json(ret);
        })
        .catch((error) => {
          req.json({
            error: "Error while getting records"
          })
        });

    }),*/


  /**
   * This is ajax call to get autocomplete value for category
   */
  /*subcategory: ((req, res) => {

    if (!req.param('term')) {
      req.json({
        error: "Value not sent"
      })
    }

    Bank.find({
      slug_subcategory: {
        'contains': req.param('term')
      },
      select: ['subcategory']
    })
      .then((subcategories) => {

        let ret = {};
        let array = [];
        let i = 1;
        subcategories.forEach((item) => {
          ret.id = i;
          ret.label = item.subcategory;
          ret.value = item.subcategory;

          array.push(ret)
          i++;
        });

        res.json(ret);
      })
      .catch((error) => {
        req.json({
          error: "Error while getting records"
        })
      });

  }),*/


  /**
   * Filter page
   */
  filter:
    ((req, res) => {

      res.view("/bank/filter")

    })
};


