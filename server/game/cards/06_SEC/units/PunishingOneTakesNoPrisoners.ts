import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, WildcardCardType } from '../../../core/Constants';

export default class PunishingOneTakesNoPrisoners extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6096782465',
            internalName: 'punishing-one#takes-no-prisoners',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit gains Raid 1 for each damaged enemy unit',
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword((_, context) => ({
                keyword: KeywordName.Raid,
                amount: context.player.opponent.getArenaUnits({ condition: (card) => card.isUnit() && card.damage > 0 }).length
            }))
        });

        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to a unit',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}
