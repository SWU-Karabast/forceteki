import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';

export default class RevealIntentions extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'reveal-intentions-id',
            internalName: 'reveal-intentions',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Each player reveals their hand and their opponent discards a card from it. Then, each player draws a card',
            immediateEffect: abilityHelper.immediateEffects.sequential([
                abilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                    activePromptTitle: 'Discard a card from opponent\'s hand',
                    target: context.player.opponent.hand,
                    canChooseFewer: false,
                    immediateEffect: abilityHelper.immediateEffects.discardSpecificCard(),
                })),
                abilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                    activePromptTitle: 'Discard a card from opponent\'s hand',
                    target: context.player.hand,
                    player: context.player.opponent,
                    canChooseFewer: false,
                    immediateEffect: abilityHelper.immediateEffects.discardSpecificCard()
                })),
                abilityHelper.immediateEffects.draw((context) => ({ target: [context.player, context.player.opponent] })),
            ])
        });
    }
}