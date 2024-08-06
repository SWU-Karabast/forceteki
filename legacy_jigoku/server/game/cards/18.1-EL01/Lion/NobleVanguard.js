const DrawCard = require('../../../drawcard.js');
const { CardTypes, Players, Locations } = require('../../../Constants');
const AbilityDsl = require('../../../abilitydsl');
const { default: Soldier } = require('../../Soldier');

class NobleVanguard extends DrawCard {
    setupCardAbilities() {
        const DummyAttachment = new Soldier(this);

        this.reaction({
            title: 'Attach a follower to a character',
            when: {
                onCharacterEntersPlay: (event, context) => {
                    return event.card === context.source && context.player.conflictDeck.size() > 0;
                }
            },
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card, context) => context.game.actions.attach({ attachment: DummyAttachment }).canAffect(card, context),
                gameAction: AbilityDsl.actions.handler({
                    handler: context => {
                        const card = context.player.conflictDeck.first();
                        let token = context.game.createToken(card, Soldier);
                        card.owner.removeCardFromPile(card);
                        card.moveTo(Locations.RemovedFromGame);
                        const moveEvents = [];
                        context.game.actions.attach({ target: context.target, attachment: token }).addEventsToArray(moveEvents, context);
                        context.game.openThenEventWindow(moveEvents);
                        return true;
                    }
                })
            },
            effect: 'attach the top card of their conflict deck to {0} as a +1/+1 attachment'
        });
    }
}

NobleVanguard.id = 'noble-vanguard';

module.exports = NobleVanguard;
