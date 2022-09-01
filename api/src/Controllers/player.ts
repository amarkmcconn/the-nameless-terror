import { updatePlayerById, createPlayer, getPlayerById, getPlayersByGameId } from '../Models/player';
import Utility from './Utility';

const playerControllers = {
	async createPlayer(req: any, res: any) {
		const { gameId, name, isHost } = req.body;

		if (Utility.validateInputs(res, "Invalid body parameters", gameId, name, isHost)) {
			const newPlayer = await createPlayer(gameId, isHost, name);

			req.session.playerId = newPlayer.id;
			res.status(201).json(newPlayer);
		}
	},

	async getSinglePlayer(req: any, res: any) {
		const { id } = req.params;

		if (Utility.validateInputs(res, "Invalid id", id)) {
			try {
				const player = await getPlayerById(id);
				console.log("TEST: " + req.session?.playerId);
				res.json(player);
			} catch (error) {
				return res.status(404).json({ error: "Player not found" });
			}
		}
	},

	async getPlayers(req: any, res: any) {
		const { gameId } = req.params;

		if (Utility.validateInputs(res, "Invalid id", gameId)) {
			const players = await getPlayersByGameId(gameId);
			res.json(players);
		}
	},

	async updatePlayer(req: any, res: any) {
		const { id, name } = req.body;

		if (Utility.validateInputs(res, "Invalid body parameters", id, name)) {
			const player = await updatePlayerById(id, name);
			res.json(player);
		}
	}
}

export default playerControllers;