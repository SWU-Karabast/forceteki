import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class GrenadeStrike extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4042866439',
            internalName: 'grenade-strike',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Defeat a non-leader unit that costs 3 or less',
            targetResolvers: {
                firstUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    optional: false,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                },
                secondUnit: {
                    dependsOn: 'firstUnit',
                    cardTypeFilter: WildcardCardType.Unit,
                    optional: true,
                    cardCondition: (card, context) => card !== context.targets.firstUnit && card.zoneName === context.targets.firstUnit.zoneName,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                }
            }
        });
    }
}

GrenadeStrike.implemented = true;
