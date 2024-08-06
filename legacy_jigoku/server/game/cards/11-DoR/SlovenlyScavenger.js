const DrawCard = require('../../drawcard.js');
const { TargetModes, Locations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class SlovenlyScavenger extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Shuffle a discard pile into a deck',
            when: {
                afterConflict: (event, context) => event.conflict.winner === context.source.controller && context.source.isParticipating()
            },
            cost: AbilityDsl.costs.sacrificeSelf(),
            target: {
                mode: TargetModes.Select,
                targets: true,
                activePromptTitle: 'Choose which discard pile to shuffle:',
                choices: {
                    [this.getChoiceName('MyDynasty')]: context => context.player.dynastyDiscardPile.size() > 0,
                    [this.getChoiceName('MyConflict')]: context => context.player.conflictDiscardPile.size() > 0,
                    [this.getChoiceName('OppDynasty')]: context => context.player.opponent && context.player.opponent.dynastyDiscardPile.size() > 0,
                    [this.getChoiceName('OppConflict')]: context => context.player.opponent && context.player.opponent.conflictDiscardPile.size() > 0
                }
            },
            effect: 'shuffle {1} into their deck',
            effectArgs: context => this.getEffectArg(context.select),
            handler: context => {
                if(context.select === this.getChoiceName('MyDynasty')) {
                    this.owner.dynastyDiscardPile.forEach(card => {
                        this.owner.moveCard(card, Locations.DynastyDeck);
                    });
                    this.owner.shuffleDynastyDeck();
                }
                if(context.select === this.getChoiceName('MyConflict')) {
                    this.owner.conflictDiscardPile.forEach(card => {
                        this.owner.moveCard(card, Locations.ConflictDeck);
                    });
                    this.owner.shuffleConflictDeck();
                }
                if(this.owner.opponent && context.select === this.getChoiceName('OppDynasty')) {
                    this.owner.opponent.dynastyDiscardPile.forEach(card => {
                        this.owner.opponent.moveCard(card, Locations.DynastyDeck);
                    });
                    this.owner.opponent.shuffleDynastyDeck();
                }
                if(this.owner.opponent && context.select === this.getChoiceName('OppConflict')) {
                    this.owner.opponent.conflictDiscardPile.forEach(card => {
                        this.owner.opponent.moveCard(card, Locations.ConflictDeck);
                    });
                    this.owner.opponent.shuffleConflictDeck();
                }
            }
        });
    }

    getEffectArg(selection) {
        if(selection === this.getChoiceName('MyDynasty')) {
            return this.owner.name + '\'s dynasty discard pile';
        }
        if(selection === this.getChoiceName('MyConflict')) {
            return this.owner.name + '\'s conflict discard pile';
        }
        if(this.owner.opponent && selection === this.getChoiceName('OppDynasty')) {
            return this.owner.opponent.name + '\'s dynasty discard pile';
        }
        if(this.owner.opponent && selection === this.getChoiceName('OppConflict')) {
            return this.owner.opponent.name + '\'s conflict discard pile';
        }
        return 'Unknown target';
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
}

SlovenlyScavenger.id = 'slovenly-scavenger';

module.exports = SlovenlyScavenger;
