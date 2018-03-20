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

  $('#dates').datepicker({
    format: 'dd/mm/yyyy',
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


  // $("#bank_category").autocomplete({
  //   source: function (request, response) {
  //     $.ajax({
  //       url: "/bank/category",
  //       // dataType: "jsonp",
  //       data: {
  //         term: request.term
  //       },
  //       success: function (data) {
  //         response(data);
  //       }
  //     });
  //   },
  //   minLength: 2,
  //   select: function (event, ui) {
  //     //console.log("Selected: " + ui.item.value + " aka " + ui.item.id);
  //   }
  // });


  // $("#bank_subcategory").autocomplete({
  //   source: function (request, response) {
  //     $.ajax({
  //       url: "/bank/subcategory",
  //       // dataType: "jsonp",
  //       data: {
  //         term: request.term
  //       },
  //       success: function (data) {
  //         response(data);
  //       }
  //     });
  //   },
  //   minLength: 2,
  //   select: function (event, ui) {
  //     //console.log("Selected: " + ui.item.value + " aka " + ui.item.id);
  //   }
  // });

});

function delBank(id) {
  if (confirm("Are you sure you want to delete this transection!")) {
    window.location.herf = "/bank/delete/" + id;
  }
}