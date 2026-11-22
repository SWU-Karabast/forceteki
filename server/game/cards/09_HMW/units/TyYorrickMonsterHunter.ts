import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageModificationType, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';
import { DamageSourceType } from '../../../IDamageOrDefeatSource';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TyYorrickMonsterHunter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1425091321',
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
            title: 'Increase damage by 1',
            modificationType: DamageModificationType.Increase,
            amount: 1,
            optional: true,
            damageOfType: DamageSourceType.Ability,
            onlyFromPlayer: RelativePlayer.Self,
            applyAtAbilityInitiation: true,
        });
    }
}