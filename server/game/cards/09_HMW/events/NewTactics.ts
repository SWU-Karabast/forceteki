import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NamedAction, RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class NewTactics extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6543905001',
            internalName: 'new-tactics',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose a non-leader unit. Its owner puts it on the top or bottom of their deck',
            targetResolvers: {
                unit: {
                    cardTypeFilter: WildcardCardType.NonLeaderUnit
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