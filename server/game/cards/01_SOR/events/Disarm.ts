import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Duration, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class Disarm extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2587711125',
            internalName: 'disarm',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Give an enemy unit -4/-0 for the phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -4, hp: 0 })
                })
            }
        });
    }
}

Disarm.implemented = true;
