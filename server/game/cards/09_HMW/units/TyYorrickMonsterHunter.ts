import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageModificationType, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';
import { DamageSourceType } from '../../../IDamageOrDefeatSource';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TyYorrickMonsterHunter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'ty-yorrick#monster-hunter-id',
            internalName: 'ty-yorrick#monster-hunter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: `Deal 1 damage to a ${TextHelper.Trait.Creature} unit`,
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasSomeTrait(Trait.Creature),
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });

        registrar.addDamageModificationAbility({
            title: 'If a friendly ability would deal damage, you may have that ability deal that much damage plus 1 instead',
            modificationType: DamageModificationType.Increase,
            amount: 1,
            optional: true,
            damageOfType: DamageSourceType.Ability,
            onlyFromPlayer: RelativePlayer.Self,
            shouldCardHaveDamageModification: () => true,
        });
    }
}