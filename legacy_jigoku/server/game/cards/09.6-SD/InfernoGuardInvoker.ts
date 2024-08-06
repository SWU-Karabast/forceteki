import { CardTypes, Durations, EventNames, Players } from '../../Constants';
import { EventRegistrar } from '../../EventRegistrar';
import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class InfernoGuardInvoker extends DrawCard {
    static id = 'inferno-guard-invoker';

    private provinceBroken = false;
    private eventRegistrar?: EventRegistrar;

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register([EventNames.OnBreakProvince, EventNames.OnConflictDeclared]);

        this.action({
            title: 'honor this character',
            condition: (context) => context.game.isDuringConflict('military'),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card) => card.isParticipating()
            },
            effect: 'honor {0}. It will be discarded if a province is broken this conflict',
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.honor((context) => ({ target: context.target })),
                AbilityDsl.actions.cardLastingEffect((context) => ({
                    duration: Durations.UntilEndOfPhase,
                    target: context.target,
                    effect: AbilityDsl.effects.delayedEffect({
                        when: {
                            onConflictFinished: () => this.provinceBroken
                        },
                        message: '{1} is discarded, burned to a pile of ash due to the delayed effect of {0}',
                        messageArgs: [context.source, context.target],
                        gameAction: AbilityDsl.actions.sacrifice({ target: context.target })
                    })
                }))
            ])
        });
    }

    public onBreakProvince() {
        this.provinceBroken = true;
    }

    public onConflictDeclared() {
        this.provinceBroken = false;
    }
}
