import { CardTypes, Players } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class SacredSanctuary extends ProvinceCard {
    static id = 'sacred-sanctuary';

    setupCardAbilities() {
        this.reaction({
            title: 'Choose a monk character',
            when: {
                onConflictDeclared: (event, context) => event.conflict.declaredProvince === context.source
            },
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card) => card.hasTrait('monk'),
                gameAction: [
                    AbilityDsl.actions.ready(),
                    AbilityDsl.actions.cardLastingEffect({
                        condition: () => this.game.isDuringConflict(),
                        effect: AbilityDsl.effects.doesNotBow()
                    }),
                    AbilityDsl.actions.cardLastingEffect((context) => ({
                        effect: AbilityDsl.effects.cardCannot({
                            cannot: 'bow',
                            restricts: 'opponentsCardEffects',
                            applyingPlayer: context.player
                        })
                    }))
                ]
            },
            effect: "prevent opponents' actions from bowing {0} and stop it bowing at the end of the conflict"
        });
    }
}
