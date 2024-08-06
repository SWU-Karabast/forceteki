const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { TargetModes, Locations, Players, CardTypes } = require('../../Constants');
const { GameModes } = require('../../../GameModes.js');

class CardWrapper {
    constructor(card) {
        this.dynastyCard = card;
        this.targetLocation = null;
    }
}

class GovernorsSpy extends DrawCard {
    setupCardAbilities() {
        this.dynastyCards = [];
        this.unplacedDynastyCards = [];
        this.action({
            title: 'Flip a player\'s dynasty cards facedown and rearrange them',
            condition: (context) => context.source.isParticipating(),
            target: {
                mode: TargetModes.Select,
                targets: true,
                choices: {
                    [this.owner.name]: AbilityDsl.actions.handler({
                        handler: (context) => this.governorHandler(context, this.owner)
                    }),
                    [(this.owner.opponent && this.owner.opponent.name) || 'NA']: AbilityDsl.actions.handler({
                        handler: (context) => this.governorHandler(context, this.owner.opponent)
                    })
                }
            },
            effect: 'turn facedown and rearrange all of {1}\'s dynasty cards',
            effectArgs: (context) => (context.select === this.owner.name ? this.owner : this.owner.opponent)
        });
    }

    governorHandler(context, targetPlayer) {
        //Step 1: Find all dynasty cards for the player currently in provinces
        this.dynastyCards = targetPlayer
            .getDynastyCardsInProvince(Locations.Provinces)
            .map((card) => new CardWrapper(card));
        this.dynastyCards.sort((a, b) => a.dynastyCard.name.localeCompare(b.dynastyCard.name));
        //Step 2: Flip them all face down and create a list that we'll end up using for their new location
        this.dynastyCards.forEach((card) => {
            this.game.applyGameAction(context, { turnFacedown: card.dynastyCard });
        });
        //Step 2.5: Return control of any facedown cards to their owner
        this.dynastyCards = this.dynastyCards.filter((a) => a.dynastyCard.owner === targetPlayer);

        //Step 3: For each card, choose an eligible province.  This is done via prompt for select, which queues simple steps
        this.unplacedDynastyCards = this.dynastyCards.map((a) => a.dynastyCard);
        this.governorSelectPrompt(context, targetPlayer);

        context.game.queueSimpleStep(() => this.governorMoveCards(context, targetPlayer));
    }

    governorSelectPrompt(context, targetPlayer) {
        let cardHandler = (currentCard) => {
            this.game.promptForSelect(context.player, {
                activePromptTitle: 'Choose a province for ' + currentCard.name,
                context: context,
                location: Locations.Provinces,
                controller: targetPlayer === context.player ? Players.Self : Players.Opponent,
                cardCondition: (card) =>
                    card.type === CardTypes.Province &&
                    this.isProvinceValidTarget(targetPlayer, this.dynastyCards, card),
                onSelect: (player, card) => {
                    this.game.addMessage('{0} places a card', player);
                    this.unplacedDynastyCards = this.unplacedDynastyCards.filter((a) => a !== currentCard);
                    let wrapper = this.dynastyCards.find((a) => a.dynastyCard === currentCard);
                    let location = card.location;
                    wrapper.targetLocation = location;

                    if(this.unplacedDynastyCards.length > 0) {
                        this.game.promptWithHandlerMenu(context.player, {
                            activePromptTitle: 'Select a card to place',
                            context: context,
                            cards: this.unplacedDynastyCards,
                            cardHandler: cardHandler,
                            handlers: [],
                            choices: []
                        });
                    }

                    return true;
                }
            });
        };

        this.game.promptWithHandlerMenu(context.player, {
            activePromptTitle: 'Select a card to place',
            context: context,
            cards: this.unplacedDynastyCards,
            cardHandler: cardHandler,
            handlers: [],
            choices: []
        });
    }

    governorMoveCards(context, targetPlayer) {
        this.dynastyCards.forEach((card) => {
            targetPlayer.moveCard(card.dynastyCard, card.targetLocation);
        });
        let emptyLocations = this.getEmptyProvinces(this.dynastyCards);
        emptyLocations.forEach((location) => {
            context.refillProvince(targetPlayer, location);
        });
        this.game.addMessage('{0} has finished placing cards', context.player);
    }

    isProvinceValidTarget(targetPlayer, cards, province) {
        //Step 1: Identify empty provinces
        let emptyLocations = this.getEmptyProvinces(cards);

        //Step 2: Identify how many cards we have left to place
        let location = province.location;
        let cardsLeft = cards.filter((a) => !a.targetLocation).length;

        //Step 2.1: We have more cards than we have empty locations
        if(cardsLeft > emptyLocations.length) {
            return true;
        }

        //Step 2.2 We need to put the card in an empty location
        return emptyLocations.some((loc) => loc === location);
    }

    getEmptyProvinces(cards) {
        let emptyLocations = [];
        let baseLocations = [Locations.ProvinceOne, Locations.ProvinceTwo, Locations.ProvinceThree];
        if(this.game.gameMode !== GameModes.Skirmish) {
            baseLocations.push(Locations.ProvinceFour);
        }
        baseLocations.forEach((p) => {
            if(!cards.some((card) => card.targetLocation === p)) {
                emptyLocations.push(p);
            }
        });

        return emptyLocations;
    }
}

GovernorsSpy.id = 'governor-s-spy';

module.exports = GovernorsSpy;
