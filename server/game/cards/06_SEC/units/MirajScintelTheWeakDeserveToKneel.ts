import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, WildcardCardType } from '../../../core/Constants';

export default class MirajScintelTheWeakDeserveToKneel extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'miraj-scintel#the-weak-deserve-to-kneel-id',
            internalName: 'miraj-scintel#the-weak-deserve-to-kneel',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 3 damage to an undamaged unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.damage === 0,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 3 })
            }
        });

        registrar.addConstantAbility({
            title: 'While a friendly unit is attacking a damaged unit, the attacker gains Overwhelm',
            matchTarget: (card, context) =>
                card.controller === context.player &&
                card.isUnit() && card.isInPlay() && card.isAttacking() &&
                card.activeAttack.getAllTargets().some((x) => x.isUnit() && x.isInPlay() && x.damage > 0),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm)
        });
    }
}
