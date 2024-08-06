import { EventNames } from '../../Constants';
import { EventRegistrar } from '../../EventRegistrar';
import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class IkomaAnakazu extends DrawCard {
    static id = 'ikoma-anakazu';

    private brokenProvincesThisPhase = new Map<string, number>();
    private eventRegistrar?: EventRegistrar;

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register([EventNames.OnBreakProvince, EventNames.OnPhaseEnded]);

        this.persistentEffect({
            condition: (context) =>
                context.source.isParticipating() &&
                context.player.opponent &&
                this.brokenProvincesThisPhase.get(context.player.opponent.name) > 0,
            effect: AbilityDsl.effects.modifyBothSkills(3)
        });
    }

    public onPhaseEnded() {
        this.brokenProvincesThisPhase.clear();
    }

    public onBreakProvince(event: any) {
        if (event.conflict && event.conflict.attackingPlayer) {
            const oldValue = this.brokenProvincesThisPhase.get(event.conflict.attackingPlayer.name) || 0;
            this.brokenProvincesThisPhase.set(event.conflict.attackingPlayer.name, oldValue + 1);
        }
    }
}
