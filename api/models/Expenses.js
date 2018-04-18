/**
 * Expenses.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  connection:'mongodb',
  
  attributes: {

    dates: {
      type: 'date',
      required:true
    },

    salary: {
      type: 'string',
    },

    paid_from: {
      type: 'string',
      enum: ['cash', 'credit_card'],
      required:true
    },

    payment_type: {
      type: 'string',
      enum: ['credit_comm', 'credit_nab', 'comm'],
      required:true
    },

    company: {
      type: 'string',
      required:true
    },

    category: {
      type: 'string',
      required:true
    },

    subcategory: {
      type: 'string',
      required:true
    },

    title: {
      type: 'string',
      required:true
    },

    description: {
      type: 'string'
    },

    product_type: {
      type: 'string',
      enum: ['essential', 'extra'],
    },

    quantity_per_unit:{
      type:'float'
    },

    quantity_bought:{
      type:'float'
    },

    unit: {
      type: 'string'
    },

    quantity:{
      type:'float',
      required:true
    },

    amount_type: {
      type: 'string',
      enum: ['added', 'subtracted'],
      required:true
    },

    amount: {
      type: 'float',
      required:true
    },

    total_amount: {
      type: 'float',
      required:true
    },

  },
  validationMessages:{
    dates:{
      required:'Date is required',
      name:"Date"
    },
    paid_from:{
      required:'Paid from is required'
    },
    title:{
      required:'Title is required'
    },
    company:{
      required:'Company is required'
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
    quantity:{
      required:'Quantity is required'
    },
    amount_type:{
      required:'Amount type is required'
    }
  }
};

