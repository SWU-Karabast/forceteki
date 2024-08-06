import { CardTypes, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class SawakitensBlessing extends DrawCard {
    static id = 'sawakiten-s-blessing';

    setupCardAbilities() {
        this.action({
            title: "Character doesn't bow during resolution",
            condition: () => this.game.isDuringConflict('military'),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                gameAction: [
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
            effect: "prevent opponents' actions from bowing {0} and stop it bowing at the end of the conflict",
            max: AbilityDsl.limit.perRound(1)
        });
    }
}
