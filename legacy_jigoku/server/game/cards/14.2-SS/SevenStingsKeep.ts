import { Durations } from '../../Constants';
import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';

export default class SevenStingsKeep extends StrongholdCard {
    static id = 'seven-stings-keep';

    setupCardAbilities() {
        this.interrupt({
            title: 'Force defenders to assign first',
            when: {
                onConflictOpportunityAvailable: (event, context) => event.player === context.player
            },
            cost: [AbilityDsl.costs.bowSelf()],
            effect: 'force {1} to declare defenders before attackers are chosen this conflict',
            effectArgs: (context) => [context.player.opponent],
            gameAction: AbilityDsl.actions.menuPrompt((context) => ({
                activePromptTitle: 'Choose how many characters will be attacking',
                choices: this.getChoices(context),
                gameAction: AbilityDsl.actions.playerLastingEffect({
                    duration: Durations.UntilEndOfConflict
                }),
                choiceHandler: (choice, displayMessage) => {
                    const amount = parseInt(choice);
                    if (displayMessage) {
                        this.game.addMessage(
                            '{0} will attack with {1} character{2}',
                            context.player,
                            choice,
                            choice === '1' ? '' : 's'
                        );
                    }
                    return {
                        effect: AbilityDsl.effects.defendersChosenFirstDuringConflict(amount)
                    };
                }
            }))
        });
    }

    getChoices(context) {
        const min = 1;
        const max = context.event.attackerMatrix.maximumNumberOfAttackers;
        const array = [];
        for (let i = min; i <= max; i++) {
            array.push(i.toString());
        }
        return array;
    }
}
