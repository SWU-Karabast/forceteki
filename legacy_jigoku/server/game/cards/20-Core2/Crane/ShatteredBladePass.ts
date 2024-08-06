import { CardTypes, Players, Durations } from '../../../Constants';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';

export default class ShatteredBladePass extends ProvinceCard {
    static id = 'shattered-blade-pass';

    public setupCardAbilities() {
        this.action({
            title: 'Ready a character and move it to the conflict',
            condition: (context) => context.game.currentConflict.defenders.length === 0,
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.ready(),
                    AbilityDsl.actions.moveToConflict(),
                    AbilityDsl.actions.playerLastingEffect(context => ({
                        targetController: context.player,
                        duration: Durations.UntilPassPriority,
                        effect: AbilityDsl.effects.additionalAction()
                    }))
                ])
            },
            effect: 'ready {0} and move it into the conflict, taking an additional action'
        });
    }
}
