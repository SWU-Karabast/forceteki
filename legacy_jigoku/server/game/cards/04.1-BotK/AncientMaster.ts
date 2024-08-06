import { CardTypes, Locations } from '../../Constants';
import { PlayCharacterAsAttachment } from '../../PlayCharacterAsAttachment';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class AncientMaster extends DrawCard {
    static id = 'ancient-master';

    setupCardAbilities() {
        this.abilities.playActions.push(new PlayCharacterAsAttachment(this));
        this.reaction({
            title: 'Search top 5 card for kiho or tattoo',
            when: {
                onConflictDeclared: (event, context) =>
                    context.source.type === CardTypes.Attachment && event.attackers.includes(context.source.parent),
                onDefendersDeclared: (event, context) =>
                    context.source.type === CardTypes.Attachment && event.defenders.includes(context.source.parent)
            },
            printedAbility: false,
            effect: 'look at the top five cards of their deck',
            gameAction: AbilityDsl.actions.deckSearch({
                amount: 5,
                cardCondition: (card) => card.hasTrait('kiho') || card.hasTrait('tattoo'),
                gameAction: AbilityDsl.actions.moveCard({
                    destination: Locations.Hand
                })
            })
        });
    }

    leavesPlay() {
        this.printedType = CardTypes.Character;
        super.leavesPlay();
    }
}
