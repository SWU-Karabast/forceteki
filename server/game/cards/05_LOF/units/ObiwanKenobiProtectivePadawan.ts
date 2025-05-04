import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class ObiwanKenobiProtectivePadawan extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6059510270',
            internalName: 'obiwan-kenobi#protective-padawan'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'This unit gains Sentinel for this phase',
            when: {
                onCardPlayed: (event, context) => event.card.isUnit() &&
                  event.card.hasSomeTrait(Trait.Force) &&
                  event.player === context.player,
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
            })),
        });
    }
}