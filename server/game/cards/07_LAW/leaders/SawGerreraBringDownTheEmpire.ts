import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class SawGerreraBringDownTheEmpire extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3428873373',
            internalName: 'saw-gerrera#bring-down-the-empire',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Attack with a unit. It gets +2/+0 and gains Overwhelm for this attack. After completing this attack, defeat it.',
            cost: [AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.attack({
                        attackerLastingEffects: [
                            { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }) },
                            { effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm) },
                        ]
                    }),
                    AbilityHelper.immediateEffects.defeat()
                ]),
            },
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackCompletedAbility({
            title: 'Attack with another unit. It gets +2/+0 and gains Overwhelm for this attack. After completing this attack, defeat it.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.attack({
                        allowExhaustedAttacker: false,
                        attackerLastingEffects: [
                            { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }) },
                            { effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm) },
                        ],
                    }),
                    AbilityHelper.immediateEffects.defeat()
                ]),
            },
        });
    }
}