require("dotenv").config();
module.exports = {
	PORT: process.env.PORT || 4001,
	NODE_ENV: process.env.NODE_ENV || "development",
	DATABASE_URL: process.env.DATABASE_URL,
	MY_NPSSO: process.env.MY_NPSSO,
	API_KEY: process.env.API_KEY || "b3a96222-0a62-11ec-9a03-0242ac130003",

	dialectOptions: {
		ssl: {
			rejectUnauthorized: false,
		},
	},
};
