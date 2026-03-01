import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NamedAction, RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class IAmYourFather extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0523973552',
            internalName: 'i-am-your-father',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 7 damage to an enemy unit unless its controller says "no"',
            targetResolvers: {
                targetUnit: {
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit
                },
                opponentsChoice: {
                    mode: TargetMode.SelectUnless,
                    dependsOn: 'targetUnit',
                    choosingPlayer: RelativePlayer.Opponent,
                    activePromptTitle: (context) => `${context.targets.targetUnit.title} takes 7 [Damage] or opponent [Draws] 3 cards`,
                    unlessEffect: {
                        effect: AbilityHelper.immediateEffects.draw({ amount: 3 }),
                        promptButtonText: NamedAction.Draw
                    },
                    defaultEffect: {
                        effect: (context) => AbilityHelper.immediateEffects.damage({
                            target: context.targets.targetUnit,
                            amount: 7
                        }),
                        promptButtonText: NamedAction.Damage
                    },
                    highlightCards: (context) => context.targets.targetUnit,
                }
            }
        });
    }
}
