import type { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import { CardTypes } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class NamelessBrother extends DrawCard {
    static id = 'nameless-brother';

    public setupCardAbilities() {
        this.persistentEffect({
            match: (card, context) => card.controller === context.player && card.type === CardTypes.Character,
            effect: AbilityDsl.effects.modifyBothSkills((character: BaseCard, context: AbilityContext<this>) =>
                (context.player.cardsInPlay as BaseCard[]).reduce(
                    (skillBonus, otherCard) =>
                        otherCard.type === CardTypes.Character &&
                        otherCard.name === character.name &&
                        otherCard.uuid !== character.uuid
                            ? skillBonus + 1
                            : skillBonus,
                    0
                )
            )
        });
    }
}
