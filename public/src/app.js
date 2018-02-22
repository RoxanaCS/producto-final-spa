$(document).ready(function() {
  // para deslogear al usuario cada vez que entre a la página
  firebase.auth().signOut();
  $('select').material_select();
  $('.web').hide();
  $('.clase2').hide();
  $('.parallax').parallax();       
});
// Definiendo letiables
let lat;
let lng;
let st;
let spf;

// Al hacer click en el boton de registro con google:
document.getElementById('login').addEventListener('click', GoogleSignUp, false);
// Initialize Firebase
let config = {
  apiKey: 'AIzaSyC9DuOb1sFOe-0_rETYXkM44mtcK3CNkto',
  authDomain: 'producto-final-spa.firebaseapp.com',
  databaseURL: 'https://producto-final-spa.firebaseio.com',
  projectId: 'producto-final-spa',
  storageBucket: 'producto-final-spa.appspot.com',
  messagingSenderId: '296248454562'
};
firebase.initializeApp(config);
// función de ingreso con google
let token = 'none';
let user = 'none';
let email = 'none';
// guardar los usuarios que se registren
let userData = firebase.database().ref('users');
function GoogleSignUp() {
  // para saber si el usuario se ha conectado
  if (!firebase.auth().currentUser) {
    let provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    firebase.auth().signInWithPopup(provider).then(function(result) {
      token = result.credential.accessToken;
      user = result.user;
      email = user.email;
      $('.inicio').hide();
      $('.web').show();
      $('.clase2').show();
      // función para localizar la posición del usuario
      searchPosition();
      activateSearch();
      // guardar la foto, nombre y corre de usuario en firebase
      userData.orderByChild('email').equalTo(user.email).on('value', function(snapshot) {
        // ver todos los datos que se obtienen del usuario
        console.log(snapshot.val());
        if (snapshot.val() === null) {
          userData.push({
            photo: user.photoURL,
            name: user.displayName,
            email: user.email
          });
        } else {
        }
      });
      // sacar el nombre de usuario
      console.log(user.displayName);
      // sacar la foto de usuario
      console.log(user.photoURL);
    }).catch(function(error) {
      let errorCode = error.code;
      let errorMessage = error.message;
      let errorEmail = error.email;
      let credencial = error.credencial;
      // console.log(errorCode);
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert('Es el mismo usuario');
      }
    });
  } else {
    firebase.auth().signOut();
  }
}
// salir de la sesión
$('#logout').click(function() {
  firebase.auth().signOut();
  $('.inicio').show();
  $('.web').hide();
  $('.clase2').hide();
});
// Función select skinTone
$('#skinTone').on('change', function() {
  st = $('#skinTone').val();
  getExposureIndex();
});
// Función select SPF
$('#sunProtectionFactor').on('change', function() {
  spf = $('#sunProtectionFactor').val();
  getExposureIndex();
});
// buscar la posición
function searchPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      lat = pos.lat;
      lng = pos.lng;
      getUVIndex();
    });
  }
}
// Safe Exposure Time
function getUVIndex() {
  // let lat = $('#lat').val();
  // let lng = $('#lng').val();
  // let st = 1;
  // let spf = 15;
  $.ajax({
    type: 'GET',
    dataType: 'json',
    beforeSend: function(request) {
      request.setRequestHeader('x-access-token', '08348c47f225e7586167240ec3bcd0de');
    },
    url: 'https://api.openuv.io/api/v1/uv?lat=' + lat + '&lng=' + lng + '&alt=',
    success: function(response) {
      console.log(response);
      console.log(response.result.uv);
      console.log(response.result.uv_max);
      console.log(response.result.uv_max_time);

      circleDisplay(response);
      uvColor(response);
      maxActNumbers(response.result)
    },
    error: function(response) {
    }
  });
}
// console.log(pos.lat);
// console.log(pos.lng);
function getExposureIndex() {
  /* let lat = -33.42;
  let lng = -70.64;*/
  $.ajax({
    type: 'GET',
    dataType: 'json',
    beforeSend: function(request) {
      request.setRequestHeader('x-access-token', '08348c47f225e7586167240ec3bcd0de');
    },
    url: 'https://api.openuv.io/api/v1/exposure?lat=' + lat + '&lng=' + lng + '&st=' + st + '&spf=' + spf,
    success: function(response) {
      // handle successful response
      console.log(response.result);
      displayMinutes(response.result);
    },
    error: function(response) {
      // handle error response
    }
  });
}
// para buscar cualquier dirección y buscar el uv ahí
$('#search').on('click', function() {
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${$('#startInput').val()}&key=AIzaSyDKOv5tv0rN5Mih51I-c6XHKhxCqa-AEC8`)
    .then(function(response) {
    // Turns the the JSON into a JS object
      return response.json();
    })
    .then(function(data) {
      console.log(data);
      lat = data.results[0].geometry.location.lat;
      lng = data.results[0].geometry.location.lng;
      getUVIndex();
    })
    .catch(function(error) {
    });
});
// función para autocompletar
function activateSearch() {
  let startInput = document.getElementById('startInput');
  new google.maps.places.Autocomplete(startInput);
}

function displayMinutes(data) {
  let timeToShow;
  let hours;          
  let minutes;
  if (data.exposure_time != null) {
    hours = Math.floor(data.exposure_time / 60);          
    minutes = data.exposure_time % 60;
    timeToShow = `${hours}Hrs y ${minutes} min`;
  }else {
    timeToShow = 'Indefinido';
  }
   $('.recommendationTime').text(timeToShow);
  // console.log(data.exposure_time == null)
};
function uvColor(data) {
  // Nivel UV Color Change Section Function
  if (data.result.uv <= 3) {
    $('body').css('background-color', '#558b2f');
    $('.indexNowFocus').html('Índice Bajo');
  } else if (data.result.uv > 3 && data.result.uv <= 6) {
    $('.indexNowFocus').html('Índice Moderado');
    $('body').css('background-color', '#F9A825');
  } else if (data.result.uv > 6 && data.result.uv <= 8) {
    $('.indexNowFocus').html('Índice Alto');
    $('body').css('background-color', '#EF6C00');
  } else if (data.result.uv > 8 && data.result.uv <= 11) {
    $('.indexNowFocus').html('Índice Muy Alto');
    $('body').css('background-color', '#B71C1C');
  } else if (data.result.uv > 11) {
    $('.indexNowFocus').html('Índice Extremadamente Alto');
    $('body').css('background-color', '#6A1B9A');
  }
}
function circleDisplay(data) {
  let widthCircle;
  if ($(document).width() > 576) {
    widthCircle = 250;
  } if ($(document).width() < 576 && $(document).width() > 300) {
    widthCircle = 130;
  } 
  $('#circle').circleProgress({
    value: ((data.result.uv * 100) / 11) / 100,
    size: widthCircle,
    thickness: 40,
    fill: {
      image: 'src/images/uvColor.png',
    }
  });
};
function maxActNumbers(data) {
  // transformar a la hora local
  let dateFormat = 'HH:mm';
  let testDateUtc = moment.utc(data.uv_max_time);
  let localDate = testDateUtc.local();
  // console.log(localDate.format(dateFormat));

  $('.max').html(Math.floor(data.uv_max));
  $('.actual').html(Math.floor(data.uv));
  $('.maxTime').html(`A las: ${localDate.format(dateFormat)}`);
  $('.actualTime').html(`A las: ${moment().format('HH:mm')}`)
}
// function timeLeft() {

//   // console.log(('' + (199/60)).split('.')[0] + " Hrs")
//   // console.log((199/60 - parseInt(('' + (90/60)).split('.')[0])) * 60 + " Min")
// };