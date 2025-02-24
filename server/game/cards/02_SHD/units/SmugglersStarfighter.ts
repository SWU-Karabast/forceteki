import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class SmugglersStarfighter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1312599620',
            internalName: 'smugglers-starfighter',
        };
    }

    protected override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Give -3/-0 to an enemy unit if you control another Underworld unit',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.controller.isTraitInPlay(Trait.Underworld, context.source),
                    onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -3, hp: 0 })
                    }),
                })
            }
        });
    }
}
