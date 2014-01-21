function showSearchTerms() {
	var searchTerms = document.getElementsByClassName('searchTerm');
	for (i = 0; i < searchTerms.length; i++){
		var searchTermContext = searchTerms[i].getContext("2d");
		searchTermContext.fillStyle="#EEEEEE";
		searchTermContext.fillRect(30, 20, 200, 200);
	}
}
// String.prototype.format = function (args) {
// 			var str = this;
// 			return str.replace(String.prototype.format.regex, function(item) {
// 				var intVal = parseInt(item.substring(1, item.length - 1));
// 				var replace;
// 				if (intVal >= 0) {
// 					replace = args[intVal];
// 				} else if (intVal === -1) {
// 					replace = "{";
// 				} else if (intVal === -2) {
// 					replace = "}";
// 				} else {
// 					replace = "";
// 				}
// 				return replace;
// 			});
// 		};
// String.prototype.format.regex = new RegExp("{-?[0-9]+}", "g");
// String.prototype.format = function () {
//   var args = arguments;
//   return this.replace(/\{(\d+)\}/g, function (m, n) { return args[n]; });
// };

function allowDrop(event)
{
	event.preventDefault();
}
function drag(event)
{
	event.dataTransfer.setData("Text",event.target.id);
}
function drop(event)
{
	event.preventDefault();
	var data=event.dataTransfer.getData("Text");
	event.target.appendChild(document.getElementById(data));
}

var semesters;
function insertSemester(i){
	var toInsert = document.createElement('div');
	toInsert.innerHTML = '<div class="col-sm-5"><div class="alert alert-info" id="n' + i + '">Semester ' + i + ': <div class="ch" id="credn' + i + '"><center>0 Credit Hours</center></div></div></div>';
	document.getElementById("semester").appendChild(toInsert);
}

function deleteSemester(){
	var idToCheck = document.getElementById("semester").lastElementChild.id;
	if (idToCheck === "n2"){
		document.getElementById("delete").disabled = true;
	}
	var lastElement=document.getElementById("semester").lastElementChild;
	document.getElementById("semester").removeChild(lastElement);
}

function setHeight(){
	var heightNeeded = window.innerHeight- document.getElementsByTagName('footer')[0].style.height - document.getElementsByClassName('alert alert-success')[0].style.height - document.getElementsByClassName('navbar navbar-inverse navbar-fixed-top')[0].style.height -280;
	document.getElementById("resultsScroll").style.height = ((heightNeeded) + "px");
}

function setInitialTableHeight(){
	var heightNeeded2 = window.innerHeight- document.getElementsByTagName('footer')[0].style.height - document.getElementsByClassName('navbar navbar-inverse navbar-fixed-top')[0].style.height - 148;
	document.getElementById("mainInterface").style.height = ((heightNeeded2) + "px");
}

function deleteClass(value){
	$(value).remove();
}

function truncHtml(str){
	return str.split('<')[0];
}

