import { CardTypes, EventNames, Players } from '../../../Constants';
import { EventRegistrar } from '../../../EventRegistrar';
import AbilityDsl = require('../../../abilitydsl');
import BaseCard = require('../../../basecard');
import DrawCard = require('../../../drawcard');

export default class KakitasFirstKata extends DrawCard {
    static id = 'kakita-s-first-kata';

    private bowedCharactersThisConflict = new Set<BaseCard>();
    private eventRegistrar?: EventRegistrar;

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register([EventNames.OnConflictFinished, EventNames.OnCardBowed]);

        this.action({
            title: "Prevent opponent's bow and move effects",
            condition: (context) => context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card) => card.hasTrait('duelist') || card.isFaction('crane'),
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.cardLastingEffect((context) => ({
                        effect: AbilityDsl.effects.cardCannot({
                            cannot: 'sendHome',
                            restricts: 'opponentsCardEffects',
                            applyingPlayer: context.player
                        })
                    })),
                    AbilityDsl.actions.cardLastingEffect((context) => ({
                        effect: AbilityDsl.effects.cardCannot({
                            cannot: 'moveToConflict',
                            restricts: 'opponentsCardEffects',
                            applyingPlayer: context.player
                        })
                    })),
                    AbilityDsl.actions.cardLastingEffect((context) => ({
                        effect: AbilityDsl.effects.cardCannot({
                            cannot: 'bow',
                            restricts: 'opponentsCardEffects',
                            applyingPlayer: context.player
                        })
                    })),
                    AbilityDsl.actions.conditional({
                        condition: (context) => this.bowedCharactersThisConflict.has(context.target),
                        trueGameAction: AbilityDsl.actions.ready((context) => ({ target: context.target })),
                        falseGameAction: AbilityDsl.actions.draw({ amount: 0 })
                    })
                ])
            },
            effect: "{1}prevent opponents' actions from bowing or moving {0}",
            effectArgs: (context) => (this.bowedCharactersThisConflict.has(context.target) ? 'ready and ' : '')
        });
    }

    public onConflictFinished() {
        this.bowedCharactersThisConflict.clear();
    }

    public onCardBowed(event: any) {
        this.bowedCharactersThisConflict.add(event.card);
    }
}
