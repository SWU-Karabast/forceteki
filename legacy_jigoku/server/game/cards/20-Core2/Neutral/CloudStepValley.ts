import { CardTypes, Players } from '../../../Constants';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';

const STARTED_IN_CONFLICT = 'started_in';
const STARTED_AT_HOME = 'started_out';

export default class CloudStepValley extends ProvinceCard {
    static id = 'cloud-step-valley';

    setupCardAbilities() {
        this.action({
            title: 'Switch the location of two characters',
            targets: {
                [STARTED_IN_CONFLICT]: {
                    activePromptTitle: 'Choose a participating character to send home',
                    cardType: CardTypes.Character,
                    cardCondition: (card) => card.isParticipating()
                },
                [STARTED_AT_HOME]: {
                    dependsOn: STARTED_IN_CONFLICT,
                    activePromptTitle: 'Choose a character to move to the conflict',
                    cardType: CardTypes.Character,
                    player: (context) =>
                        context.targets[STARTED_IN_CONFLICT].controller === context.player
                            ? Players.Self
                            : Players.Opponent,
                    cardCondition: (card, { targets }) =>
                        card.controller === targets[STARTED_IN_CONFLICT].controller && !card.isParticipating()
                }
            },
            gameAction: AbilityDsl.actions.joint([
                AbilityDsl.actions.sendHome(({ targets }) => ({ target: targets[STARTED_IN_CONFLICT] })),
                AbilityDsl.actions.moveToConflict(({ targets }) => ({ target: targets[STARTED_AT_HOME] }))
            ]),
            effect: 'move {1} home, and move {2} to the conflict',
            effectArgs: (context) => [context.targets[STARTED_IN_CONFLICT], context.targets[STARTED_AT_HOME]]
        });
    }
}