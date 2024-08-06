import { Durations } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class Kakudaira extends ProvinceCard {
    static id = 'kakudaira';

    setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.playerDelayedEffect({
                when: {
                    onPhaseStarted: (event, context) =>
                        context.source.isFaceup() &&
                        !context.source.isBroken &&
                        context.player.getDynastyCardsInProvince(context.source.location).some((a) => a.isFacedown())
                },
                duration: Durations.Persistent,
                message: '{0} reveals {1} due to the constant effect of {2}',
                messageArgs: (effectContext) => [
                    effectContext.player,
                    effectContext.player
                        .getDynastyCardsInProvince(effectContext.source.location)
                        .filter((a) => a.isFacedown()),
                    effectContext.source
                ],
                gameAction: AbilityDsl.actions.flipDynasty((context) => ({
                    target: context.player
                        .getDynastyCardsInProvince(context.source.location)
                        .filter((a) => a.isFacedown())
                }))
            })
        });
    }
}
