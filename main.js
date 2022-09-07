
var queNo = 0;
var score = 0;
var jsonQuestionObject;
var totalque;
var userAnswerMap = new Map();

function loadBody() {
  $("#login").load("login.html");
  document.getElementById("tot").style.display = "none";
  $.ajax({
    type: 'post',
    url: 'average.php',
    data: {
      updateTotalCount: "usersCount"
    },
    success: function(response) {
      $('#usersCount').html(response);
    }
  });

}

function validateUser() {
  var userId = document.getElementById("userId").value;
  var userPass = document.getElementById("passId").value;
  let flag = 0;

  $.getJSON("auth.json", function(data, status) {
    var jsonDataObject = data;
    if ((userId == jsonDataObject['uid']) && (userPass == jsonDataObject['upass'])) {
      $("#btnSubmitId").removeClass("btn-danger").addClass("btn-success");
      // alert("login success");
      $("#login").load("rules.html");
      document.getElementById("tot").style.display = 'block';
      flag = 1;
    } else {
      $("#btnSubmitId").removeClass("btn-success").addClass("btn-danger");
      flag = 0;
      alert("login failed");
      console.log(userId + "-" + jsonDataObject['uid']);
    }
  });

  if (flag == 0) {
    return false;
  } else {
    return true;
  }
}

function validateCheck() {
  var checkTnc = document.getElementById("agree");
  if (checkTnc.checked == false) {
    $("#chec").addClass("alert alert-danger");
  } else {
    $("#chec").removeClass("alert alert-danger");
  }
}

function startQuiz(quiz, from, length, totquestions) {
  var checkTnc = document.getElementById("agree");
  if (checkTnc.checked != true) {
    $("#chec").addClass("alert alert-danger");
  } else {
    $("#chec").removeClass("alert alert-danger");
    document.getElementById("tot").style.display = "none";
    $("#login").load("ques.html", function() {
      loadFirstQuestion(quiz, from, length, totquestions);
    });
  }
}

function loadFirstQuestion(quiz, from, length, totquestions) {

  $.getJSON(quiz + ".json", function(data, status) {
    shuffled = shuffleQuestions(subQuestion(data, from, length));
    jsonQuestionObject = (totquestions > 0 ? subQuestion(shuffled, 0, totquestions) : shuffled);

    totalque = Object.keys(jsonQuestionObject).length;
    $("#quesId").html(jsonQuestionObject[queNo].que);
    $("#opt1Id").html(jsonQuestionObject[queNo].options[0]);
    $("#opt2Id").html(jsonQuestionObject[queNo].options[1]);
    $("#opt3Id").html(jsonQuestionObject[queNo].options[2]);
    $("#opt4Id").html(jsonQuestionObject[queNo].options[3]);
    initlizeUserAnswerMap();
  });
}


function initlizeUserAnswerMap() {
  for (var i = 0; i < totalque; i++) {
    userAnswerMap.set(i, undefined);
  }
}


function nextQuestion() {

  var optionsRadioGroup = document.getElementsByName("ansOption");
  for (var i = 0; i < optionsRadioGroup.length; i++) {
    if (optionsRadioGroup[i].checked == true) {
      userAnswerMap.set(queNo, i);
    }
  }

  queNo++;
  if (queNo == totalque - 1) {
    document.getElementById("btnNext").value = "Finish Quiz";
  } else {
    document.getElementById("btnPrev").disabled = false;
  }
  clearAllRadioBtns();

  if (queNo == totalque) {
    $("#login").load("result.html", function() {
      document.getElementById("tot").style.display = 'block';
      insertRowsInTable();
    });
  }

  if (userAnswerMap.get(queNo) != undefined) {
    var optionsRadioGroup = document.getElementsByName("ansOption");
    optionsRadioGroup[userAnswerMap.get(queNo)].checked = true;
  }
  (document.getElementById("crtAnsDiv")).style.display = 'none';

    if(queNo < jsonQuestionObject.length) {
      $("#quesId").html(jsonQuestionObject[queNo].que);
      $("#opt1Id").html(jsonQuestionObject[queNo].options[0]);
      $("#opt2Id").html(jsonQuestionObject[queNo].options[1]);
      $("#opt3Id").html(jsonQuestionObject[queNo].options[2]);
      $("#opt4Id").html(jsonQuestionObject[queNo].options[3]);
    }
}

