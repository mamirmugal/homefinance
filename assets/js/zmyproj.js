/**
 * Loading up jquery
 */
jQuery(($) => {

  $("#sub_cat_btn").click(function (e) {

    if ($('#cat_id').val() == 0) {
      alert("Please select category!")
      return false;
    } else {
      $("#sub_cat_form").submit();
    }
  });

  $('#dates, #from_date, #to_date, #exp_from_date, #exp_to_date').datepicker({
    format: 'dd-mm-yyyy',
    uiLibrary: 'bootstrap4',
    // "setDate": new Date(),
    // "autoclose": true
  });

  // Expense page
  $("#category_id").change(function () {
    $.ajax({
      method: "POST",
      url: "/subcategory/getval",
      data: {catid: $(this).val()}
    })
      .done(function (msg) {
        console.log(msg)
      });

  })

  /**
   * For Bank filter page
   */
  $("#category_filter").change(function () {
    var val = $(this).val();

    $("#subcategory_filter > option").remove();
    $.ajax({
      method: "POST",
      url: "/bank/getSubCat",
      data: {cat: $(this).val()}
    })
      .done(function (msg) {

        $("#subcategory_filter").append($('<option>', {value: "", text: "All"}));
        var options = {};
        $.each(msg, function (index, item) {

          options = {
            value: item,
            text: item,
          };

          if ($('#sub_val').val() == item) {
            options.selected = "selected";
          }

          $("#subcategory_filter").append(
            $('<option>', options)
          );

        })
      });
  });


  $("#category_filter").trigger('change');


  /**
   * For expense filter page
   */
  $("#exp_category_filter").change(function () {
    var val = $(this).val();

    $("#exp_subcategory_filter > option").remove();
    $.ajax({
      method: "POST",
      url: "/expenses/getSubCatExp",
      data: {cat: $(this).val()}
    })
      .done(function (msg) {

        $("#exp_subcategory_filter").append($('<option>', {value: "", text: "All"}));
        var options = {};
        $.each(msg, function (index, item) {

          options = {
            value: item,
            text: item,
          };

          if ($('#exp_sub_val').val() == item) {
            options.selected = "selected";
          }

          $("#exp_subcategory_filter").append(
            $('<option>', options)
          );

        })
      });
  });


  $("#exp_category_filter").trigger('change');


  /**
   * For expense filter page
   */
  $("#exp_subcategory_filter").change(function () {
    var subcat = $("#exp_subcategory_filter").val();

    /**
     * this is because for some reason subcat is not getting values
     * when it runs on page load
     */
    if(subcat == null){
      subcat = $('#exp_sub_val').val()
    }

    var cat = $('#exp_category_filter').val();

    // console.log(subcat);
    // console.log($("#exp_subcategory_filter").val());
    // console.log(cat);

    $("#exp_title_filter > option").remove();
    $.ajax({
      method: "POST",
      url: "/expenses/getTitleExp",
      data: {
        subcat: subcat,
        cat: cat
      }
    })
      .done(function (msg) {

        $("#exp_title_filter").append($('<option>', {value: "", text: "All"}));
        var options = {};
        $.each(msg, function (index, item) {

          options = {
            value: item,
            text: item,
          };

          if ($('#exp_title').val() == item) {
            options.selected = "selected";
          }

          $("#exp_title_filter").append(
            $('<option>', options)
          );

        })
      });
  });


  $("#exp_subcategory_filter").trigger('change');

});

function delBank(id) {
  if (confirm("Are you sure you want to delete this transection!")) {
    window.location = "/bank/delete/" + id;
  }
}

function delExpenses(id) {
  if (confirm("Are you sure you want to delete this transection!")) {
    window.location = "/expenses/delete/" + id;
  }
}