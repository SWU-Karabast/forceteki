import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { PhaseName, WildcardCardType } from '../../../core/Constants';

export default class Rehabilitation extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9550024414',
            internalName: 'rehabilitation',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Give a unit –3/–0, then take control of it for this phase',
            targetResolver: {
                activePromptTitle: 'Give a unit –3/–0, then take control of it for this phase',
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -3, hp: -0 })
                    }),
                    AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                            newController: context.player,
                        })),
                        AbilityHelper.immediateEffects.delayedCardEffect((context) => ({
                            title: 'Owner takes control',
                            when: {
                                onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                            },
                            effectDescription: 'apply an effect that will give control to its owner at the start of the regroup phase',
                            immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit({
                                newController: context.target.owner,
                                excludeLeaderUnit: false
                            })
                        }))
                    ])
                ])
            }
        });
    }
}