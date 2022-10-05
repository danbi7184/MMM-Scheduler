const NodeHelper = require("node_helper");
const admin = require("firebase-admin");

const serviceAccount = require("./ServiceAccount.json");

var db;

module.exports = NodeHelper.create({
	start: function() {
		console.log("Starting nodehelper: " + this.name);
		try {
			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount),
				databaseURL: "https://scheduler-app-df3b5-default-rtdb.asia-southeast1.firebasedatabase.app"
			  });
		    db = admin.database();
		}  catch(error) {
		}
	},

	socketNotificationReceived: function(notification, payload) {
		switch(notification) {
			case "GET_SCHEDULE":
				this.getSchedule();
				break;
		}
	},

	getSchedule: async function() {
		let self = this;
		var title = Array();
		var date = Array();
		var startTime = Array();
		
		var i=0;

		var ref = db.ref("CalendarList");
		ref.on('value', function(snapshot) {
			var val = snapshot.val();
			var key = Object.keys(val);
			var value = Object.values(val);

			for(var k=0; k<key.length; k++) {
				var length = value[k].length;
				for(var j=0; j<length; j++) {
					if(value[k][j] != null) {
						title[i] = value[k][j].data.title;
						date[i] = value[k][j].data.date;
						startTime[i] = value[k][j].data.startTime;
						i++;
					}
				}
			}
		});		
		console.log(title[3]);

		self.sendSocketNotification("SCHEDULE", 
			{
				"Title": title,
				"Date": date,
				"Value": value
			}	
		);
	},

	stop: function() {
		db.ref("CalendarList").off();
	}
});
