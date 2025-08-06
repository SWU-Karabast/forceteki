import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class YaddleAChanceToMakeThingsRight extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4808722909',
            internalName: 'yaddle#a-chance-to-make-things-right',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Each other friendly Jedi unit gains Restore 1 for this phase',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.player.getArenaUnits({ trait: Trait.Jedi, otherThan: context.source }),
                effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 1 })
            }))
        });
    }
}
