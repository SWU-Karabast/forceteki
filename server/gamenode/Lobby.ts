import Game from '../game/core/Game';
import { v4 as uuid } from 'uuid';
import type Socket from '../socket';
import defaultGameSettings from './defaultGame';
import { Deck } from '../game/Deck';
import * as Contract from '../game/core/utils/Contract';
import fs from 'fs';
import path from 'path';
import { logger } from '../logger';
import { GameChat } from '../game/core/chat/GameChat';

interface LobbyUser {
    id: string;
    username: string;
    state: 'connected' | 'disconnected';
    ready: boolean;
    socket: Socket | null;
    deck: Deck | null;
}

export class Lobby {
    private readonly _id: string;
    private game: Game;
    // switch partic
    private users: LobbyUser[] = [];
    private tokens: { battleDroid: any; cloneTrooper: any; experience: any; shield: any };
    private gameChat: GameChat;
    private lobbyOwnerId: string;
    private privacy: string;
    private connectionLink: string;

    public constructor(privacy: string = 'public') {
        this._id = uuid();
        this.gameChat = new GameChat();
        this.connectionLink = `http://localhost:3000/lobby?lobbyId=${this._id}`;
        this.privacy = privacy;
    }

    public get id(): string {
        return this._id;
    }

    public getLobbyState(): any {
        return {
            id: this._id,
            users: this.users.map((u) => ({
                id: u.id,
                username: u.username,
                state: u.state,
                ready: u.ready,
                deck: u.deck?.data,
            })),
            gameChat: this.gameChat,
            lobbyOwnerId: this.lobbyOwnerId,
            privacy: this.privacy,
            connectionLink: this.connectionLink,
        };
    }

    public createLobbyUser(user, deck = null): void {
        const existingUser = this.users.find((u) => u.id === user.id);
        const newDeck = deck ? new Deck(deck) : this.useDefaultDeck(user);
        if (existingUser) {
            existingUser.deck = newDeck;
            return;
        }
        this.users.push(({
            id: user.id,
            username: user.username,
            state: null,
            ready: false,
            socket: null,
            deck: newDeck,
        }));
    }

    private useDefaultDeck(user) {
        switch (user.id) {
            case 'exe66':
                return new Deck(defaultGameSettings.players[0].deck);
            case 'th3w4y':
                return new Deck(defaultGameSettings.players[1].deck);
            default:
                return null;
        }
    }

    public addLobbyUser(user, socket: Socket): void {
        const existingUser = this.users.find((u) => u.id === user.id);
        socket.registerEvent('game', (socket, command, ...args) => this.onGameMessage(socket, command, ...args));
        socket.registerEvent('lobby', (socket, command, ...args) => this.onLobbyMessage(socket, command, ...args));
        // maybe we neeed to be using socket.data
        if (existingUser) {
            existingUser.state = 'connected';
            existingUser.socket = socket;
        } else {
            this.users.push({
                id: user.id,
                username: user.username,
                state: 'connected',
                ready: false, socket,
                deck: this.useDefaultDeck(user),
            });
        }

        if (this.game) {
            this.sendGameState(this.game);
        } else {
            this.sendLobbyState();
        }
    }

    private setReadyStatus(socket: Socket, ...args) {
        Contract.assertTrue(args.length === 1 && typeof args[0] === 'boolean', 'Ready status arguments aren\'t boolean or present');
        const currentUser = this.users.find((u) => u.id === socket.user.id);
        currentUser.ready = args[0];
    }

    private sendChatMessage(socket: Socket, ...args) {
        // we need to get the player and message
        Contract.assertTrue(args.length === 1 && typeof args[0] === 'string', 'Chat message arguments are not present or not of type string');
        this.gameChat.addChatMessage(socket.user, args[0]);
        this.sendLobbyState();
    }

    private changeDeck(socket: Socket, ...args) {
        const activeUser = this.users.find((u) => u.id === socket.user.id);
        Contract.assertTrue(args[0] !== null);
        activeUser.deck = new Deck(args[0]);
    }

    private updateDeck(socket: Socket, ...args) {
        const activeUser = this.users.find((u) => u.id === socket.user.id);
        const userDeck = activeUser.deck.data;
        const source = args[0]; // [<'Deck'|'Sideboard>'<cardID>]
        const cardID = args[1];

        Contract.assertTrue(source === 'Deck' || source === 'Sideboard', `source isn't 'Deck' or 'Sideboard' but ${source}`);
        // Determine the arrays we are moving between
        const sourceArray = source === 'Deck' ? userDeck.deckCards : userDeck.sideboard;
        const targetArray = source === 'Deck' ? userDeck.sideboard : userDeck.deckCards;

        // Find the card in the source array
        const sourceIndex = sourceArray.findIndex((item) => item.card.id === cardID);
        Contract.assertTrue(sourceIndex !== -1);

        // Extract the card entry from the source
        const sourceEntry = sourceArray[sourceIndex];

        // Decrement the count in the source entry
        sourceEntry.count -= 1;

        // If count is now zero, remove it from the source array
        Contract.assertNonNegative(sourceEntry.count, sourceEntry);
        if (sourceEntry.count === 0) {
            sourceArray.splice(sourceIndex, 1);
        }

        // Add this card to the target array
        // Check if the card already exists in the target
        const targetIndex = targetArray.findIndex((item) => item.card.id === cardID);

        if (targetIndex === -1) {
            // Card not in target array, add a new entry
            targetArray.push({
                count: 1,
                card: sourceEntry.card
            });
        } else {
            // Card already exists in target, just increment the count
            targetArray[targetIndex].count += 1;
        }

        socket.user.deck = userDeck;
    }

    public setUserDisconnected(id: string): void {
        const user = this.users.find((u) => u.id === id);
        if (user) {
            user.state = 'disconnected';
        }
    }

