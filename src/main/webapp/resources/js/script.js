(function() {
	var periodicalExecutor = null;
	var lastLine = 0;
	var file = "server.log";

	function isAdmin(){
		
	}
	
	
	
	$("document").ready(function() {
		var admin = false;
		FLUIGC.ajax({
                url: '/api/public/social/user/logged/v2',
                contentType: 'application/json',
				async: false
            }, function(err, data) {
			if(data == null){
				admin = false;
			}
			if(data != null){
				var isAdmin = data.content.tenantAdmin;
				if(isAdmin == false){
					admin = false;
				}else{
					admin = true;
				}
                
			}
            });
		
		
		
		
		if(!admin){
			var response = $("<h3>Usuário sem permissão de visualização do log</h3>");
			$('#widget_content').replaceWith(response);
		}
		else{
			getLog();
			listLogs();
			reloadLog();
		

			$("#listFiles").on("change", function() {
				lastLine = 0;
				file = this.value;
				$(".log-content").html("");
				periodicalExecutor.stop();
				getLog();
				reloadLog();
			});

			$("#highlightLog").on("click", function() {
				periodicalExecutor.stop();
				openModal();
			});
			$("#downloadLog").on("click", function() {
				location.href = "/log_fluig/rest/log/download/" + file;
			});

			$(window).scroll(function() {
				if ($(window).scrollTop() + $(window).height() == $(document).height()) {
					$("#autoScroll").prop("checked", true);
				} else {
					$("#autoScroll").prop("checked", false);
				}
			});

			$("#autoScroll").on("change", function() {
				autoScroll();
			});
		}
	});

	function getLog() {
		$.get("/log_fluig/rest/log/show/" + lastLine + "/" + file).success(function(data) {
			if (data) {
				appendLinesToLog(data);
				if (document.title != "Mostrando " + data.logPath)
					document.title = "Mostrando " + data.logPath;
			}
		}).error(function(xhr) {
			console.log(xhr);
		});

	}

	function appendLinesToLog(data) {
		if (lastLine == 0) {
			for (var i = 0; i < data.log.length; i++){
				var hasTab = data.log[i].indexOf("\\t") > -1 ? "style='padding-left:15px !important;'":"";
				$(".log-content").append("<span class='new-line' " + hasTab + ">" + data.log[i].replace(/\\t/g, '') + "</br></span>");
			}

			$("html, body").animate({
				scrollTop : $("body").height()
			}, 100);
			applyHighlight();
		} else {
			var totalLines = data.log.length;
			$.each($(".log-content span"), function(i, e) {
				if (totalLines > 0) {
					$(e).remove();
					totalLines--;
				}
			});
			for (var i = 0; i < data.log.length; i++){
				var hasTab = data.log[i].indexOf("\\t") > -1 ? "style='padding-left:15px !important;'":"";
				$(".log-content").append("<span class='new-line' " + hasTab + ">" + data.log[i].replace(/\\t/g, '') + "</br></span>");
			}
			applyHighlightNew();
		}
		lastLine = data.lastLine;
		autoScroll();
	}

	function autoScroll() {
		if ($("#autoScroll").is(":checked")) {
			$("html, body").animate({
				scrollTop : $("body").height()
			}, 100);
		}
	}
	
	

	function listLogs() {
		$.get("/log_fluig/rest/log/list").success(function(data) {
			if (data) {
				var exist = false;
				for (var i = 0; i < data.length; i++) {
					$("#listFiles").append("<option value='" + data[i] + "'>" + data[i] + "</option>")
					if (data[i] == "server.log")
						exist = true;
				}
			}

			if (exist) {
				$("#listFiles").val("server.log");
			}
		}).error(function(xhr) {
			console.log(xhr);
		});
	}

	function reloadLog() {
		periodicalExecutor = FLUIGC.periodicalExecutor(function() {
			getLog();
		}, 5);
		periodicalExecutor.start();
	}

	function openModal() {
		var logModal = FLUIGC.modal({
			title : 'Marcar texto no log',
			content : $(".highlight-template").html(),
			id : 'log-modal',
			size : 'large',
			actions : [ {
				'label' : 'Fechar',
				'autoClose' : true,
				'classType' : 'btn btn-primary close-button'
			} ]
		}, function(err, data) {
			if (!err) {
				bindColorpicker();
				loadColors();
				$("#addHighlight").on("click", function() {
					addHighlight();
				});
				$(".close-button").on("click", function(){
					periodicalExecutor.start();
				});
			}
		});
	}

	function bindColorpicker() {
		var settingsFont = {
			changeDelay : 200,
			control : 'wheel',
			defaultValue : '#000000',
			inline : false,
			letterCase : 'lowercase',
			opacity : false,
			position : 'bottom left'
		}
		var fontColorpicker = FLUIGC.colorpicker('#colorpickerFont', settingsFont);

		var settingsBackground = {
			changeDelay : 200,
			control : 'wheel',
			defaultValue : '#ffffff',
			inline : false,
			letterCase : 'lowercase',
			opacity : true,
			position : 'bottom left'
		}
		var backgroundColorpicker = FLUIGC.colorpicker('#colorpickerBackground', settingsBackground);
	}

	function addHighlight() {
		if (FLUIGC.localStorage.getItem("highlight-log") == null) {
			FLUIGC.localStorage.setItem("highlight-log", {
				colorList : []
			});
		} else {
			if ($("#highlightText").val() == "") {
				FLUIGC.toast({
					message : "Informe um texto para ser marcado",
					type : "warning"
				});
			} else {
				var colorList = FLUIGC.localStorage.getItem("highlight-log").colorList.slice();
				colorList.push({
					text : $("#highlightText").val(),
					font : $("#colorpickerFont").val(),
					background : $("#colorpickerBackground").val()
				});
				FLUIGC.localStorage.setItem("highlight-log", {
					colorList : colorList
				});
			}
			loadColors();
			applyHighlight();
		}
	}

	function loadColors() {
		var data = FLUIGC.localStorage.getItem("highlight-log") == null ? [] : FLUIGC.localStorage.getItem("highlight-log").colorList;
		var colorTable = FLUIGC.datatable('#highlightList', {
			dataRequest : data,
			renderContent : ".table-tamplate",
			search : {
				enabled : false
			},
			scroll : {
				enabled : false
			},
			actions : {
				enabled : false
			},
			navButtons : {
				enabled : false
			},
			emptyMessage : '<div class="text-center">Nenhuma marca\u00E7\u00E3o adicionada</div>',
			header : [ {
				'title' : 'Marca\u00E7\u00F5es',
				'size' : 'col-md-11'
			}, {
				'title' : '',
				'size' : 'col-md-1'
			} ]
		}, function(err, data) {
			$(".remove-highlight").on("click", function() {
				setTimeout(function(){
					var rows = colorTable.selectedRows();
					removeHighlight(colorTable, rows[0]);
				}, 50);
			});
		});
	}

	function removeHighlight(colorTable, row) {
		var newColorList = new Array();
		var colorList = FLUIGC.localStorage.getItem("highlight-log").colorList.slice();
		for (var i = 0; i < colorList.length; i++) {
			if (i == row)
				continue;
			newColorList.push(colorList[i]);
		}
		FLUIGC.localStorage.setItem("highlight-log", {
			colorList : newColorList
		});
		loadColors();
		clearHighlight();
		applyHighlight();
	}
	
	function applyHighlight(){
		if(FLUIGC.localStorage.getItem("highlight-log") != null){
			var colorList = FLUIGC.localStorage.getItem("highlight-log").colorList;
			for(var i=0;i<colorList.length;i++){
				$.each($(".log-content span"), function(index, element){
					if($(this).html().indexOf(colorList[i].text) > -1){
						$(this).css("color" , colorList[i].font);
						$(this).css("background-color" , colorList[i].background);
					}
				});
			}
		}
	}
	
	function applyHighlightNew(){
		if(FLUIGC.localStorage.getItem("highlight-log") != null){
			var colorList = FLUIGC.localStorage.getItem("highlight-log").colorList;
			for(var i=0;i<colorList.length;i++){
				$.each($(".log-content .new-line"), function(index, element){
					if($(this).html().indexOf(colorList[i].text) > -1){
						$(this).css("color" , colorList[i].font);
						$(this).css("background-color" , colorList[i].background);
					}
				});
			}
		}
		$(".new-line").removeClass("new-line");
	}
	
	function clearHighlight(){
		$(".log-content span").css("color", "#000000");
		$(".log-content span").css("background-color" , "#ffffff");
	}
})();






















