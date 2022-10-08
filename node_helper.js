const NodeHelper = require("node_helper");
const admin = require("firebase-admin");

const serviceAccount = require("./ServiceAccount.json");

var db;
var schedule = Array();

module.exports = NodeHelper.create({
	start: function() {
		console.log("Starting nodehelper: " + this.name);
		try {
			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount),
				databaseURL: "https://scheduler-app-df3b5-default-rtdb.asia-southeast1.firebasedatabase.app"
			  });
		}  catch(error) {
		}
		db = admin.database();
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

		var ref = db.ref("CalendarList");
		ref.on("value", function(snapshot) {
			var val = snapshot.val();
			var key = Object.keys(val);
			var value = Object.values(val);
			
			var i=0;

			for(var k=0; k<key.length; k++) {
				var length = value[k].length;
				var object = 'object' + i;
				for(var j=0; j<length; j++) {
					if(value[k][j] != null) {
						var object = {};
						object['title'] = value[k][j].data.title;
						object['date'] = value[k][j].data.date;
						object['startTime'] = value[k][j].data.startTime;
						schedule[i] = object;
						i++;
					}
				}
			}
		});		

		self.sendSocketNotification("SCHEDULE", schedule);
	},

	stop: function() {
		db.ref("CalendarList").off();
	}
});
