import type { ICardCanChangeControllers } from '../../../core/card/CardInterfaces';
import { TokenCard } from '../../../core/card/TokenCards';
import { ZoneName } from '../../../core/Constants';
import type { Player } from '../../../core/Player';
import * as Contract from '../../../core/utils/Contract';

export default class CreditToken extends TokenCard implements ICardCanChangeControllers {
    protected override getImplementationId() {
        return {
            id: '8015500527',
            internalName: 'credit',
        };
    }

    public override isCreditToken(): this is CreditToken {
        return true;
    }

    public override takeControl(newController: Player): boolean {
        Contract.assertTrue(this.zoneName === ZoneName.Base, `Attempted to take control of Credit token, but it is in zone ${this.zoneName}`);

        if (this.controller === newController) {
            return false;
        }

        this.controller = newController;
        this.owner = newController; // TODO: Verify ownership should change (similar to token upgrades) when CR7 is released
        this.moveTo(ZoneName.Base);

        return true;
    }
}
