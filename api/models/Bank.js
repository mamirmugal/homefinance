/**
 * Bank.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  connection: 'mongodb',

  attributes: {

    dates: {
      type: 'date',
      required:true
    },

    salary: {
      type: 'string',
    },

    title: {
      type: 'string',
      required: true
    },

    category:{
      type:'string',
      required:true
    },

    // slug, used for searching
    slug_category:{
      type:'string',
    },

    subcategory:{
      type:'string',
      required:true
    },

    // slug, used for searching
    slug_subcategory:{
      type:'string',
    },

    descp: {
      type: 'text'
    },

    amount: {
      type: 'float',
      required: true
    },

    amount_type: {
      type: 'string',
      enum: ['added', 'subtracted'],
      required: true
    }

  },
  validationMessages:{
    dates:{
      required:'Date is required',
      name:"Date"
    },
    title:{
      required:'Title is required'
    },
    category:{
      required:'Category is required'
    },
    subcategory:{
      required:'Sub category is required'
    },
    amount:{
      required:'Amount is required'
    },
    amount_type:{
      required:'Amount type is required'
    }
  }
};

