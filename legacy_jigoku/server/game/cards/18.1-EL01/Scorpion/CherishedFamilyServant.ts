import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Locations, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class CherishedFamilyServant extends DrawCard {
    static id = 'cherished-family-servant';

    setupCardAbilities() {
        this.persistentEffect({
            location: Locations.Any,
            targetLocation: Locations.Any,
            effect: AbilityDsl.effects.entersPlayForOpponent()
        });

        this.persistentEffect({
            match: (card, context) =>
                card.getType() === CardTypes.Attachment &&
                card.hasTrait('poison') &&
                card.parent &&
                context.source.controller === card.parent.controller,
            effect: AbilityDsl.effects.addKeyword('ancestral'),
            targetController: Players.Any
        });
    }
}
