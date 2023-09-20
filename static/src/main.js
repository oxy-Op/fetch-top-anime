
let xhr = null
let abortCode = 0
const viewImagePath = '/static/images/view.png'
const hideImagePath = '/static/images/hide.png'
const serverUrl = ''
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})
var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl)
}
)

$(document).ready(() => {
  carouselInitialize();
  toggleCarousel();
  abortModal();
  checkInput();
  handleLoadEvent();
})


function handleLoadEvent() {
  const loader = $('#loader')
  const abortLoad = $('#abortLoad')
  const inputElement = $('#topn')

  $(loader).click(function () {
    if ($('#loader span').hasClass("loading")) {
      $(abortLoad).on('click', function () {
        stopLoad();
        deinitializeLoader();
      })
    }
    else {
      if ($(inputElement).val() <= 50 && $(inputElement).val() >= 2) {
        $(inputElement).attr("disabled", true)
        initializeLoader();
        displayPreloader();
        displayData($(inputElement).val());
      }
    }
  })
}

function checkInput() {
  const inputElement = $('#topn')
  const loader = $('#loader')

  $(inputElement).on('input', function () {
    let val = $(this).val();
    if (val >= 2 && val <= 50) {
      $(loader).show();
      $('#warner').html('')
    }
    else {
      displayWarning($('#warner'),
        'Please enter a valid number between 2 and 50', true)
      $(loader).hide();
    }
  })
}


function loadData(n, callback) {
  abortCode = 0

  xhr = $.ajax({
    type: 'GET',
    url: `${serverUrl}/fetch/0/${n}`,
    success: function (data) {
      callback(data);
    },
    error: function () {
      if (abortCode === 0) {
        callback({ 'status': 'ERROR' })
      }
      else {
        callback({ 'status': 'USER_ABORTED' })
      }
    },
  });
}

function stopLoad() {
  if (xhr != null) {
    abortCode = 1
    xhr.abort();
  }
}

function displayData(n) {
  loadData(n, function (data) {
    if (data['status'] === 'success') {
      let datax = data['rankings']
      $('#grid-view').removeClass('invisible')
      let isListView = true;
      $('#information').html(generateTable(datax))
      $('#grid-switch').on('click', function () {
        if (isListView) {
          generateCard(datax);
          $('#switcher').text("L")
          isListView = false;
        } else {
          $('#information').html(generateTable(datax))
          $('#switcher').text("G")
          isListView = true;
        }
      });
    }
    else if (data['status'] == 'USER_ABORTED') {
      displayWarning($('#information'), 'Aborted', true)
      $("#grid-view").addClass('invisible');
    }
    else {
      displayWarning($('#information'), 'Could not fetch. Please try again', true)
      $("#grid-view").addClass('invisible');
    }
    displayPreloader(false)
    $("#loader").hide()
    deinitializeLoader();
    $('#topn').attr("disabled", false)

  });
}

function displayPreloader(bool = true) {
  const div = $(`
  <div class="d-flex">
    <div class="holder w-100">
      <div class="row justify-content-center m-3 ">
        <div class="col-md-6 text-center">
          <div id="spin-loader" class="spinner-border text-primary"></div>
        </div>
        <div class="text-center mt-3 text-warning" id="progText">
          <span class="spinner-grow spinner-grow-sm text-bg-info"></span> Did you know? <br /> <span class="text-info">Attack on titan
            is the best anime.</span>
        </div>
      </div>
    </div>
  </div>`
  )
  if (bool) {
    $('#showloading').append(div)
  }
  else {
    $('#showloading').empty()
  }
}

function initializeLoader() {
  const loader = $('#loader')
  $(loader).text("Stop loading...")
  $(loader).attr('data-bs-toggle', 'modal')
  $(loader).attr('data-bs-target', '#abortModal')
  $(loader).prepend(`<span class="spinner-border spinner-border-sm mx-2 loading" role="status"></span>`)
  $(loader).prop("disabled", false)
}

function deinitializeLoader() {
  const loader = $('#loader')
  $(loader).text("Load Anime List")
  $(loader).prop("disabled", false)
  $(loader).attr('data-bs-toggle', '')
  $(loader).attr('data-bs-target', '')
  $('#loader span').remove()
}

function displayWarning(element, text, empty = false) {
  if (empty) {
    $(element).empty()
  }
  const div = $('<div class="alert alert-danger alert-dismissible fade show" role="alert">')
  const button = $('<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>')

  div.append(text)
  div.append(button)
  $(element).append(div)
}

