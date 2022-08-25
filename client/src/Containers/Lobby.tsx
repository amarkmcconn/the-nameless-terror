import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { Fragment, useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from "socket.io-client";
import { API_ENDPOINT, BASE_HEADERS, handleResponse } from "../ApiHelper";
import GenericButton from '../Components/GenericButton';
import List, { listItem } from "../Components/List";

type propTypes = {
	gameId: number
}

interface LobbyMembers {
	id: number
	isHost: boolean,
	name: string,
}

const getLobbyMembers = async (gameId: number): Promise<LobbyMembers[]> => {
	const url = `${API_ENDPOINT}/players/${gameId}`;
	const response = await fetch(url, { ...BASE_HEADERS });
	return await handleResponse(response);
}

const notify = (content: string) => toast(content);

const Lobby = (props: propTypes): JSX.Element => {
	const queryClient = useQueryClient();
	const { isLoading, error, data } = useQuery(["players"], () => getLobbyMembers(props.gameId));
	const [socket, setSocket] = useState(io(API_ENDPOINT))
	const [gameStarted, setGameStarted] = useState(false)
	const [usersJoined, setUsersJoined] = useState([])

	useEffect(() => {
		//Establish connection when component mounts
		socket.on('connect', () => {

			socket.on("player_joined_msg", (data) => notify("New player joined"))

			//Listen for game start and dictate the data passed through the sockets
			socket.on("new_game_clicked", () => {
				console.log("New Game Button Clicked")
			})
		})
	}, [socket])

	//Listen for the new game to start
	socket.on("new_game_start", (arg) => {
		console.log("New Game Starting", arg)
		setUsersJoined(arg)
		notify("New Game Started!")
	})

	//Use placeholder to pass data obj through to server later
	const userAndRoomDataPlaceholder = {
		user: data, //To contain all users active in room
		roomId: "123", //Placeholder for Game ID
		socketId: socket.id
	}
	//Start the actual game
	const gameStartSwitch = () => {
		if (!gameStarted) {
			socket.emit("new_game_clicked", userAndRoomDataPlaceholder);
		}
		setGameStarted(!gameStarted)
	}

	if (error instanceof Error) {
		return <p>'An error has occurred: {error.message}</p>;
	}

	if (isLoading) {
		queryClient.invalidateQueries(['games']);
	}

	const playerNames = data ? data.map((player, index) => {
		const item: listItem = { id: index, data: player.name };
		return item;
	}) : []

	return (
		<div>
			<h1>Lobby</h1>
			{isLoading && (<p>Loading...</p>)}
			{!isLoading && <List listItems={playerNames} />}

			<GenericButton
				onClick={() => gameStartSwitch()}
				text={gameStarted ? 'Game Started' : 'New Game'} />

			<ToastContainer />
		</div >
	);
}

export default Lobby;