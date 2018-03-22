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
        $.each(msg, function (index, item) {
          $("#subcategory_filter").append(
            $('<option>',{
                value: item,
                text: item,
            })
          )
        })
      });
  })
});

function delBank(id) {
  if (confirm("Are you sure you want to delete this transection!")) {
    window.location.herf = "/bank/delete/" + id;
  }
}