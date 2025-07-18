import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class ImpossibleEscape extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9069308523',
            internalName: 'impossible-escape',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust a friendly unit or use the Force. If you do either, exhaust an enemy unit and draw a card',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit() || context.player.hasTheForce,
                onFalse: AbilityHelper.immediateEffects.noAction(),
                onTrue: AbilityHelper.immediateEffects.chooseModalEffects({
                    amountOfChoices: 1,
                    choices: {
                        ['Use the Force']: AbilityHelper.immediateEffects.useTheForce(),
                        ['Exhaust a friendly unit']: AbilityHelper.immediateEffects.selectCard({
                            cardTypeFilter: WildcardCardType.Unit,
                            controller: RelativePlayer.Self,
                            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
                        })
                    }
                }),
            }),
            ifYouDo: {
                title: 'Exhaust an enemy unit and draw a card',
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Opponent,
                        immediateEffect: AbilityHelper.immediateEffects.exhaust(),
                    }),
                    AbilityHelper.immediateEffects.draw(),
                ]),
            },
        });
    }
}