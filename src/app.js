$(document).ready(function() {
  // para deslogear al usuario cada vez que entre a la página
  /*firebase.auth().signOut();*/
  $('select').material_select();
  /*$('.web').hide();
  $('.clase2').hide();*/
});
// Definiendo variables
let lat;
let lng;
let st;
let spf;

// Al hacer click en el boton de registro con google:
document.getElementById('login').addEventListener('click', GoogleSignUp, false);
// Initialize Firebase
var config = {
  apiKey: 'AIzaSyC9DuOb1sFOe-0_rETYXkM44mtcK3CNkto',
  authDomain: 'producto-final-spa.firebaseapp.com',
  databaseURL: 'https://producto-final-spa.firebaseio.com',
  projectId: 'producto-final-spa',
  storageBucket: 'producto-final-spa.appspot.com',
  messagingSenderId: '296248454562'
};
firebase.initializeApp(config);
// función de ingreso con google
var token = 'none';
var user = 'none';
var email = 'none';
// guardar los usuarios que se registren
var userData = firebase.database().ref('users');
function GoogleSignUp() {
  // para saber si el usuario se ha conectado
  if (!firebase.auth().currentUser) {
    var provider = new firebase.auth.GoogleAuthProvider();
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
      var errorCode = error.code;
      var errorMessage = error.message;
      var errorEmail = error.email;
      var credencial = error.credencial;
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
  // var lat = $('#lat').val();
  // var lng = $('#lng').val();
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
      // transformar a la hora local
      var dateFormat = 'YYYY-DD-MM HH:mm:ss';
      var testDateUtc = moment.utc(response.result.uv_max_time);
      var localDate = testDateUtc.local();
      console.log(localDate.format(dateFormat));

      // Nivel UV Color Change Section Function
      if (response.result.uv <= 3) {
        $('#colorChange').css('background-color', '#558b2f');
      } else if (response.result.uv > 3 && response.result.uv <= 6) {
        $('#colorChange').css('background-color', '#F9A825');
      } else if (response.result.uv > 6 && response.result.uv <= 8) {
        $('#colorChange').css('background-color', '#EF6C00');
      } else if (response.result.uv > 8 && response.result.uv <= 11) {
        $('#colorChange').css('background-color', '#B71C1C');
      } else if (response.result.uv > 11) {
        $('#colorChange').css('background-color', '#6A1B9A');
      }
    },
    error: function(response) {
    }
  });
}
// console.log(pos.lat);
// console.log(pos.lng);
function getExposureIndex() {
  /* var lat = -33.42;
  var lng = -70.64;*/
  $.ajax({
    type: 'GET',
    dataType: 'json',
    beforeSend: function(request) {
      request.setRequestHeader('x-access-token', '08348c47f225e7586167240ec3bcd0de');
    },
    url: 'https://api.openuv.io/api/v1/exposure?lat=' + lat + '&lng=' + lng + '&st=' + st + '&spf=' + spf,
    success: function(response) {
      // handle successful response
      console.log(response.result)
    },
    error: function(response) {
      // handle error response
    }
  });
}

// borrar
searchPosition()