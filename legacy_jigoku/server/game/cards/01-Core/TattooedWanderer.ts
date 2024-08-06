import { PlayCharacterAsAttachment } from '../../PlayCharacterAsAttachment';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class TattooedWanderer extends DrawCard {
    static id = 'tattooed-wanderer';

    setupCardAbilities() {
        this.abilities.playActions.push(new PlayCharacterAsAttachment(this));
        this.whileAttached({
            effect: AbilityDsl.effects.addKeyword('covert')
        });
    }
}
