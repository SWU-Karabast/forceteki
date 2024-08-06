import AbilityDsl = require('./abilitydsl');
import { Durations, CardTypes } from './Constants';
import { PlayAttachmentAction } from './PlayAttachmentAction.js';
import DrawCard = require('./drawcard');

export class PlayCharacterAsAttachment extends PlayAttachmentAction {
    constructor(card: DrawCard) {
        super(card, true);
        this.title = `Play ${card.name} as an attachment`;
    }

    public executeHandler(context: any) {
        AbilityDsl.actions
            .cardLastingEffect({
                duration: Durations.Custom,
                canChangeZoneOnce: true,
                effect: AbilityDsl.effects.changeType(CardTypes.Attachment)
            })
            .resolve(this.card, context);
        super.executeHandler(context);
    }
}
