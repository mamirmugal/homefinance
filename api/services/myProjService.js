// api/services/myProjService.js
module.exports = {


  setSuccess: (req, obj) => {
    req.session.flashSuccess = obj;
  },

  getSuccess: (req) => {
    let flashSuccess = req.session.flashSuccess;
    req.session.flashSuccess = undefined;

    return flashSuccess;
  },

  setError: (req, obj) => {
    req.session.flashError = obj;
  },

  getError: (req) => {

    let flashError = req.session.flashError;
    req.session.flashError = undefined;

    return flashError;
  },

  /**
   * This method will get today date
   *
   * @author Muhammad Amir
   */
  getDateToday: (format = 'd/m/y') => {

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

    }

    return ret;
  },


  /**
   * Parsing date according to the application
   *
   * @author Muhammad Amir
   */
  parseDate: ((dateString) => {
    let dateArray;

    if (dateString.includes("/")) {
      dateArray = dateString.split("/");
    }

    if (dateString.includes("-")) {
      dateArray = dateString.split("-");
    }

    return new Date(parseInt(dateArray[2]), parseInt(dateArray[1])-1, parseInt(dateArray[0]));
  }),


  /**
   * These are the field names which will be used to show error messages
   *
   * @author Muhammad Amir
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
  }
};
