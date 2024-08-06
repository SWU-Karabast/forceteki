import { CardTypes } from '../../Constants';
import { PlayCharacterAsAttachment } from '../../PlayCharacterAsAttachment';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class TogashiAcolyte extends DrawCard {
    static id = 'togashi-acolyte';

    setupCardAbilities() {
        this.abilities.playActions.push(new PlayCharacterAsAttachment(this));
        this.reaction({
            title: 'Give attached character +1/+1',
            limit: AbilityDsl.limit.unlimitedPerConflict(),
            when: {
                onCardPlayed: (event, context) =>
                    context.source.parent &&
                    event.player === context.player &&
                    context.source.type === CardTypes.Attachment &&
                    context.source.parent.isParticipating()
            },
            gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                target: context.source.parent,
                effect: AbilityDsl.effects.modifyBothSkills(1)
            })),
            effect: 'give +1{1} and +1{2} to {3}',
            effectArgs: (context) => ['political', 'military', context.source.parent]
        });
    }

    leavesPlay() {
        this.printedType = CardTypes.Character;
        super.leavesPlay();
    }
}
