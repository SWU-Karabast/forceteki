import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class MiningGuildTieFighter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4299027717',
            internalName: 'mining-guild-tie-fighter'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: `Pay ${TextHelper.resource(2)} to draw`,
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.payResources((context) => ({
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
