const NodeHelper = require("node_helper");
const admin = require("firebase-admin");
const firestore = require("firebase-admin/firestore");

const serviceAccount = require("./ServiceAccount.json");

var db;

module.exports = NodeHelper.create({
	start: function() {
		console.log("Starting nodehelper: " + this.name);
		try {
			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount)
			});
		}  catch(error) {
		}
		db = firestore.getFirestore();
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
		var schedule = Array();
        var date = Array();
		var i = 0;

		db.collection("Calendar").get().then((result) => {
			result.forEach((doc) => {
				schedule[i] = doc.data().schedule;
                date[i] = doc.data().day;
				i++;
			});
			self.sendSocketNotification("SCHEDULE", schedule);
		});
	},
});
