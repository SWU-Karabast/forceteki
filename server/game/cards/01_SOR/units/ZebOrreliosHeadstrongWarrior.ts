import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Location, WildcardCardType } from '../../../core/Constants';

export default class ZebOrreliosHeadstrongWarrior extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9647945674',
            internalName: 'zeb-orrelios#headstrong-warrior'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'If the defender was defeated, you may deal 4 damage to a ground unit',
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker === context.source,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                locationFilter: Location.GroundArena,
                optional: true,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.event.attack.target.isUnit() && !context.event.attack.target.isInPlay(),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 4 }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            }
        });
    }
}

ZebOrreliosHeadstrongWarrior.implemented = true;
