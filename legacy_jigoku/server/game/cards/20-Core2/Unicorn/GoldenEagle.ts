import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import { PlayCharacterAsAttachment } from '../../../PlayCharacterAsAttachment';

export default class GoldenEagle extends DrawCard {
    static id = 'golden-eagle';

    setupCardAbilities() {
        this.abilities.playActions.push(new PlayCharacterAsAttachment(this));
        this.whileAttached({
            effect: AbilityDsl.effects.cardCannot({
                cannot: 'applyCovert',
                restricts: 'opponentsCardEffects'
            })
        });
    }
}
