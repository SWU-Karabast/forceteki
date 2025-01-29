import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class GeneralRieekanDefensiveStrategist extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3468546373',
            internalName: 'general-rieekan#defensive-strategist'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Choose a friendly unit. If it has Sentinel, give an Experience token to it. Otherwise, it gains Sentinel for this phase',
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker === context.source,
                onCardPlayed: (event, context) => event.card === context.source
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.target.isUnit() && context.target.hasSomeKeyword(KeywordName.Sentinel),
                    onTrue: AbilityHelper.immediateEffects.giveExperience(),
                    onFalse: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                    })
                })
            }
        });
    }
}
