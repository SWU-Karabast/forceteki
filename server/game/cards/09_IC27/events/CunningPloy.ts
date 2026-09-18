import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class CunningPloy extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'cunning-ploy-id',
            internalName: 'cunning-ploy',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Look at an opponent\'s hand. You may discard a card from it. If you do, that player draws a card. Exhaust an enemy unit. You may attack with a unit. It gets +3/+0 for this attack.',
            immediateEffect: AbilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                activePromptTitle: 'Discard a card. If you do, that player draws a card.',
                target: context.player.opponent.hand,
                canChooseFewer: true,
                immediateEffect: AbilityHelper.immediateEffects.sequential({
                    gameSystems: [
                        AbilityHelper.immediateEffects.discardSpecificCard(),
                        AbilityHelper.immediateEffects.draw((context) => ({ target: context.player.opponent })),
                    ],
                }),
            })),
            then: {
                title: 'Exhaust an enemy unit',
                targetResolver: {
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust(),
                },
                then: {
                    title: 'Attack with a unit. It gets +3/+0 for this attack',
                    optional: true,
                    targetResolver: {
                        immediateEffect: AbilityHelper.immediateEffects.attack({
                            attackerLastingEffects: { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 0 }) },
                        }),
                    },
                },
            },
        });
    }
}
