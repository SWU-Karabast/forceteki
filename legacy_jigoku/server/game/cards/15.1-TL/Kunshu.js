const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { AbilityTypes, CardTypes, Locations, Players, PlayTypes } = require('../../Constants');

class Kunshu extends DrawCard {
    setupCardAbilities() {
        this.attachmentConditions({
            myControl: true,
            unique: true
        });

        this.grantedAbilityLimits = {};
        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Play a card',
                cost: AbilityDsl.costs.discardImperialFavor(),
                condition: context => context.source.isParticipating(),
                printedAbility: false,
                target: {
                    cardType: [CardTypes.Event, CardTypes.Attachment],
                    location: [Locations.ConflictDiscardPile],
                    player: Players.Self,
                    controller: Players.Opponent,
                    gameAction: AbilityDsl.actions.playCard(() => ({
                        playType: PlayTypes.Other,
                        ignoreFateCost: true,
                        source: this
                    }))
                },
                effect: 'play {0}'
            })
        });
    }
}

Kunshu.id = 'kunshu';

module.exports = Kunshu;
