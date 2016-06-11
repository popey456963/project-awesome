var options = {};

$(function() {
	$("form").on("submit", function(e) {
		e.preventDefault();

		var last = false;

		var thisOption = $(".option:not(.hidden)");
		console.log(thisOption.data("option"));

		var input = thisOption.find("input");
		if (input.length == 0) input = thisOption.find("select");
		if (thisOption.data("option") != "name") options[input.val()] = true;
		else options.name = input.val();
		if (thisOption.data("index") == "8") last = true;

		if (thisOption.data("index") == "1") {
			$("#title").html('Select your <span id="project-option" class="code">project name</span> for <span id="project-name" class="code"></span>')
			$("#title").show().fadeIn(200);
			$("#project-name").fadeOut(200, function() {
				$(this).text(input.val()).fadeIn(200);
			});
		}

		var parent = input.parent();
		var nextOption = $(".option[data-index='" + (parseInt(parent.data("index")) + 1) + "'");

		$("#project-option").fadeOut(200, function() {
			$(this).text(nextOption.find("label").text().toLowerCase()).fadeIn(200);
		});

		parent.toggleClass("hidden");

		(function(el) {
			setTimeout(function() {
				$(el).addClass("hide");
			}, 400);
		})(parent);

		nextOption.toggleClass("hide").toggleClass("hidden");
		$(".button-primary").focus();

		if (last) {
			$(".button-primary, #title").fadeOut(200);
			$.ajax({
				url: "/getApp",
				method: "POST",
				data: options,
			}).done(function(data) {
				console.log(data);
				$("#package").attr("href", data);
			});
		}

		return false;
	});
});