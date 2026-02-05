import type { ICardCanChangeControllers } from '../../../core/card/CardInterfaces';
import { TokenCard } from '../../../core/card/TokenCards';
import { ZoneName } from '../../../core/Constants';
import type { Player } from '../../../core/Player';

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
        if (this.controller === newController || this.zoneName !== ZoneName.Base) {
            return false;
        }

        this.controller = newController;
        // TODO: Should these tokens change ownership when control changes?
        this.owner = newController;
        this.moveTo(ZoneName.Base);

        return true;
    }
}
