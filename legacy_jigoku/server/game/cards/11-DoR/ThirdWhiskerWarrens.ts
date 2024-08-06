import type { AbilityContext } from '../../AbilityContext';
import { Locations, Players, CardTypes } from '../../Constants';
import { PlayCharacterAsIfFromHand } from '../../PlayCharacterAsIfFromHand';
import { PlayDisguisedCharacterAsIfFromHand } from '../../PlayDisguisedCharacterAsIfFromHand';
import type { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';
import type BaseCard from '../../basecard';
import DrawCard from '../../drawcard';

export default class ThirdWhiskerWarrens extends DrawCard {
    static id = 'third-whisker-warrens';

    public setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => this.conflictAtKaiuWall(context),
            targetLocation: Locations.DynastyDeck,
            match: (card, context) => context && card === context.player.dynastyDeck.first(),
            effect: [
                AbilityDsl.effects.hideWhenFaceUp(),
                AbilityDsl.effects.gainPlayAction(PlayCharacterAsIfFromHand),
                AbilityDsl.effects.gainPlayAction(PlayDisguisedCharacterAsIfFromHand)
            ]
        });

        this.persistentEffect({
            condition: (context) => this.conflictAtKaiuWall(context),
            targetController: Players.Self,
            effect: AbilityDsl.effects.showTopDynastyCard()
        });
    }

    private conflictAtKaiuWall(context: AbilityContext) {
        if (!context.player.isDefendingPlayer()) {
            return false;
        }

        for (const province of context.game.currentConflict.getConflictProvinces() as ProvinceCard[]) {
            for (const card of context.player.getDynastyCardsInProvince(province.location) as BaseCard[]) {
                if (card.isFaceup() && card.type === CardTypes.Holding && card.hasTrait('kaiu-wall')) {
                    return true;
                }
            }
        }
        return false;
    }
}
