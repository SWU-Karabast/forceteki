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
            // TODO: The player won't be warned that Face Off will do nothing if the initiative has been claimed because of this optional
            optional: true,
            targetResolver: {
                condition: (context) => !context.game.isInitiativeClaimed,
                activePromptTitle: 'Choose an enemy unit to ready',
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.ready((context) => context.target),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Ready a friendly unit in the same arena',
                targetResolver: {
                    controller: RelativePlayer.Self,
                    cardCondition: (card) => card.zoneName === ifYouDoContext.target.zoneName,
                    immediateEffect: AbilityHelper.immediateEffects.ready((context) => context.target),
                }
            }),
        });
    }
}

