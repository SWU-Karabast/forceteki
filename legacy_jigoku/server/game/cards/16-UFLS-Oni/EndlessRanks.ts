import { Players, CardTypes, Locations } from '../../Constants';
import AbilityDsl = require('../../abilitydsl');
import { BaseOni } from './_BaseOni';

export default class EndlessRanks extends BaseOni {
    static id = 'endless-ranks';

    public setupCardAbilities() {
        super.setupCardAbilities();
        this.reaction({
            title: 'Put a dynasty character on top of your deck',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.source.controller && context.source.isParticipating()
            },
            target: {
                controller: Players.Self,
                cardType: CardTypes.Character,
                location: Locations.DynastyDiscardPile,
                gameAction: AbilityDsl.actions.moveCard((context) => ({
                    target: context.target,
                    destination: Locations.DynastyDeck
                }))
            }
        });
    }
}
