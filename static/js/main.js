var options = {};

$(function(){
	$("form").on("submit", function(e){
		e.preventDefault();

		var last = false;

		var thisOption = $(".option:not(.hidden)");
		console.log(thisOption.data("option"));

		var input = thisOption.find("input");
		if (input.length == 0) input = thisOption.find("select");
		options[thisOption.data("option")] = input.val();
		if (thisOption.data("index") == "8") last = true;

		if (thisOption.data("index") == "1") {
			$("#title").show().fadeIn(200);
			$("#project-name").fadeOut(200, function(){
				$(this).text(input.val()).fadeIn(200);
			});
		}

		var parent = input.parent();
		var nextOption = $(".option[data-index='" + (parseInt(parent.data("index"))  + 1) + "'");		

		$("#project-option").fadeOut(200, function(){
			$(this).text(nextOption.find("label").text().toLowerCase()).fadeIn(200);
		});

		parent.toggleClass("hidden");

		(function(el){
			setTimeout(function(){
				$(el).addClass("hide");
			}, 400);
		})(parent);

		nextOption.toggleClass("hidden").toggleClass("hide");

		if (last) {
			$(".button-primary, #title").fadeOut(200);
			$.post("/getApp", options, function(data){
				console.log(data);
				$("#package").attr("href", "this is where the URL to download from is <3");
			});
		}

		return false;
	});
});