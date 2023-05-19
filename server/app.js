const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { MY_NPSSO, NODE_ENV } = require("./config");
const validate = require("./validate-bearer-token");
const psnApi = require("psn-api");
const logger = require("./logger");

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

const app = express();

let fetch_timer = false;

app.use(cors());
app.use(morgan(morganOption));
app.use(helmet());
app.use(validate);

const FetchGames = async () => {
	const accessCode = await psnApi.exchangeNpssoForCode(MY_NPSSO);
	const authorization = await psnApi.exchangeCodeForAccessToken(accessCode);
	const recentlyPlayedGames = await psnApi.getRecentlyPlayedGames(
		authorization,
		{
			limit: 20,
		}
	);
	const myKnex = app.get("db");
	await myKnex
		.select("*")
		.from("portfolio_games")
		.del()
		.then(() => {
			console.log("All games deleted.");
		});
	const added = [];
	recentlyPlayedGames.data.gameLibraryTitlesRetrieve.games.forEach(
		async (game) => {
			if (!added.includes(game.name)) console.log(added, game.name);
			await myKnex
				.insert({
					name: game.name,
					image_url: game.image.url,
				})
				.into("portfolio_games")
				.then(() => {
					logger.info(`${game.name} added`);
				});
			added.push(game.name);
		}
	);
};

setTimeout(() => {
	fetch_timer = false;
}, 1000 * 60 * 60 * 24);
const serializeGame = (game) => ({
	name: game.name,
	image_url: game.image_url,
});

app.get("/", async (_, res) => {
	if (!fetch_timer) {
		await FetchGames();
		fetch_timer = true;
	}

	app
		.get("db")
		.select("*")
		.from("portfolio_games")
		.then((games) => {
			res.json({ games: games.map(serializeGame) });
		});
});

module.exports = app;