    public hasOngoingGame(): boolean {
        return this.game !== null;
    }

    public setLobbyOwner(id: string): void {
        this.lobbyOwnerId = id;
    }

    public getUserState(id: string): string {
        const user = this.users.find((u) => u.id === id);
        return user ? user.state : null;
    }

    public getLobbyUserById(id: string): LobbyUser | undefined {
        return this.users.find((u) => u.id === id);
    }

    public isLobbyFilled(): boolean {
        return this.users.length === 2 && !this.game;
    }

    public isLobbyPublic(): boolean {
        return this.privacy === 'Public';
    }

    public removeLobbyUser(id: string): void {
        this.users = this.users.filter((u) => u.id !== id);
        this.sendLobbyState();
    }

    public isLobbyEmpty(): boolean {
        return this.users.length === 0;
    }

    public cleanLobby(): void {
        this.game = null;
        this.users = [];
    }

    private async fetchCard(cardName: string): Promise<any> {
        try {
            const response = await fetch(`https://karabast-assets.s3.amazonaws.com/data/cards/${encodeURIComponent(cardName)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching card: ${cardName}`, error);
            throw error;
        }
    }

    public async setTokens(): Promise<void> {
        const cardData = {
            battleDroid: (await this.fetchCard('battle-droid.json'))[0],
            cloneTrooper: (await this.fetchCard('clone-trooper.json'))[0],
            experience: (await this.fetchCard('experience.json'))[0],
            shield: (await this.fetchCard('shield.json'))[0],
        };
        this.tokens = cardData;
    }

    // example method to demonstrate the use of the test game setup utility
    public startTestGame(filename: string): void {
        const testDirPath = path.resolve(__dirname, '../../test');
        const testJSONPath = path.resolve(__dirname, `../../test/gameSetups/${filename}`);
        if (!fs.existsSync(testDirPath) || !fs.existsSync(testJSONPath)) {
            return null;
        }

        const setupData = JSON.parse(fs.readFileSync(testJSONPath, 'utf8'));

        const gameSetupPath = path.resolve(__dirname, '../../test/helpers/GameStateSetup.js');
        // eslint-disable-next-line
        const game: Game = require(gameSetupPath).setUpTestGame(
            setupData,
            {},
            { id: 'exe66', username: 'Order66' },
            { id: 'th3w4y', username: 'ThisIsTheWay' }
        );

        this.game = game;
    }

    private onStartGame(): void {
        // fix the defaultGameSettings later on.
        defaultGameSettings.players[0].user.id = this.users[0].id;
        defaultGameSettings.players[0].user.username = this.users[0].username;
        defaultGameSettings.players[1].user.id = this.users[1].id;
        defaultGameSettings.players[1].user.username = this.users[1].username;

        const game = new Game(defaultGameSettings, { router: this });
        this.game = game;
        game.started = true;
        // For each user, if they have a deck, select it in the game
        this.users.forEach((user) => {
            if (user.deck) {
                game.selectDeck(user.id, user.deck.data);
            }
        });

        game.initialiseTokens(this.tokens);
        game.initialise();

        this.sendGameState(game);
    }

    private onLobbyMessage(socket: Socket, command: string, ...args): void {
        if (!this[command] || typeof this[command] !== 'function') {
            throw new Error(`Incorrect command or command format expected function but got: ${command}`);
        }

        this.runLobbyFuncAndCatchErrors(() => {
            this[command](socket, ...args);
            this.sendLobbyState();
        });
    }

    private onGameMessage(socket: Socket, command: string, ...args): void {
        if (!this.game) {
            return;
        }

        // if (command === 'leavegame') {
        //     return this.onLeaveGame(socket);
        // }

        if (!this.game[command] || typeof this.game[command] !== 'function') {
            return;
        }

        this.runAndCatchErrors(this.game, () => {
            this.game.stopNonChessClocks();
            this.game[command](socket.user.username, ...args);

            this.game.continue();

            this.sendGameState(this.game);
        });
    }

    private runAndCatchErrors(game: Game, func: () => void) {
        try {
            func();
        } catch (e) {
            this.handleError(game, e);
            this.sendGameState(game);
        }
    }

    // might just use the top function at some point?
    private runLobbyFuncAndCatchErrors(func: () => void) {
        try {
            func();
        } catch (e) {
            logger.error(e);
            this.sendLobbyState();
        }
    }

    // TODO: Review this to make sure we're getting the info we need for debugging
    private handleError(game: Game, e: Error) {
        logger.error(e);

        // const gameState = game.getState();
        // const debugData: any = {};

        // if (e.message.includes('Maximum call stack')) {
        //     // debugData.badSerializaton = detectBinary(gameState);
        // } else {
        //     debugData.game = gameState;
        //     debugData.game.players = undefined;

        //     debugData.messages = game.messages;
        //     debugData.game.messages = undefined;

        //     debugData.pipeline = game.pipeline.getDebugInfo();
        //     // debugData.effectEngine = game.effectEngine.getDebugInfo();

        //     for (const player of game.getPlayers()) {
        //         debugData[player.name] = player.getState(player);
        //     }
        // }

        // if (game) {
        //     game.addMessage(
        //         'A Server error has occured processing your game state, apologies.  Your game may now be in an inconsistent state, or you may be able to continue.  The error has been logged.'
        //     );
        // }
    }

    public sendGameState(game: Game): void {
        for (const user of this.users) {
            if (user.state === 'connected' && user.socket) {
                user.socket.send('gamestate', game.getState(user.id));
            }
        }
    }

    public sendLobbyState(): void {
        for (const user of this.users) {
            if (user.state === 'connected' && user.socket) {
                user.socket.send('lobbystate', this.getLobbyState());
            }
        }
    }
}