$(document).ready(function() {
	setHeight();
	setInitialTableHeight();
	semesters = 8;
	maxval = 30
	for (var i = 2; i <= 8; i++) {
		insertSemester(i);
	}
	for (var i = 9; i <= maxval; i++) {
		insertSemester(i);
		$("#n"+i).hide();
	}

	var st = "#results";
	for (var i = 1; i <= maxval; ++i) {
		st += ", #n" + i;
	}
    $(st).disableSelection();
    $(st).sortable({connectWith: ".alert", cancel: ".ch"});

	$("#search").bind("change paste keyup blur", function() {
		$.getJSON($SCRIPT_ROOT + '/_search', {
			query: $("#search").val()
			    }, function(data) {
			var res = data.result;
			var arr = res.split('@');
			// Get all selected courses
			var selected = [];
			$.each($("#semester").find(".list-group-item"), function(index, item) {
				selected.push(item.innerHTML.replace(/&amp;/, "&"));
			});
			// Print filtered results
			$("#results").empty();
			for (var i = 0; i < arr.length; i++) {
				if (selected.map(truncHtml).indexOf(arr[i]) == -1) {
			    	$("#results").append('<li class="list-group-item">' + arr[i] + '<span class="glyphicon glyphicon-remove" style="float:right;"></span></li>');
			    }
			}
			// Display
			$("#output").val(data.result);
		return false;
	    });
	});

	$(document).on('click','.glyphicon', function(){
		$(this).closest('li').remove()
	});

	$(document).on('dblclick', '.list-group-item', function() {
		var name = $(this).text().split(' -')[0].replace(" ", "");
		$.getJSON($SCRIPT_ROOT + '/_desc', {
				query: name
			}, function(data) {
				var desc = data.result.split('@')[0];
				$("#courseNameHead").empty();
				$('#courseNameHead').append(name);
				$('#courseDescriptionContent').empty();
				$('#courseDescriptionContent').append(desc);
				$('#coursedescriptionDialog').modal("show");
			});
	});

	$("#access").click(function(){
		$("#drop").empty();
		console.log("Loop");
		var courses=Array();
		for(var i=1; i<=semesters; i++){
			var element=$('#n'+i).children('li');
				//console.log(element);
				for (var j = 0; j < element.length; j++) {
				 	courses.push(element[j].innerHTML);
			 	}
			}
		$.getJSON($SCRIPT_ROOT+'/_access',{
			query: courses.toString()
		}, function(data){
			var res= data.result;
			var arr= res.split("@");

			var assessment='\
			TOTAL CREDIT HOURS:'+arr[1]+'<br>';
			if (parseInt(arr[1])>128){
				assessment+="You will successfully graduate from here";
			}else{
				assessment+="You need more credit for graduation";
			}
			// '+arr[2]+':'+arr[3]+'<br>\
			// '+arr[4]+':'+arr[5]+'<br>\
			// '+arr[6]+':'+arr[7]+'<br>\
			// '+arr[8]+':'+arr[9]+'<br>\
			// '+arr[10]+':'+arr[11]+'<br>\
			// '+arr[12]+':'+arr[13]+'<br>\
			// '+arr[14]+':'+arr[15]+'<br>\
			// '+arr[16]+':'+arr[17]+'<br>';

			$('#creditassessmentContent').empty();
			$('#creditassessmentContent').append(assessment);
			$('#creditassessmentDialog').modal('show');
			$('#drop').append(assessment);
		});
		return false;
	});

	$("#search").click(function() {
	    $(".jumbotron").slideUp("slow");
	    $(".jumbotron").hide(400);
	});

	
	$(document).on('load mouseover hover deleteAll', '.alert.alert-info', function() {
		// Add credit hours information to each semester
			var id = this.id;
			var selected = []
			$.each($(this).find(".list-group-item"), function(index, item) {
				selected.push(item.innerHTML.split(" -")[0].replace(" ", ""));
			});
			$.getJSON($SCRIPT_ROOT+'/_access',{
				query: selected.toString()
			}, function(data){
				var res= data.result.split("@")[1];
				$("#cred"+id).empty();
				$("#cred"+id).append('<center class="ch">' + res + ' Credit Hours' + '</center>');
			});
	});

	$(".navhome").click(function(){
		$(".jumbotron").slideDown("slow");
		$(".jumbotron").show(400);
	});

	$("#add").click(function(){
		semesters++;
		$("#n"+semesters).show();
	});

	$("#delete").click(function(){
		$("#n"+semesters).hide();
		semesters--;
	});

	$("#deleteAll").on('click', function(){
		$(".alert.alert-info").children().filter(":not(.ch)").remove()
		$(".alert.alert-info").trigger("deleteAll");
	});
		// for (i = 1; i <= semesters; i++){
		// 	deleteSemester();
		// }
		// $(document).refresh();
		// for (i = 1; i <= semesters; i++){
		// 	insertSemester(i);
		// }
});
	// $("#deleteAll").click(function(){
	// 	// $.each($(id).find(".list-group-item"), function(index, item) {
	// 	// 		selected.push(item.innerHTML.split(" -")[0].replace(" ", ""));
	// 	// 	});
	// 	// $.each($("#semester").find(".list-group-item"), function(index, item) {
	// 	// 		selected.push(item.innerHTML.replace(/&amp;/, "&"));
	// 	// 	});
	// 	$.each($("#semester").on('click', '.list-group-item")', function() {
	// 			$("#semester").chldren.hide();
	// 	});
	// });

