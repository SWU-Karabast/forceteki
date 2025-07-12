import AbilityHelper from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { TargetMode } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class InDebtToCrimsonDawn extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '7962923506',
            internalName: 'in-debt-to-crimson-dawn',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Exhaust it unless its controller pay 2 resources',
            when: {
                onCardReadied: (event, context) => context.source.parentCard === event.card
            },
            targetResolver: {
                mode: TargetMode.Select,
                choosingPlayer: (context) => EnumHelpers.asRelativePlayer(context.player, context.source.parentCard.controller),
                choices: (context) => ({
                    ['Pay 2 resources']: AbilityHelper.immediateEffects.payResourceCost({
                        target: context.source.parentCard.controller,
                        amount: 2
                    }),
                    [`Exhaust ${context.source.parentCard.title}`]: AbilityHelper.immediateEffects.exhaust({
                        target: context.source.parentCard
                    })
                })
            }
        });
    }
}