function previousQuestion() {

    var optionsRadioGroup = document.getElementsByName("ansOption");
    for (var i = 0; i < optionsRadioGroup.length; i++) {
      if (optionsRadioGroup[i].checked == true) {
        userAnswerMap.set(queNo, i);
      }
    }
    queNo--;
    if (queNo == 0) {
      document.getElementById("btnPrev").disabled = true;
    } else {
      document.getElementById("btnPrev").disabled = false;
      document.getElementById("btnNext").value = "Next";
    }
    clearAllRadioBtns();

  if (userAnswerMap.get(queNo) != undefined) {
    var optionsRadioGroup = document.getElementsByName("ansOption");
    optionsRadioGroup[userAnswerMap.get(queNo)].checked = true;
  }
  (document.getElementById("crtAnsDiv")).style.display = 'none';
    $("#quesId").html(jsonQuestionObject[queNo].que);
    $("#opt1Id").html(jsonQuestionObject[queNo].options[0]);
    $("#opt2Id").html(jsonQuestionObject[queNo].options[1]);
    $("#opt3Id").html(jsonQuestionObject[queNo].options[2]);
    $("#opt4Id").html(jsonQuestionObject[queNo].options[3]);
}

function showAnswer(n) {
  (document.getElementById("crtAnsDiv")).style.display = 'block';

    var 
	//selected = jQuery("#opt" + n + "Id").html(),
	selected = jsonQuestionObject[queNo].options[n-1],
	panel = jQuery("#crtAnsDiv"),
	ans = jsonQuestionObject[queNo].ans
	isCorrect = (selected == ans);

    console.log("#" + queNo + " " + n + ". " + selected + " ## " + ans + " :: " + isCorrect);

    if(isCorrect) {
	panel.addClass('alert-success');
	panel.removeClass('alert-warning');
	$("#crtAns").html("Correct Answer");
    }
    else {
	panel.removeClass('alert-success');
	panel.addClass('alert-warning');
	$("#crtAns").html("Wrong Answer");
    }
}

function clearAllRadioBtns() {
  var optionsRadioGroup = document.getElementsByName("ansOption");
  for (var i = 0; i < optionsRadioGroup.length; i++) {
    if (optionsRadioGroup[i].checked == true) {
      optionsRadioGroup[i].checked = false;
    }
  }
}

function insertRowsInTable() {
  var table = document.getElementById("resultTable");
  for (var i = 0; i < totalque; i++) {
    var row = table.insertRow(i + 1);
    for (var j = 0; j < 3; j++) {
      var cell = row.insertCell(j);
      if (j == 0) {
        cell.innerHTML = i + 1;
      }
      if (j == 1) {
        cell.innerHTML = jsonQuestionObject[i].queno + ". " + jsonQuestionObject[i].options[userAnswerMap.get(i)];
      }
      if (j == 2) {
        if (jsonQuestionObject[i].options[userAnswerMap.get(i)] == jsonQuestionObject[i].ans) {
          cell.innerHTML = "1 Mark";
          row.className = "alert alert-success";
          score++;
        } else {
          cell.innerHTML = "0 Mark";
          row.className = "alert alert-danger";
        }
      }
    }
  }
  showUserResult();
}

function showUserResult() {
  var uResult = (score / totalque) * 100;
  if (uResult >= 70) {
    $("#resultPnl").removeClass("bg-primary").addClass("alert-success");
    (document.getElementById("usrRemark")).innerHTML = "Excellent Job !! You are doing Great";
  } else if (uResult < 70 && uResult >= 50) {
    $("#resultPnl").removeClass("bg-primary").addClass("alert-warning");
    (document.getElementById("usrRemark")).innerHTML = "Good Job !! You can do Better";
  } else if (uResult < 50) {
    $("#resultPnl").removeClass("bg-primary").addClass("alert-danger");
    (document.getElementById("usrRemark")).innerHTML = "Upsss !! You need Serious Improvement";
  }

  (document.getElementById("ttlQuestion")).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Total number of Questions : " + totalque;
  (document.getElementById("uncorrAns")).innerHTML = "Total number of Wrong Answer : " + (totalque - score);
  (document.getElementById("corrAns")).innerHTML = "Total number of Correct Answer : " + score;
  $.ajax({
    type: 'post',
    url: 'average.php',
    data: {
      updateYourScore: uResult
    },

    success: function(response) {
      $('#usrResult').html(response);
    }
  });
}

function subQuestion(data, from, length) {
    var result = data.slice(from, from + length);
    // result = data;
    console.log("FROM: " + from + " --- Length: " + length + " >> " + result.length);

    return result;
}

function shuffleQuestions(data) {
    var result = shuffleArray(data)

    for(var i=0; i<result.length; i++) {
	var current = result[i], 
	    opts = current.options;

	if(opts.length == 1) {
	    opts[1] = "";
	    opts[2] = "";
	    opts[3] = "";
	}

	current.options = shuffleArray(opts);
	result[i] = current;
    }

    return result;
}

function shuffleArray(arr) {
  for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);

  return arr;
}
