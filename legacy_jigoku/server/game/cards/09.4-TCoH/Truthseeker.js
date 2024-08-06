const { TargetModes } = require('../../Constants.js');
const DrawCard = require('../../drawcard.js');

class Truthseeker extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Look at top 3 cards',
            when: {
                onCharacterEntersPlay: (event, context) => event.card === context.source
            },
            target: {
                mode: TargetModes.Select,
                targets: true,
                activePromptTitle: 'Choose which deck to look at:',
                choices: {
                    [this.getChoiceName('OppDynasty')]: (context) =>
                        context.player.opponent && context.player.opponent.dynastyDeck.size() > 0,
                    [this.getChoiceName('OppConflict')]: (context) =>
                        context.player.opponent && context.player.opponent.conflictDeck.size() > 0,
                    [this.getChoiceName('MyDynasty')]: (context) =>
                        context.player && context.player.dynastyDeck.size() > 0,
                    [this.getChoiceName('MyConflict')]: (context) =>
                        context.player && context.player.conflictDeck.size() > 0
                }
            },
            effect: 'look at the top 3 cards of {1}\'s {2}',
            effectArgs: (context) => this.mapChoiceToEffectArgs(context),
            handler: (context) => {
                let cardsToSort = this.mapChoiceToCards(context);
                this.truthSeekerPrompt(
                    context,
                    cardsToSort,
                    [],
                    'Select the card you would like to place on top of the deck.'
                );
            }
        });
    }

    getChoiceName(key) {
        if(key === 'MyDynasty') {
            return `${this.owner.name}'s Dynasty`;
        }
        if(key === 'MyConflict') {
            return `${this.owner.name}'s Conflict`;
        }
        if(this.owner.opponent) {
            if(key === 'OppDynasty') {
                return `${this.owner.opponent.name}'s Dynasty`;
            }
            if(key === 'OppConflict') {
                return `${this.owner.opponent.name}'s Conflict`;
            }
        }

        return 'N/A';
    }

    mapChoiceToEffectArgs(context) {
        switch(context.select) {
            case this.getChoiceName('OppDynasty'):
                return [this.owner.opponent, 'dynasty deck'];
            case this.getChoiceName('OppConflict'):
                return [this.owner.opponent, 'conflict deck'];
            case this.getChoiceName('MyDynasty'):
                return [this.owner, 'dynasty deck'];
            case this.getChoiceName('MyConflict'):
                return [this.owner, 'conflict deck'];
        }
    }

    mapChoiceToCards(context) {
        switch(context.select) {
            case this.getChoiceName('OppDynasty'):
                return this.owner.opponent.dynastyDeck.first(3);
            case this.getChoiceName('OppConflict'):
                return this.owner.opponent.conflictDeck.first(3);
            case this.getChoiceName('MyDynasty'):
                return this.owner.dynastyDeck.first(3);
            case this.getChoiceName('MyConflict'):
                return this.owner.conflictDeck.first(3);
        }
    }

    mapChoiceToDeck(context) {
        switch(context.select) {
            case this.getChoiceName('OppDynasty'):
                return this.owner.opponent.dynastyDeck;
            case this.getChoiceName('OppConflict'):
                return this.owner.opponent.conflictDeck;
            case this.getChoiceName('MyDynasty'):
                return this.owner.dynastyDeck;
            case this.getChoiceName('MyConflict'):
                return this.owner.conflictDeck;
        }
    }

    truthSeekerPrompt(context, promptCards, orderedCards, promptTitle) {
        const orderPrompt = ['first', 'second'];
        let deckToReorder = this.mapChoiceToDeck(context);
        this.game.promptWithHandlerMenu(context.player, {
            activePromptTitle: promptTitle,
            context: context,
            cards: promptCards,
            cardHandler: (card) => {
                orderedCards.push(card);
                promptCards = promptCards.filter((c) => c !== card);
                if(promptCards.length > 1) {
                    this.truthSeekerPrompt(
                        context,
                        promptCards,
                        orderedCards,
                        'Which card do you want to be the ' + orderPrompt[orderedCards.length] + ' card?'
                    );
                    return;
                } else if(promptCards.length === 1) {
                    orderedCards.push(promptCards[0]);
                }
                deckToReorder.splice(0, 3, ...orderedCards);
            }
        });
    }
}

Truthseeker.id = 'truthseeker';

module.exports = Truthseeker;
