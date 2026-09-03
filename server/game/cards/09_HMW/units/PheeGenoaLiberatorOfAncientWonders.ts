import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DeployType, NamedAction, RelativePlayer, TargetMode } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class PheeGenoaLiberatorOfAncientWonders extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'phee-genoa#liberator-of-ancient-wonders-id',
            internalName: 'phee-genoa#liberator-of-ancient-wonders',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: `Exhaust the deployed leader unless its controller pays ${TextHelper.resource(2)}`,
            contextTitle: (context) => `Exhaust ${context.event.card.title} unless its controller pays ${TextHelper.resource(2)}`,
            when: {
                // A leader deployed as a pilot is an upgrade and cannot be exhausted, so the ability would have no effect
                onLeaderDeployed: (event, context) =>
                    event.card.controller === context.player.opponent &&
                    event.type !== DeployType.LeaderUpgrade
            },
            targetResolver: {
                mode: TargetMode.SelectUnless,
                choosingPlayer: RelativePlayer.Opponent,
                activePromptTitle: (context) => `[Exhaust] ${context.event.card.title} or [Pay] ${TextHelper.resource(2)}`,
                unlessEffect: {
                    effect: (context) => abilityHelper.immediateEffects.payResources({
                        target: context.event.card.controller,
                        amount: 2
                    }),
                    promptButtonText: NamedAction.Pay
                },
                defaultEffect: {
                    effect: (context) => abilityHelper.immediateEffects.exhaust({
                        target: context.event.card
                    }),
                    promptButtonText: NamedAction.Exhaust
                },
                highlightCards: (context) => context.event.card,
            }
        });
    }
}
