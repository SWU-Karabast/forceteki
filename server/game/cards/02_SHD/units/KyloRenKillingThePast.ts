import { NonLeaderUnitCard } from '../../../../../server/game/core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';
import { Aspect, RelativePlayer, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class KyloRenKillingThePast extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6263178121',
            internalName: 'kylo-ren#killing-the-past'
        };
    }

    public override setupCardAbilities() {
        this.addIgnoreSpecificAspectPenaltyAbility({
            title: 'If you control Rey, ignore the Villainy aspect when playing this',
            ignoredAspects: Aspect.Villainy,
            condition: (context) => context.source.controller.controlsLeaderOrUnitWithTitle('Rey')
        });

        this.addOnAttackAbility({
            title: 'Give a unit +2/0 for this phase',
            targetResolver: {
                controller: WildcardRelativePlayer.Any,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                    }),
                    AbilityHelper.immediateEffects.conditional({
                        condition: (context) => context.target.aspects.includes(Aspect.Villainy),
                        onTrue: AbilityHelper.immediateEffects.noAction(),
                        onFalse: AbilityHelper.immediateEffects.giveExperience()
                    })
                ])
            },
        });
    }
}

KyloRenKillingThePast.implemented = true;