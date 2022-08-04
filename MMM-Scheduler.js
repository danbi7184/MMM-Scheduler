Module.register("MMM-Schduler", {
	requiresVersion: "2.12.0",
    defaults: {
        foo: "Schduler"
    },
	
	getStyles: function () {
        return ['MMM-Scheduler.css'];
    },
	
	getScripts: function() {
		return ["moment.js"];
	},
	
	start: function() {
	Log.log("Starting module: " + this.name);
	Log.log("HAHAHAHAHAHAHAHA Dongjakhanda");
	this.loaded = false;
	moment.locale(config.language);
	
	},
	
	
	
	
	getDom: function() {
		var wrapper = document.createElement("div");
		
		
		var element = document.createElement("div")
		element.className = "myContent"
		element.innerHTML = "HIHIHIH"
		
		var table = document.createElement("table")
		var tbdy = document.createElement("tbody")
		
		
	}
});