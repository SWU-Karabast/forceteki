import AbilityDsl = require('../../abilitydsl');
import { BaseOni } from './_BaseOni';

export default class BloodthirstyKansen extends BaseOni {
    static id = 'bloodthirsty-kansen';

    public setupCardAbilities() {
        super.setupCardAbilities();
        this.reaction({
            title: 'Resolve the contested ring',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.source.controller && context.source.isParticipating()
            },
            gameAction: AbilityDsl.actions.resolveConflictRing()
        });
    }
}
