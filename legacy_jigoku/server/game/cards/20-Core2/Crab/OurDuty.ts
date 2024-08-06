import { CardTypes, ConflictTypes, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class OurDuty extends DrawCard {
    static id = 'our-duty-';

    public setupCardAbilities() {
        this.action({
            title: 'Make your opponent sacrifice a character',
            condition: (context) => Boolean(context.player.opponent),
            cost: AbilityDsl.costs.sacrifice({
                cardType: CardTypes.Character,
                cardCondition: (card: DrawCard) => card.isFaction('crab')
            }),
            effect: 'force {1} to sacrifice a character',
            effectArgs: (context) => context.player.opponent,
            gameAction: AbilityDsl.actions.selectCard((context) => ({
                player: Players.Opponent,
                activePromptTitle: 'Choose a character to sacrifice',
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                message: '{0} sacrifices {1} to {2}',
                messageArgs: (card) => [context.player.opponent, card, context.source],
                gameAction: AbilityDsl.actions.sacrifice()
            })),
            max: AbilityDsl.limit.perGame(1)
        });

        this.action({
            title: 'Move an attacker home',
            condition: (context) => context.game.isDuringConflict(ConflictTypes.Military),
            cost: AbilityDsl.costs.sacrifice({
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isDefending()
            }),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isAttacking(),
                gameAction: AbilityDsl.actions.sendHome()
            }
        });
    }
}
