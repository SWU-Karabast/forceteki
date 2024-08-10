const _ = require('underscore');
const GameSystems = require('../../gameSystems/GameSystemLibrary');
const { Location, CardType, RelativePlayer, WildcardLocation } = require('../Constants.js');

class ChatCommands {
    constructor(game) {
        this.game = game;
        this.commands = {
            '/draw': this.draw,
            // '/discard': this.discard,
            // '/reveal': this.reveal,
            '/move-to-bottom-deck': this.moveCardToDeckBottom,
            '/stop-clocks': this.stopClocks,
            '/start-clocks': this.startClocks,
            '/modify-clock': this.modifyClock,
            '/roll': this.random,
            '/disconnectme': this.disconnectMe,
            '/manual': this.manual
        };
    }

    executeCommand(player, command, args) {
        if (!player || !this.commands[command]) {
            return false;
        }

        return this.commands[command].call(this, player, args) !== false;
    }

    startClocks(player) {
        this.game.addMessage('{0} restarts the timers', player);
        _.each(this.game.getPlayers(), (player) => player.clock.manuallyResume());
    }

    stopClocks(player) {
        this.game.addMessage('{0} stops the timers', player);
        _.each(this.game.getPlayers(), (player) => player.clock.manuallyPause());
    }

    modifyClock(player, args) {
        let num = this.getNumberOrDefault(args[1], 60);
        this.game.addMessage('{0} adds {1} seconds to their clock', player, num);
        player.clock.modify(num);
    }

    random(player, args) {
        let num = this.getNumberOrDefault(args[1], 4);
        if (num > 1) {
            this.game.addMessage('{0} rolls a d{1}: {2}', player, num, Math.floor(Math.random() * num) + 1);
        }
    }

    draw(player, args) {
        var num = this.getNumberOrDefault(args[1], 1);

        this.game.addMessage('{0} uses the /draw command to draw {1} cards to their hand', player, num);

        player.drawCardsToHand(num);
    }

    // discard(player, args) {
    //     var num = this.getNumberOrDefault(args[1], 1);

    //     this.game.addMessage('{0} uses the /discard command to discard {1} card{2} at random', player, num, num > 1 ? 's' : '');

    //     GameSystems.discardAtRandom({ amount: num }).resolve(player, this.game.getFrameworkContext());
    // }

    moveCardToDeckBottom(player) {
        this.game.promptForSelect(player, {
            activePromptTitle: 'Select a card to send to the bottom of one of their decks',
            waitingPromptTitle: 'Waiting for opponent to send a card to the bottom of one of their decks',
            location: WildcardLocation.Any,
            controller: RelativePlayer.Self,
            onSelect: (p, card) => {
                const cardInitialLocation = card.location;
                GameSystems.moveCard({ target: card, bottom: true, destination: Location.Deck }).resolve(player, this.game.getFrameworkContext());
                this.game.addMessage('{0} uses a command to move {1} from their {2} to the bottom of their {3}.', player, card, cardInitialLocation);
                return true;
            }
        });
    }

    // setToken(player, args) {
    //     var token = args[1];
    //     var num = this.getNumberOrDefault(args[2], 1);

    //     if(!this.isValidToken(token)) {
    //         return false;
    //     }

    //     this.game.promptForSelect(player, {
    //         activePromptTitle: 'Select a card',
    //         waitingPromptTitle: 'Waiting for opponent to set token',
    //         cardCondition: card => (isArena(card.location) || card.location === 'plot') && card.controller === player,
    //         onSelect: (p, card) => {
    //             var numTokens = card.tokens[token] || 0;

    //             card.addToken(token, num - numTokens);
    //             this.game.addMessage('{0} uses the /token command to set the {1} token count of {2} to {3}', p, token, card, num - numTokens);

    //             return true;
    //         }
    //     });
    // }

    // reveal(player) {
    //     this.game.promptForSelect(player, {
    //         activePromptTitle: 'Select a card to reveal',
    //         waitingPromptTitle: 'Waiting for opponent to reveal a facedown card',
    //         location: Location.Provinces,
    //         controller: RelativePlayer.Self,
    //         cardCondition: card => card.isFacedown(),
    //         onSelect: (player, card) => {
    //             GameSystems.reveal({ target: card }).resolve(player, this.game.getFrameworkContext());
    //             this.game.addMessage('{0} reveals {1}', player, card);
    //             return true;
    //         }
    //     });
    // }

    // TODO: add some SWU stuff in here like add shields

    disconnectMe(player) {
        player.socket.disconnect();
    }

    manual(player) {
        if (this.game.manualMode) {
            this.game.manualMode = false;
            this.game.addMessage('{0} switches manual mode off', player);
        } else {
            this.game.manualMode = true;
            this.game.addMessage('{0} switches manual mode on', player);
        }
    }

    getNumberOrDefault(string, defaultNumber) {
        var num = parseInt(string);

        if (isNaN(num)) {
            num = defaultNumber;
        }

        if (num < 0) {
            num = defaultNumber;
        }

        return num;
    }

    isValidIcon(icon) {
        if (!icon) {
            return false;
        }

        var lowerIcon = icon.toLowerCase();

        return lowerIcon === 'military' || lowerIcon === 'intrigue' || lowerIcon === 'power';
    }

    // isValidToken(token) {
    //     if(!token) {
    //         return false;
    //     }

    //     var lowerToken = token.toLowerCase();

    //     return _.contains(this.tokens, lowerToken);
    // }
}

module.exports = ChatCommands;
