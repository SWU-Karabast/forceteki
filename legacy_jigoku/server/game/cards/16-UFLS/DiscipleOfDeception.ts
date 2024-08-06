import { CardTypes, TargetModes } from '../../Constants';
import { EventRegistrar } from '../../EventRegistrar';
import type { StatusToken } from '../../StatusToken';
import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class DiscipleOfDeception extends DrawCard {
    static id = 'disciple-of-deception';

    private eventRegistrar?: EventRegistrar;
    private tokensChanged?: StatusToken[];

    public setupCardAbilities() {
        this.tokensChanged = [];
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register(['onConflictFinished']);

        this.action({
            title: 'Treat a status token as a different token',
            condition: (context) => context.game.isDuringConflict(),
            effect: "replace {1}'s {2} with {3} until the end of the conflict",
            effectArgs: (context) => [context.tokens.second[0].card, context.tokens.second, context.tokens.first],
            targets: {
                first: {
                    activePromptTitle: 'Choose the status token to copy',
                    mode: TargetModes.Token,
                    cardType: CardTypes.Character
                },
                second: {
                    dependsOn: 'first',
                    activePromptTitle: 'Choose the status token to overwrite',
                    mode: TargetModes.Token,
                    cardType: CardTypes.Character,
                    cardCondition: (card, context) =>
                        card !== context.tokens.first[0].card &&
                        !card.hasStatusToken(context.tokens.first[0].grantedStatus),
                    tokenCondition: (token, context) => token.grantedStatus !== context.tokens.first[0].grantedStatus,
                    gameAction: AbilityDsl.actions.handler({
                        handler: (context) => {
                            const targetToken = context.tokens.second[0];
                            const newStatus = context.tokens.first[0].grantedStatus;
                            const targetCard = targetToken.card;
                            targetToken.overrideStatus = newStatus;
                            this.tokensChanged.push(targetToken);
                            targetCard.updateStatusTokenEffects();
                        }
                    })
                }
            }
        });
    }

    public onConflictFinished() {
        this.tokensChanged.forEach((token) => {
            const targetCard = token.card;
            token.overrideStatus = undefined;
            if (targetCard) {
                targetCard.updateStatusTokenEffects();
            }
        });
        this.tokensChanged = [];
    }
}
