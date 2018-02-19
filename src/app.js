$(document).ready(function() {
  // para deslogear al usuario cada vez que entre a la página
  firebase.auth().signOut();
  $('.web').hide();
});

// Al hacer click en el boton de registro con google:
document.getElementById('init').addEventListener('click', GoogleSignUp, false);
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
      $('.inicio').hide() && $('.web').show();
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
// buscar la posición
function searchPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      console.log(pos.lat);
      console.log(pos.lng);
    });
  }
}

/* function getUVIndex() {
 var lat = -33.42;//$('#lat').val();
 var lng = -70.64;//$('#lng').val();

 $.ajax({
   type: 'GET',
   dataType: 'json',
   beforeSend: function(request) {
     request.setRequestHeader('x-access-token', '08348c47f225e7586167240ec3bcd0de');
   },
   url: 'https://api.openuv.io/api/v1/uv?lat=' + lat + '&lng=' + lng + '&alt=',
   success: function(response) {
     console.log(response);
     //handle successful response
   },
   error: function(response) {
     // handle error response
   }
 });
}
getUVIndex();*/
