import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, WildcardCardType } from '../../../core/Constants';

export default class AnakinSkywalkerChampionOfMortis extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'anakin-skywalker#champion-of-mortis-id',
            internalName: 'anakin-skywalker#champion-of-mortis'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'If there a Heroism card in your discard pile, you may give a unit -3/-3 for this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.discardZone.hasSomeCard({ aspect: Aspect.Heroism }),
                    onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -3, hp: -3 })
                    })
                })
            },
        });

        this.addWhenPlayedAbility({
            title: 'If there a Villainy card in your discard pile, you may give a unit -3/-3 for this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.discardZone.hasSomeCard({ aspect: Aspect.Villainy }),
                    onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -3, hp: -3 })
                    })
                })
            },
        });
    }
}
