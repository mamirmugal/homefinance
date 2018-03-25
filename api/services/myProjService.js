// api/services/myProjService.js
module.exports = {


  /**
   * Setting flash Success message
   *
   * @author Muhammad Amir
   * @param  req
   * @param  obj
   */
  setSuccess: (req, obj) => {
    req.session.flashSuccess = obj;
  },


  /**
   * Getting flash success message
   *
   * @author  Muhammad Amir
   * @param   req
   * @returns {*}
   */
  getSuccess: (req) => {
    let flashSuccess = req.session.flashSuccess;
    req.session.flashSuccess = undefined;

    return flashSuccess;
  },


  /**
   * Setting flash error message
   *
   * @author Muhammad Amir
   * @param  req
   * @param  obj
   */
  setError: (req, obj) => {
    req.session.flashError = obj;
  },


  /**
   * Getting flash error message
   *
   * @author  Muhammad Amir
   * @param   req
   * @returns {*}
   */
  getError: (req) => {

    let flashError = req.session.flashError;
    req.session.flashError = undefined;

    return flashError;
  },


  /**
   * This method will get today date
   *
   * @author  Muhammad Amir
   * @param   format
   * @returns {*}
   */
  getDateToday: (format = 'd-m-y') => {

    let d = (new Date);

    // console.log(d.toLocaleString());       // -> date and time
    // console.log(d.toLocaleDateString());   // -> date
    // console.log(d.toLocaleTimeString());   // -> time

    let dateArray = d.toLocaleDateString().split("-");
    let ret;
    switch (format) {

      case 'y-m-d':
        ret = dateArray[0] + "-" + dateArray[1] + "-" + dateArray[2];
        break;

      case 'y/m/d':
        ret = dateArray[0] + "/" + dateArray[1] + "/" + dateArray[2];
        break;

      case 'd/m/y':
        ret = dateArray[2] + "/" + dateArray[1] + "/" + dateArray[0];
        break;

      case 'd-m-y':
        ret = dateArray[2] + "-" + dateArray[1] + "-" + dateArray[0];
        break;

    }

    return ret;
  },


  /**
   * Parsing date according to the application
   *
   * @author  Muhammad Amir
   * @param   dateString
   * @returns {Date}
   */
  parseDate: (dateString) => {
    let dateArray;

    if (dateString.includes("/")) {
      dateArray = dateString.split("/");
    }

    if (dateString.includes("-")) {
      dateArray = dateString.split("-");
    }

    return new Date(parseInt(dateArray[2]), parseInt(dateArray[1]) - 1, parseInt(dateArray[0]));
  },


  /**
   * These are the field names which will be used to show error messages
   *
   * @author  Muhammad Amir
   * @returns {{dates: string, amount_type: string, category: string, subcategory: string, title: string, descp: string, amount: string}}
   */
  getBankFields: () => {
    return {
      dates: 'Date',
      amount_type: 'Payment type',
      category: 'Category',
      subcategory: 'Sub-category',
      title: 'Title',
      descp: 'Description',
      amount: 'Amount'
    }
  },

  /**
   * Checking if he object is empty or not
   *
   *
   * @param   obj
   * @returns {boolean}
   */
  isEmpty: (obj) => {
    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0) return false;
    if (obj.length === 0) return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and toValue enumeration bugs in IE < 9
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
  },


  /**
   * getting the Date range for one months total
   *
   * @author  Muhammad Amir
   * @param   month
   * @param   year
   * @returns {*[]}
   */
  getToFromDate: (month, year) => {

    var d = new Date();
    if (typeof month === 'undefined') {
      month = d.getMonth();
    }
    if (typeof year === 'undefined') {
      year = d.getFullYear();
    }

    var fromDate;
    var toDate;
    if (d.getDate() < 14) {
      fromDate = new Date(year, (month - 1), 15); // getting 15 of previous month
      toDate = new Date(year, month, 14); // getting 15th of current month
    }
    else {
      fromDate = new Date(year, month, 15); // getting 15 of current month
      toDate = new Date(year, (month + 1), 14); // getting 16th of next month
    }

    return [fromDate, toDate];
  },


  /**
   * Getting Bank Amount type
   *
   * @author  Muhammad Amir
   * @returns {{subtracted: string, added: string}}
   */
  getBankAmountType: () => {
    return {
      'subtracted': "Credited",
      'added': "Debited",
    };
  },


  /**
   * This method will get today date
   *
   * @author  Muhammad Amir
   * @param   format
   * @returns {*}
   */
  formatFromDate: (d, format = 'd-m-y') => {

    // console.log(d.toLocaleString());       // -> date and time
    // console.log(d.toLocaleDateString());   // -> date
    // console.log(d.toLocaleTimeString());   // -> time

    let dateArray = d.toLocaleDateString().split("-");
    let ret;
    switch (format) {

      case 'y-m-d':
        ret = dateArray[0] + "-" + dateArray[1] + "-" + dateArray[2];
        break;

      case 'y/m/d':
        ret = dateArray[0] + "/" + dateArray[1] + "/" + dateArray[2];
        break;

      case 'd/m/y':
        ret = dateArray[2] + "/" + dateArray[1] + "/" + dateArray[0];
        break;

      case 'd-m-y':
        ret = dateArray[2] + "-" + dateArray[1] + "-" + dateArray[0];
        break;

    }

    return ret;
  },


  /**
   * Convert Date from string to date object
   *
   * @author Muhammad
   * @param  date
   */
  getDateFromString: (date) => {

    let arr = date.split("-")
    return new Date(arr[2], parseInt(arr[1]) - 1, arr[0]);

  },


  getFirstAndLastDayOfTheWeek: (date) => {

    // var curr = myProjService.getDateFromString(date);
    var curr = myProjService.getDateFromString(date);
    var first = myProjService.getDateFromString(date);
    var last = myProjService.getDateFromString(date);
    console.log(curr)
    // console.log(curr.getDate())
    // console.log(curr.getDay())

    first.setDate(first.getDate() - first.getDay());
    last.setDate(first.getDate() + (6 - first.getDay()));

    // var curr = new Date("2018-02-27");
    // day = curr.getDay();
    // firstday = new Date(curr.getTime() - 60*60* day*1000); //will return firstday (ie sunday) of the week
    // lastday = new Date(curr.getTime() + 60 * 60 *24 * 5 * 1000);

    console.log('firstday')
    console.log(first)
    console.log(last)

    console.log("====")

    return [first, last];
  },


};
