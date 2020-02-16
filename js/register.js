const axios = require('axios').default;

var userName_ = document.getElementById('userName').value;
var userPwd = document.getElementById('userPwd').value;
var userEmail = document.getElementById('userEmail').value;
var userWeight = document.getElementById('userWeight').value;
var userHeight = document.getElementById('userHeight').value;


var userGender = document.getElementsByName('userSex');

for (var i = 0, length = userGender.length; i < length; i++) {
  if (userGender[i].checked) {
    // do whatever you want with the checked radio
    // alert(userGender[i].value);
    var checkedSex = userGender[i].checked;

    // only one radio can be logically checked, don't check the rest
    break;
  }
}

axios.post('/register', {
    username: userName_,
    password: userPwd,
    email: userEmail,
    weight: userWeight,
    height: userHeight,
    gender: checkedSex,
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
