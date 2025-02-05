import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class DirectHit extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5093056978',
            internalName: 'direct-hit',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Defeat a non-leader Vehicle unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card) => card.hasSomeTrait(Trait.Vehicle),
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}

DirectHit.implemented = true;
