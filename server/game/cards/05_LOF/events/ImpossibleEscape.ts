import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { EventName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class ImpossibleEscape extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9069308523',
            internalName: 'impossible-escape',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Exhaust a friendly unit or use the Force. If you do either, exhaust an enemy unit and draw a card',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit(),
                onFalse: AbilityHelper.immediateEffects.useTheForce(),
                onTrue: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.hasTheForce,
                    onTrue: AbilityHelper.immediateEffects.chooseModalEffects({
                        amountOfChoices: 1,
                        choices: {
                            ['Use the Force']: AbilityHelper.immediateEffects.useTheForce(),
                            ['Exhaust a friendly unit']: AbilityHelper.immediateEffects.selectCard({
                                cardTypeFilter: WildcardCardType.Unit,
                                controller: RelativePlayer.Self,
                                innerSystem: AbilityHelper.immediateEffects.exhaust(),
                            })
                        }
                    }),
                    onFalse: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Self,
                        innerSystem: AbilityHelper.immediateEffects.exhaust(),
                    })
                })
            }),
            ifYouDo: {
                title: 'Exhaust an enemy unit and draw a card',
                ifYouDoCondition: (context) =>
                    context.events.some((event) => event.name === EventName.OnCardLeavesPlay && event.card.isForceToken() && event.player === context.player) ||
                    context.events.some((event) => event.name === EventName.OnCardExhausted && event.card.isUnit() && event.card.controller === context.player),
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Opponent,
                        innerSystem: AbilityHelper.immediateEffects.exhaust(),
                    }),
                    AbilityHelper.immediateEffects.draw(),
                ]),
            },
        });
    }
}