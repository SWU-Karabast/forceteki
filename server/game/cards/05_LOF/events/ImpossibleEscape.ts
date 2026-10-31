import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

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
            targetResolver: {
                activePromptTitle: 'Choose an effect. If you do either, exhaust an enemy unit and draw a card',
                mode: TargetMode.Select,
                choices: {
                    ['Exhaust a friendly unit']: AbilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Exhaust a friendly unit',
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Self,
                        immediateEffect: AbilityHelper.immediateEffects.exhaust(),
                    }),
                    ['Use the Force']: AbilityHelper.immediateEffects.useTheForce(),
                }
            },
            ifYouDo: {
                title: 'Exhaust an enemy unit and draw a card',
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Exhaust an enemy unit',
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