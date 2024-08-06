import { CardTypes, Players } from '../../Constants';
import { BaseOni } from './_BaseOni';
import AbilityDsl = require('../../abilitydsl');
import BaseCard = require('../../basecard');

export default class OniOfObsidianAndBlood extends BaseOni {
    static id = 'oni-of-obsidian-and-blood';

    public setupCardAbilities() {
        super.setupCardAbilities();
        this.reaction({
            title: 'Discard a character',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.source.controller && context.source.isParticipating()
            },
            target: {
                controller: Players.Opponent,
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isTainted,
                gameAction: AbilityDsl.actions.discardFromPlay()
            }
        });
    }

    public allowAttachment(attachment: BaseCard) {
        return attachment.isFaction('shadowlands') && super.allowAttachment(attachment);
    }
}
