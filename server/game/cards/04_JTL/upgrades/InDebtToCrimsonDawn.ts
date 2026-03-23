import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { NamedAction, TargetMode } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class InDebtToCrimsonDawn extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '7962923506',
            internalName: 'in-debt-to-crimson-dawn',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: `Exhaust it unless its controller pay ${TextHelper.resource(2)}`,
            when: {
                onCardReadied: (event, context) => context.source.parentCard === event.card
            },
            targetResolver: {
                mode: TargetMode.SelectUnless,
                choosingPlayer: (context) => EnumHelpers.asRelativePlayer(context.player, context.source.parentCard.controller),
                activePromptTitle: (context) => `[Exhaust] ${context.source.parentCard.title} or [Pay] ${TextHelper.resource(2)}`,
                unlessEffect: {
                    effect: (context) => AbilityHelper.immediateEffects.payResources({
                        target: context.source.parentCard.controller,
                        amount: 2
                    }),
                    promptButtonText: NamedAction.Pay
                },
                defaultEffect: {
                    effect: (context) => AbilityHelper.immediateEffects.exhaust({
                        target: context.source.parentCard
                    }),
                    promptButtonText: NamedAction.Exhaust
                }
            }
        });
    }
}
