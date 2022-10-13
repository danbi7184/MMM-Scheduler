Module.register("MMM-Scheduler", {
	requiresVersion: "2.2.0",
	defaults: {
		initialLoadDelay:	0,		
		updateDelay:		5,
	},

	getStyles: function() {
		return [this.data.path + "/css/MMM-Scheduler.css", this.getThemeCss()];
	},

	getThemeCss: function() {
			return "/css/MMM-Scheduler2.css";
	},	
		
	getScripts: function() {
		return ["moment.js"];
	},

	start: function() {
		Log.log("Starting module: " + this.name);
		// 지역 설정
		moment.locale(config.language);
		
		// 다음 자정을 계산, updateDelay를 추가
		var now = moment();
		this.midnight = moment([now.year(), now.month(), now.date() + 1]).add(5, "seconds");

		this.schedule = [];
		this.loaded = false;
	},

	getDom: function() {
		var wrapper = document.createElement("table");
		wrapper.className = 'xsmall';
		wrapper.id = 'calendar-table';

		if(!this.loaded) {
			return wrapper;
		}

		var schedule = this.schedule;

		var month = moment().month();
		var year = moment().year();
		var monthName = moment().format("MMMM");
		var monthLength = moment().daysInMonth();
		
		// locale을 통해 해당 월의 첫 번째 날 탐색
		var startingDay = moment().date(1).weekday();

		// 월 이름과 4자리 연도를 사용하여 THEAD 섹션 생성
		var header = document.createElement("tHead");
		var headerTR = document.createElement("tr");
		
		//THEAD 섹션 채우기
		var headerTH = document.createElement("th");
		headerTH.colSpan = "7";
		headerTH.scope = "col";
		headerTH.id = "calendar-th";
		var headerYearSpan = document.createElement("span");
		headerYearSpan.id = "yearDigits";
		headerYearSpan.innerHTML = year + "년";
		var headerMonthSpan = document.createElement("span");
		headerMonthSpan.id = "monthName";
		headerMonthSpan.innerHTML = monthName;				
		// Add space between the two elements
		// This can be used later with the :before or :after options in the CSS
		var headerSpace = document.createTextNode(" ");

		headerTH.appendChild(headerMonthSpan);
		headerTH.appendChild(headerSpace);
		headerTH.appendChild(headerYearSpan);
		headerTR.appendChild(headerTH);
		
		header.appendChild(headerTR);
		wrapper.appendChild(header);
		
		// 요일 이름으로 TBODY 섹션 생성
		var bodyContent = document.createElement("tBody");
		var bodyTR = document.createElement("tr");
		bodyTR.id = "calendar-header";

		for (var i = 0; i <= 6; i++ ){
			var bodyTD = document.createElement("td");
			bodyTD.className = "calendar-header-day";
			bodyTD.innerHTML = moment().weekday(i).format("ddd");
			bodyTR.appendChild(bodyTD);
		}
		bodyContent.appendChild(bodyTR);
		wrapper.appendChild(bodyContent);

		// 월간 달력으로 TBODY 섹션 생성
		var bodyContent = document.createElement("tBody");
		var bodyTR = document.createElement("tr");
		bodyTR.className = "weekRow";

		// 날짜 채우기
		var day = 1;
		var nextMonth = 1;
		// 몇 주 동안 반복
		for (var i = 0; i < 9; i++) {
			// 각 요일에 대한 반복
			for (var j = 0; j <= 6; j++) {
				var bodyTD = document.createElement("td");
				bodyTD.className = "calendar-day";
				var squareDiv = document.createElement("div");
				squareDiv.className = "square-box";
				var squareContent = document.createElement("div");
				squareContent.className = "square-content";
				var squareContentInner = document.createElement("div");
				var innerSpan = document.createElement("span");
				var time = document.createElement("div");
				var content = document.createElement("div");

				if (j < startingDay && i == 0) {
					//첫 번째 행, 빈 슬롯 채우기
					innerSpan.className = "monthPrev";
					innerSpan.innerHTML = moment().subtract(1, 'months').endOf('month').subtract((startingDay - 1) - j, 'days').date();
				} else if (day <= monthLength && (i > 0 || j >= startingDay)) {
					if (day == moment().date()) {
						innerSpan.id = "day" + day;
						innerSpan.className = "today";
					} else {
						innerSpan.id = "day" + day;
						innerSpan.className = "daily";
					}
					innerSpan.innerHTML = day;
					
					if(month + 1 < 10) 
						var zeroMonth = '0' + (month + 1);
					else 
						var zeroMonth = month + 1;
					if(day < 10)
						var zeroDay = '0' + day;
					else
						var zeroDay = day; 
					var date = year + '-' + zeroMonth + '-' + zeroDay;
					
					for(var k=0; k<schedule.length; k++) {
						if(schedule[k].date === date) {
							time.innerHTML = schedule[k].startTime;
							time.className = 'time-content';
							content.innerHTML = schedule[k].title;
							break;
						} else {
							time.innerHTML = ' ';
							content.innerHTML = ' ';
						}
					}
					day++;
				} else if (day > monthLength && i > 0) {
					// 마지막 행, 빈 공간 채우기
					innerSpan.className = "monthNext";
					innerSpan.innerHTML = moment([year, month, monthLength]).add(nextMonth, 'days').date();
					nextMonth++;
				}
				squareContentInner.appendChild(innerSpan);
				squareContent.appendChild(squareContentInner);
				squareContent.appendChild(time);
				squareContent.appendChild(content);
				squareDiv.appendChild(squareContent);
				bodyTD.appendChild(squareDiv);	
				bodyTR.appendChild(bodyTD);
			}
			// 일수가 부족하면 더 이상 행이 필요하지 않음
			if (day > monthLength) {
				break;
			} else {
				bodyTR.appendChild(bodyTD);
				bodyContent.appendChild(bodyTR);
				var bodyTR = document.createElement("tr");
				bodyTR.className = "weekRow";
			}
		}	

		bodyContent.appendChild(bodyTR);
		wrapper.appendChild(bodyContent);
		return wrapper;
	},

	getScheduleList: function() {
		Log.info("Requesting schedule");
		this.sendSocketNotification("GET_SCHEDULE");
	},

	notificationReceived: function(notification) {
		switch (notification) {
			case "DOM_OBJECTS_CREATED":
				this.getScheduleList();
				var timer = setInterval(() => {
					this.getScheduleList();
				}, 10000);
				break;
		}
	},

	socketNotificationReceived: function(notification, payload) {
		switch (notification) {
			case "SCHEDULE":
				console.log("NotificationReceived:" + notification);
				this.schedule = payload;
                this.loaded = true;
				this.updateDom();
				break;
		}
	},

});