function carouselInitialize() {
  $.get(`${serverUrl}/fetch/1/3`, function (data) {
    $.each($('.carousel-item img'), function (index, value) {
      const image = data['rankings'][index].image
      $(value).attr('src', image)
      $(value).attr('data-bs-toggle', 'tooltip')
      $(value).attr('data-bs-placement', 'top')
      $(value).attr('title', data['rankings'][index].name)
    })
  })
}

function toggleCarousel() {
  let hide = true
  $('#hideCarousel').on('click', function () {
    if (hide) {
      $('#hideCarousel img').attr('src', viewImagePath)
      $('#carousel-hide').hide(200)
      hide = false
    }
    else {
      $('#hideCarousel img').attr('src', hideImagePath)
      $('#carousel-hide').show(200)
      hide = true
    }
  })
}


function gridSwitch(data) {
  $('#information').empty();
  console.log("done")
  generateCard(data)
}

function listView(data) {
  $('#information').empty();
  console.log("done")
  generateTable(data)
}

function generateCard(data) {
  $('#information').empty();
  const row = $('<div class="row"></div>');
  $.each(data, function (index, data) {
    const items = $(`<div class="col-12 col-sm-6 col-md-4 col-lg-3"></div>`);
    const card = $('<div class="card m-3"></div>');
    const cardImg = $('<img class="card-img-top">');
    cardImg.attr('src', data.image);
    cardImg.attr('height', '200px');
    cardImg.css('object-fit', 'cover');
    cardImg.attr('data-bs-toggle', 'tooltip');
    cardImg.attr('data-bs-placement', 'top');
    cardImg.attr('title', data.name);

    const cardBody = $('<div class="card-body text-light"></div>');
    const cardTitle = $('<h5 class="card-title"></h5>');
    const badge = $('<span class="badge bg-primary">  </span>').text(data.rank);
    cardTitle.append(badge).append(` Score: ${data.score}`);
    const cardText = $('<p class="card-text"></p>').text(data.name);

    cardBody.append(cardTitle);
    cardBody.append(cardText);
    card.append(cardImg);
    card.append(cardBody);

    items.append(card);
    row.append(items);
    $('#information').append(row);
  });
}

function generateTable(data) {
  const table = $(`<table class="table table-bordered table-dark table-hover table-striped">`)
  const thead = $(`<thead class="table-primary"><tr><th>Rank</th><th>Name</th><th>Score</th></tr></thead>`)
  const tbody = $(`<tbody id="infotable"></tbody>`)
  table.append(thead);
  table.append(tbody)
  $.each(data, function (index, value) {
    tbody.append(`
        <tr>
          <td><span class="badge bg-primary">${value.rank}</span></td>
          <td>${value.name}</td>
          <td>${value.score}</td>
        </tr>`)
  })
  return table
}

function abortModal() {
  const modal = $('<div class="modal fade" id="abortModal" tabindex="-1" aria-labelledby="abortModalLabel" aria-hidden="true">')
  const modalDialog = $('<div class="modal-dialog"></div>')
  const modalContent = $('<div class="modal-content"></div>')
  const modalHeader = $('<div class="modal-header"></div>')
  const modalTitle = $('<h5 class="modal-title" id="abortModalLabel">Are you sure you want to stop?</h5>')
  const dismissModalBtn = $('<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>')
  const modalBody = $('<div class="modal-body">You will not be able to undo this action</div>')
  const modalFooter = $('<div class="modal-footer"></div>')
  const cancelButton = $('<button id="abortCancel" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>')
  const continueButton = $('<button id="abortLoad" type="button" class="btn btn-primary" data-bs-dismiss="modal">Continue</button>')

  modalHeader.append(modalTitle)
  modalHeader.append(dismissModalBtn)
  modalFooter.append(cancelButton)
  modalFooter.append(continueButton)
  modalContent.append(modalHeader)
  modalContent.append(modalBody)
  modalContent.append(modalFooter)
  modalDialog.append(modalContent)
  modal.append(modalDialog)

  $(document.body).append(modal);
}


// function getRandomColor() {
//   const letters = '0123456789ABCDEF'; // Hexadecimal characters
//   let color = '#';

//   // Generate random values for each of the six hexadecimal digits
//   for (let i = 0; i < 6; i++) {
//     const randomIndex = Math.floor(Math.random() * 16);
//     color += letters[randomIndex];
//   }

//   return color;
// }

// $.each($('div'), function () {
//   $(this).css('border', '2px solid ' + getRandomColor().toString())
// });
