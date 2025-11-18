import type { IAbilityHelper } from '../../../AbilityHelper';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NamedAction, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class LookTheOtherWay extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2750823386',
            internalName: 'look-the-other-way',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust a unit unless its controller pays 2 resources.',
            targetResolvers: {
                targetUnit: {
                    cardTypeFilter: WildcardCardType.Unit
                },
                opponentsChoice: {
                    mode: TargetMode.Select,
                    dependsOn: 'targetUnit',
                    choosingPlayer: (context) => EnumHelpers.asRelativePlayer(context.player, context.targets.targetUnit.controller),
                    activePromptTitle: (context) => `[Exhaust] ${context.targets.targetUnit.title} or [Pay] 2 resources`,
                    choices: (context) => ({
                        [NamedAction.Exhaust]: AbilityHelper.immediateEffects.exhaust({
                            target: context.targets.targetUnit,
                        }),
                        [NamedAction.Pay]: AbilityHelper.immediateEffects.payResourceCost({
                            target: context.targets.targetUnit.controller,
                            amount: 2
                        })
                    }),
                    highlightCards: (context) => context.targets.targetUnit,
                }
            }
        });
    }
}
