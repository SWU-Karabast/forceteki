import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { NamedAction, RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class QuiGonJinnTheNegotiationsWillBeShort extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1270747736',
            internalName: 'quigon-jinn#the-negotiations-will-be-short',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Choose a non-leader ground unit. Its owner puts it on the top or bottom of their deck',
            targetResolvers: {
                unit: {
                    optional: true,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    zoneFilter: ZoneName.GroundArena,
                },
                deck: {
                    mode: TargetMode.Select,
                    dependsOn: 'unit',
                    choosingPlayer: (context) => (context.targets.unit.owner === context.player ? RelativePlayer.Self : RelativePlayer.Opponent),
                    activePromptTitle: (context) => `Move ${context.targets.unit.title} to [Top] or [Bottom] of your deck`,
                    choices: (context) => ({
                        [NamedAction.Top]: AbilityHelper.immediateEffects.moveToTopOfDeck({ target: context.targets.unit }),
                        [NamedAction.Bottom]: AbilityHelper.immediateEffects.moveToBottomOfDeck({ target: context.targets.unit }),
                    }),
                    highlightCards: (context) => context.targets.unit,
                }
            }
        });
    }
}