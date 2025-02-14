import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class CalculatingMagnaGuard extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1039828081',
            internalName: 'calculating-magnaguard'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'This unit gains Sentinel for this phase',
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onCardDefeated: (event, context) => event.card.isUnit() && event.card.controller === context.source.controller && event.card !== context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
            })
        });
    }
}

