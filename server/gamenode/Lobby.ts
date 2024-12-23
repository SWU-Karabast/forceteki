import Game from '../game/core/Game';
import type Player from '../game/core/Player';
import { v4 as uuid } from 'uuid';
import Socket from '../socket';
import defaultGameSettings from './defaultGame';
import { Deck } from '../game/Deck';
import * as Contract from '../game/core/utils/Contract';
import fs from 'fs';
import axios from 'axios';

interface LobbyUser {
    id: string;
    state: 'connected' | 'disconnected';
    socket: Socket | null;
    deck: Deck | null;
}

export class Lobby {
    private readonly _id: string;
    private game: Game;
    // switch partic
    private users: LobbyUser[] = [];
    private tokens: { battleDroid: any; cloneTrooper: any; experience: any; shield: any };
    public constructor() {
        this._id = uuid();
    }

    public get id(): string {
        return this._id;
    }

    public createLobbyUser(id: string, deck): void {
        const existingUser = this.users.find((u) => u.id === id);
        let newDeck = null;
        if (deck) {
            newDeck = new Deck(deck);
            if (existingUser) {
                existingUser.deck = newDeck;
                return;
            }
        }
        this.users.push(({ id: id, state: null, socket: null, deck: newDeck }));
    }

    public addLobbyUser(id: string, socket: Socket): void {
        const existingUser = this.users.find((u) => u.id === id);
        socket.registerEvent('startGame', () => this.onStartGame(id));
        socket.registerEvent('game', (socket, command, ...args) => this.onGameMessage(socket, command, ...args));
        socket.registerEvent('updateDeck', (socket, ...args) => this.updateDeck(socket, ...args));
        // maybe we neeed to be using socket.data
        if (existingUser) {
            existingUser.state = 'connected';
            existingUser.socket = socket;
        } else {
            this.users.push({ id: id, state: 'connected', socket, deck: null });
        }

        if (this.game) {
            this.sendGameState(this.game);
        } else {
            this.sendDeckInfo();
        }
    }

    private updateDeck(socket: Socket, ...args) {
        const activeUser = this.users.find((u) => u.id === socket.user.username);
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
        socket.send('deckData', socket.user.deck);
    }

    public setUserDisconnected(id: string): void {
        this.users.find((u) => u.id === id).state = 'disconnected';
    }

    public getUserState(id: string): string {
        return this.users.find((u) => u.id === id).state;
    }

    public isLobbyFilled(): boolean {
        return this.users.length === 2;
    }

    public removeLobbyUser(id: string): void {
        this.users = this.users.filter((u) => u.id !== id);
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
            const response = await axios.get('https://karabast-assets.s3.amazonaws.com/data/cards/' + encodeURIComponent(cardName));
            return response.data;
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
    private checkLoadTestGame() {
        /* if (!fs.existsSync('../../test')) {
            return null;
        }*/

        // eslint-disable-next-line
        const game: Game = require('../../test/helpers/GameStateSetup.js').setUpTestGame({
            phase: 'action',
            player1: {
                hand: ['tactical-advantage', 'village-protectors'],
            },
            player2: {
                groundArena: ['admiral-motti#brazen-and-scornful'],
                hand: ['tie-advanced'],
            },
            autoSingleTarget: false
        },
        {},
        { id: '111', username: 'Order66' },
        { id: '222', username: 'ThisIsTheWay' }
        );

        return game;
    }

    private onStartGame(id: string): void {
        const game = new Game(defaultGameSettings, { router: this });
        this.game = game;
        const existingUser = this.users.find((u) => u.id === id);
        const opponent = this.users.find((u) => u.id !== id);
        game.started = true;
        // for (const player of Object.values<Player>(pendingGame.players)) {
        //     game.selectDeck(player.name, player.deck);
        // }

        // fetch deck for existing user otherwise set default
        if (existingUser.deck) {
            game.selectDeck(id, existingUser.deck.data);
        } else {
            game.selectDeck(id, defaultGameSettings.players[0].deck);
        }

        // if opponent exist fetch deck for opponent otherwise set it as default
        if (opponent) {
            if (opponent.deck) {
                game.selectDeck(opponent.id, opponent.deck.data);
            } else {
                game.selectDeck(opponent.id, defaultGameSettings.players[0].deck);
            }
        } else {
            game.selectDeck('ThisIsTheWay', defaultGameSettings.players[0].deck);
        }
        // game = this.checkLoadTestGame(); Uncomment this if you wish to start a test setup.
        // this.game = game; Uncomment this if you wish to start a test setup.
        console.log(this.tokens);
        game.initialiseTokens(this.tokens);
        game.initialise();
        this.sendGameState(game);
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
            // this.handleError(game, e);

            // this.sendGameState(game);
        }
    }

    // TODO: Review this to make sure we're getting the info we need for debugging
    private handleError(game: Game, e: Error) {
        // logger.error(e);

        const gameState = game.getState();
        const debugData: any = {};

        if (e.message.includes('Maximum call stack')) {
            // debugData.badSerializaton = detectBinary(gameState);
        } else {
            debugData.game = gameState;
            debugData.game.players = undefined;

            debugData.messages = game.messages;
            debugData.game.messages = undefined;

            debugData.pipeline = game.pipeline.getDebugInfo();
            // debugData.effectEngine = game.effectEngine.getDebugInfo();

            for (const player of game.getPlayers()) {
                debugData[player.name] = player.getState(player);
            }
        }

        if (game) {
            game.addMessage(
                'A Server error has occured processing your game state, apologies.  Your game may now be in an inconsistent state, or you may be able to continue.  The error has been logged.'
            );
        }
    }

    public sendGameState(game: Game): void {
        for (const user of this.users) {
            if (user.state === 'connected' && user.socket) {
                user.socket.send('gamestate', game.getState(user.id));
            }
        }
    }

    public sendDeckInfo(): void {
        for (const user of this.users) {
            if (user.state === 'connected' && user.socket && user.deck) {
                user.socket.send('deckData', user.deck.data);
            } else if (user.state === 'connected' && user.socket) {
                user.socket.send('deckData', defaultGameSettings.players[0].deck);
            }
        }
    }
}