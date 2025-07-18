import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { AbilityType, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class NalaSeCloneEngineer extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2742665601',
            internalName: 'nala-se#clone-engineer',
        };
    }

    private buildIgnoreCloneAspectAbility(AbilityHelper: IAbilityHelper) {
        return {
            title: 'Ignore the aspect penalty on Clone units you play',
            targetController: RelativePlayer.Self,
            ongoingEffect: AbilityHelper.ongoingEffects.ignoreAllAspectPenalties({
                cardTypeFilter: WildcardCardType.Unit,
                match: (card) => card.hasSomeTrait(Trait.Clone)
            })
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility(this.buildIgnoreCloneAspectAbility(AbilityHelper));
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility(this.buildIgnoreCloneAspectAbility(AbilityHelper));

        registrar.addConstantAbility({
            title: 'Each friendly Clone gains When Defeated: Heal 2 damage from your base',
            matchTarget: (card, context) => card.isUnit() && card.hasSomeTrait(Trait.Clone) && card.controller === context.player,
            ongoingEffect: AbilityHelper.ongoingEffects.gainAbility({
                type: AbilityType.Triggered,
                title: 'Heal 2 damage from your base',
                when: { whenDefeated: true },
                immediateEffect: AbilityHelper.immediateEffects.heal((context) => ({
                    amount: 2,
                    target: context.player.base
                }))
            })
        });
    }
}