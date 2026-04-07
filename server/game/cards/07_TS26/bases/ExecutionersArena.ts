import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';
import { BaseCard } from '../../../core/card/BaseCard';

export default class ExecutionersArena extends BaseCard {
    protected override getImplementationId() {
        return {
            id: 'executioners-arena-id',
            internalName: 'executioners-arena',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEpicActionAbility({
            title: 'For each friendly leader unit, deal 2 damage to a unit',
            immediateEffect: abilityHelper.immediateEffects.sequential((context) => (
                context.player.getArenaUnits({ condition: (c) => c.isLeaderUnit() }).map((_) =>
                    abilityHelper.immediateEffects.selectCard({
                        optional: true,
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: abilityHelper.immediateEffects.damage({ amount: 2 })
                    }))
            ))
        });
    }
}
