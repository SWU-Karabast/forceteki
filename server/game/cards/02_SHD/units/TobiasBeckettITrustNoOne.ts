import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import * as AbilityLimit from '../../../core/ability/AbilityLimit';

export default class TobiasBeckettITrustNoOne extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3010720738',
            internalName: 'tobias-beckett#i-trust-no-one'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Exhaust a unit that costs the same as or less than the non-unit card you played',
            when: {
                onCardPlayed: (event, context) => event.player === context.player && !event.card.isUnit(),
            },
            optional: true,
            limit: AbilityLimit.perRound(1),
            targetResolver: {
                cardCondition: (card, context) => card.isUnit() && card.cost <= context.event.card.cost,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}
