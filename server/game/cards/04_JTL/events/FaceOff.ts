import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer } from '../../../core/Constants';

export default class FaceOff extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4942377291',
            internalName: 'face-off',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'If no player has taken the initiative this phase, you may ready an enemy unit. If you do, ready a friendly unit in the same arena',
            optional: true,
            targetResolver: {
                condition: (context) => !context.game.isInitiativeClaimed,
                activePromptTitle: 'Choose an enemy unit to ready',
                controller: RelativePlayer.Opponent,
                cardCondition: (card) => card.canBeExhausted() && card.exhausted,
                immediateEffect: AbilityHelper.immediateEffects.ready((context) => context.target),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Ready a friendly unit in the same arena',
                targetResolver: {
                    controller: RelativePlayer.Self,
                    cardCondition: (card) => card.canBeExhausted() && card.exhausted && card.zone === ifYouDoContext.target.zone,
                    immediateEffect: AbilityHelper.immediateEffects.ready((context) => context.target),
                }
            }),
        });
    }
}

