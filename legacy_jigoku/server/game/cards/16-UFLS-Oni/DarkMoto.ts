import AbilityDsl = require('../../abilitydsl');
import { BaseOni } from './_BaseOni';

export default class DarkMoto extends BaseOni {
    static id = 'dark-moto';

    public setupCardAbilities() {
        super.setupCardAbilities();
        this.reaction({
            title: 'Place a fate and prevent from bowing',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.source.controller && context.source.isParticipating()
            },
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.placeFate((context) => ({
                    target: context.source,
                    origin: context.player
                })),
                AbilityDsl.actions.cardLastingEffect((context) => ({
                    target: context.source,
                    effect: AbilityDsl.effects.doesNotBow()
                }))
            ]),
            effect: 'place a fate on and prevent {0} from bowing as a result of conflict resolution'
        });
    }
}
