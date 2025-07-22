import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class MiningGuildTieFighter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4299027717',
            internalName: 'mining-guild-tie-fighter'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Pay 2 resources to draw',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.payResourceCost((context) => ({
                target: context.player,
                amount: 2
            })),
            ifYouDo: {
                title: 'Draw a card',
                immediateEffect: AbilityHelper.immediateEffects.draw()
            }
        });
    }
}
