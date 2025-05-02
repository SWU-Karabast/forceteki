import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

export default class QuiGonJinnTheNegotiationsWillBeShort extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'temp-qui-gon-id',
            internalName: 'qui-gon-jinn#the-negotiations-will-be-short',
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Choose a non-leader ground unit. Its owner puts it on the top or bottom of their deck\n',
            optional: true,
            targetResolvers: {
                unit: {
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    zoneFilter: ZoneName.GroundArena,
                },
                deck: {
                    mode: TargetMode.Select,
                    dependsOn: 'unit',
                    choosingPlayer: (context) => (context.targets.unit === context.source ? RelativePlayer.Self : RelativePlayer.Opponent),
                    choices: (context) => ({
                        ['Move to ${context.targets.unit.title} to top']: AbilityHelper.immediateEffects.moveToTopOfDeck({ target: context.targets.unit }),
                        [`Move to ${context.targets.unit.title} to bottom`]: AbilityHelper.immediateEffects.moveToBottomOfDeck({ target: context.targets.unit }),
                    })
                }
            }
        });
    }
}