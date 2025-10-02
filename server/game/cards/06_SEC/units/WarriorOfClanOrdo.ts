import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class WarriorOfClanOrdo extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3906840057',
            internalName: 'warrior-of-clan-ordo',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Aggression];
        registrar.addOnAttackAbility({
            title: `Disclose ${EnumHelpers.aspectString(aspects)} to not deal 2 damage to your base`,
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDoNot: {
                title: 'Deal 2 damage to your base',
                immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                    amount: 2,
                    target: context.player.base,
                }))
            }
        });
    }
}