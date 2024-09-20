import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class SurpriseStrike extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3809048641',
            internalName: 'surprise-strike',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Attack with a unit. It gets +3/+0 for this attack.',
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.attack({
                    attackerLastingEffects: { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 0 }) }
                })
            }
        });
    }
}

SurpriseStrike.implemented = true;
