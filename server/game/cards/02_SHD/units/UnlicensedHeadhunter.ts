import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class UnlicensedHeadhunter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2965702252',
            internalName: 'unlicensed-headhunter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `When this unit is exhausted, it gains '${TextHelper.Bounty} - Heal 5 damage from your base'`,
            condition: (context) => context.source.exhausted,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({
                keyword: KeywordName.Bounty,
                ability: {
                    title: 'Heal 5 damage from your base',
                    immediateEffect: AbilityHelper.immediateEffects.heal(
                        (context) => ({ target: context.player.base, amount: 5 })
                    )
                }
            })
        });
    }
}
