import { TargetModes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import type { Conflict } from '../../../conflict';
import DrawCard from '../../../drawcard';
import type Ring from '../../../ring';
import type { AbilityContext } from '../../../AbilityContext';
import type { ProvinceCard } from '../../../ProvinceCard';
import type { TriggeredAbilityContext } from '../../../TriggeredAbilityContext';

function isamuWentHome(event: any, context: TriggeredAbilityContext<ShinjoIsamu>) {
    return event.card === context.source;
}

export default class ShinjoIsamu extends DrawCard {
    static id = 'shinjo-isamu';

    setupCardAbilities() {
        this.reaction({
            title: 'Resolve a ring effect',
            when: {
                onSendHome: isamuWentHome,
                onReturnHome: isamuWentHome
            },
            target: {
                mode: TargetModes.Ring,
                activePromptTitle: 'Choose a ring',
                ringCondition: (ring: Ring, context: AbilityContext) =>
                    ring.isUnclaimed() &&
                    (context.game.currentConflict as Conflict)
                        .getConflictProvinces()
                        .some((province: ProvinceCard) => province.getElement().includes(ring.element)),
                gameAction: AbilityDsl.actions.resolveRingEffect()
            },
            effect: 'resolve the {0} effect'
        });
    }
}
