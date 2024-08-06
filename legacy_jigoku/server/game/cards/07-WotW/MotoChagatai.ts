import { EventNames } from '../../Constants';
import { EventRegistrar } from '../../EventRegistrar';
import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class MotoChagatai extends DrawCard {
    static id = 'moto-chagatai';

    private provinceBroken = new Map<string, boolean>();
    private eventRegistrar?: EventRegistrar;

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register([EventNames.OnBreakProvince, EventNames.OnConflictFinished]);

        this.persistentEffect({
            condition: (context) =>
                context.source.isAttacking() && this.provinceBroken.get(context.player.opponent.uuid),
            effect: AbilityDsl.effects.doesNotBow()
        });
    }

    public onBreakProvince(event: any) {
        this.provinceBroken.set(event.card.controller.uuid, true);
    }

    public onConflictFinished() {
        this.provinceBroken.clear();
    }
}
