import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Location, WildcardCardType } from '../../../core/Constants';

export default class EmboStoicAndResolute extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0518313150',
            internalName: 'embo#stoic-and-resolute'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'If the defender was defeated, heal up to 2 damage from a unit',
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker === context.source,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.event.attack.target.location === Location.Discard,
                    onTrue: AbilityHelper.immediateEffects.heal({ amount: 2 }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            }
        });
    }
}

EmboStoicAndResolute.implemented = true;
