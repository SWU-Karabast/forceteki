import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { CardType, WildcardCardType } from '../../../core/Constants';

export default class MakeAnOpening extends EventCard {
    protected override getImplementationId () {
        return {
            id: '3208391441',
            internalName: 'make-an-opening',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Give a unit -2/-2 for this phase. Heal 2 damage from your base',
            targetResolvers: {
                downgradeUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 })
                    })
                },
                heal: {
                    cardTypeFilter: CardType.Base,
                    immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 2 })
                }
            }
        });
    }
}

MakeAnOpening.implemented = true;
