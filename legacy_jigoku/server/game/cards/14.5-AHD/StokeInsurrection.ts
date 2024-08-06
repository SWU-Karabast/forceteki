import AbilityDsl from '../../abilitydsl';
import { CardTypes, Locations, Players, TargetModes } from '../../Constants';
import DrawCard from '../../drawcard';
import type Player from '../../player';

export default class StokeInsurrection extends DrawCard {
    static id = 'stoke-insurrection';

    public setupCardAbilities() {
        this.persistentEffect({
            location: Locations.Any,
            targetController: Players.Any,
            condition: (context) =>
                context.player.opponent && this.getFaceDownProvinceCards(context.player.opponent) >= 4,
            effect: AbilityDsl.effects.reduceCost({
                amount: 2,
                match: (card, source) => card === source
            })
        });

        this.action({
            title: 'Put characters into play',
            condition: (context) => context.game.isDuringConflict() && context.player.opponent !== undefined,
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.reveal((context) => ({
                    target: context.player.opponent.getDynastyCardsInProvince(Locations.Provinces)
                })),
                AbilityDsl.actions.selectCard((context) => ({
                    activePromptTitle: 'Choose up to two characters',
                    numCards: 2,
                    targets: true,
                    mode: TargetModes.MaxStat,
                    cardStat: (card: DrawCard) => card.getCost(),
                    maxStat: () => 6,
                    optional: true,
                    cardType: CardTypes.Character,
                    location: [Locations.Provinces],
                    controller: Players.Opponent,
                    cardCondition: (card) => card.isFaceup() && card.allowGameAction('putIntoConflict', context),
                    message: '{0} puts {1} into play into the conflict',
                    messageArgs: (cards) => [context.player, cards],
                    gameAction: AbilityDsl.actions.putIntoConflict()
                }))
            ]),
            effect: "reveal {1}'s dynasty cards and put up to two of them into play",
            effectArgs: (context) => [context.player.opponent]
        });
    }

    private getFaceDownProvinceCards(player: Player) {
        return player
            .getDynastyCardsInProvince(Locations.Provinces)
            .filter((card: DrawCard) => card.isFacedown() && card.controller === player).length;
    }
}
