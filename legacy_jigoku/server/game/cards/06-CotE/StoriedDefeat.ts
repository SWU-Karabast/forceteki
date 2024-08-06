import CardAbility = require('../../CardAbility');
import { CardTypes, EventNames } from '../../Constants';
import { EventRegistrar } from '../../EventRegistrar';
import AbilityDsl = require('../../abilitydsl');
import BaseCard = require('../../basecard');
import DrawCard = require('../../drawcard');

export default class StoriedDefeat extends DrawCard {
    static id = 'storied-defeat';

    private duelLosersThisConflict = new Set<BaseCard>();
    private eventRegistrar?: EventRegistrar;

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register(['onConflictFinished', 'afterDuel', 'onCharacterEntersPlay']);

        this.action({
            title: 'Bow a character who lost a duel',
            condition: (context) => context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => this.duelLosersThisConflict.has(card),
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.bow(),
                    AbilityDsl.actions.menuPrompt((context) => ({
                        activePromptTitle: 'Spend 1 fate to dishonor ' + context.target.name + '?',
                        choices: ['Yes'].concat(
                            context.events.some((event) => event.name === EventNames.OnCardBowed) ? ['No'] : []
                        ),
                        choiceHandler: (choice, displayMessage) => {
                            if (displayMessage) {
                                context.game.addMessage(
                                    '{0} chooses {1}to spend a fate to dishonor {2}',
                                    context.player,
                                    choice === 'No' ? 'not ' : '',
                                    context.target
                                );
                            }
                            return { amount: choice === 'Yes' ? 1 : 0 };
                        },
                        gameAction: AbilityDsl.actions.joint([
                            AbilityDsl.actions.loseFate({ target: context.player }),
                            AbilityDsl.actions.resolveAbility({
                                target: context.source,
                                subResolution: true,
                                ability: new CardAbility(this.game, context.source, {
                                    title: 'Dishonor this character',
                                    gameAction: AbilityDsl.actions.dishonor({ target: context.target })
                                })
                            })
                        ])
                    }))
                ])
            }
        });
    }

    public onConflictFinished() {
        this.duelLosersThisConflict.clear();
    }

    public onCharacterEntersPlay(event: any) {
        this.duelLosersThisConflict.delete(event.card);
    }

    public afterDuel(event: any) {
        if (Array.isArray(event.duel.loser)) {
            (event.duel.loser as BaseCard[]).forEach((duelLoser) => this.duelLosersThisConflict.add(duelLoser));
        } else if (event.duel.loser) {
            this.duelLosersThisConflict.add(event.duel.loser);
        }
    }
}
