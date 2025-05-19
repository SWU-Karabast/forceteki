import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class YaddleAChanceToMakeThingsRight extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'yaddle#a-chance-to-make-things-right-id',
            internalName: 'yaddle#a-chance-to-make-things-right',
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Each other friendly Jedi unit gains Restore 1 for this phase',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.player.getArenaUnits({ trait: Trait.Jedi, otherThan: context.source }),
                effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 1 })
            }))
        });
    }
}
