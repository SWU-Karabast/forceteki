import { TargetModes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class WebisusBlessing extends DrawCard {
    static id = 'webisu-s-blessing';

    setupCardAbilities() {
        this.action({
            title: 'Discard status tokens',
            targets: {
                first: {
                    activePromptTitle: 'Choose a status token',
                    mode: TargetModes.Token,
                    gameAction: AbilityDsl.actions.discardStatusToken()
                },
                second: {
                    activePromptTitle: 'Choose a status token',
                    dependsOn: 'first',
                    mode: TargetModes.Token,
                    optional: true,
                    tokenCondition: (token, context) => token !== context.tokens.first[0],
                    gameAction: AbilityDsl.actions.discardStatusToken()
                }
            },
            effect: "discard {1}'s {2}{3}{4}{5}{6}",
            effectArgs: (context) =>
                context.tokens.second
                    ? [
                          context.tokens.first[0].card,
                          context.tokens.first,
                          ' and ',
                          context.tokens.second[0].card,
                          "'s ",
                          context.tokens.second
                      ]
                    : [context.tokens.first[0].card, context.tokens.first, '', '', '', '']
        });
    }
}
