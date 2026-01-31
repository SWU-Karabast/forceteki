import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { AbilityRestriction, Duration, TargetMode } from '../../../core/Constants';

export default class TransmissionJamming extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1984654702',
            internalName: 'transmission-jamming',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Name a card',
            targetResolver: {
                mode: TargetMode.DropdownList,
                options: this.game.playableCardTitles,
            },
            then: (thenContext) => ({
                title: 'The named card cannot be played for this phase',
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.playerLastingEffect((context) => ({
                        duration: Duration.UntilEndOfPhase,
                        target: context.player.opponent,
                        effect: AbilityHelper.ongoingEffects.playerCannot({
                            cannot: AbilityRestriction.Play,
                            restrictedActionCondition: (context) => context.ability.card.title === thenContext.select,
                        })
                    })),
                    AbilityHelper.immediateEffects.playerLastingEffect((context) => ({
                        duration: Duration.UntilEndOfPhase,
                        target: context.player,
                        effect: AbilityHelper.ongoingEffects.playerCannot({
                            cannot: AbilityRestriction.Play,
                            restrictedActionCondition: (context) => context.ability.card.title === thenContext.select,
                        })
                    }))
                ])
            })
        });
    }
}