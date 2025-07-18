import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class FifthBrotherFearHunter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8395007579',
            internalName: 'fifth-brother#fear-hunter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Deal 1 damage to this unit and 1 damage to another ground unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.damage((context) => ({
                    target: context.source,
                    amount: 1
                })),
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: ZoneName.GroundArena,
                    cardCondition: (card, context) => card !== context.source,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                })
            ])
        });

        registrar.addConstantAbility({
            title: 'This unit gains Raid 1 for each damage on him',
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(
                (target) => ({ keyword: KeywordName.Raid, amount: target.damage })
            )
        });
    }
}
