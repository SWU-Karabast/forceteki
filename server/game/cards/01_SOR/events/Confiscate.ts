import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class Confiscate extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5950125325',
            internalName: 'confiscate',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Defeat an upgrade',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}

Confiscate.implemented = true;