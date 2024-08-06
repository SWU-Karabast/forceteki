import { CardTypes } from '../Constants';
import BaseCard = require('../basecard');
import DrawCard = require('../drawcard');

export class BattlefieldAttachment extends DrawCard {
    public setupCardAbilities() {
        this.attachmentConditions({
            limitTrait: { battlefield: 1 }
        });
    }

    public canPlayOn(source: any) {
        return (
            source &&
            source.getType() === 'province' &&
            (!this.unbrokenOnly() || !source.isBroken) &&
            this.getType() === CardTypes.Attachment
        );
    }

    public canAttach(parent: BaseCard) {
        if (this.unbrokenOnly() && parent.type === CardTypes.Province && parent.isBroken) {
            return false;
        }

        return parent && parent.getType() === CardTypes.Province && this.getType() === CardTypes.Attachment;
    }

    protected unbrokenOnly(): boolean {
        return true;
    }
}
