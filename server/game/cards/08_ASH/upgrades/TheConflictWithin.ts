import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { NamedAction, TargetMode } from '../../../core/Constants';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TheConflictWithin extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '0336845028',
            internalName: 'the-conflict-within',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addGainTriggeredAbilityTargetingAttached({
            title: `Exhaust it unless its controller pays ${TextHelper.resource(3)}`,
            when: {
                onCardReadied: (event, context) => context.source === event.card
            },
            targetResolver: {
                mode: TargetMode.SelectUnless,
                choosingPlayer: (context) => EnumHelpers.asRelativePlayer(context.player, context.source.controller),
                activePromptTitle: (context) => `[Exhaust] ${context.source.title} or [Pay] ${TextHelper.resource(3)}`,
                unlessEffect: {
                    effect: (context) => AbilityHelper.immediateEffects.payResources({
                        target: context.source.controller,
                        amount: 3
                    }),
                    promptButtonText: NamedAction.Pay
                },
                defaultEffect: {
                    effect: (context) => AbilityHelper.immediateEffects.exhaust({
                        target: context.source
                    }),
                    promptButtonText: NamedAction.Exhaust
                },
                highlightCards: (context) => context.source,
            }
        });
    }
}
