import type Player from '../Player';
import { WithPrintedHp } from './propertyMixins/PrintedHp';
import { WithCost } from './propertyMixins/Cost';
import { InPlayCard } from './baseClasses/InPlayCard';
import { WithPrintedPower } from './propertyMixins/PrintedPower';
import * as Contract from '../utils/Contract';
import type { MoveZoneDestination } from '../Constants';
import { CardType, ZoneName } from '../Constants';
import type { TokenOrPlayableCard, UnitCard } from './CardTypes';
import { PlayUpgradeAction } from '../../actions/PlayUpgradeAction';
import { WithStandardAbilitySetup } from './propertyMixins/StandardAbilitySetup';
import type { IPlayCardActionProperties } from '../ability/PlayCardAction';

const UpgradeCardParent = WithPrintedPower(WithPrintedHp(WithCost(WithStandardAbilitySetup(InPlayCard))));

export class UpgradeCard extends UpgradeCardParent {
    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        Contract.assertTrue([CardType.BasicUpgrade, CardType.TokenUpgrade].includes(this.printedType));
    }

    public override isUpgrade(): this is UpgradeCard {
        return true;
    }

    public override buildPlayCardAction(properties: IPlayCardActionProperties) {
        return new PlayUpgradeAction(this.game, this, properties);
    }

    public override getSummary(activePlayer: Player) {
        return {
            ...super.getSummary(activePlayer),
            parentCardId: this._parentCard ? this._parentCard.uuid : null
        };
    }

    /** The card that this card is underneath */
    public get parentCard(): UnitCard {
        Contract.assertNotNullLike(this._parentCard);
        Contract.assertTrue(this.isInPlay());

        return this._parentCard;
    }

    public override isTokenOrPlayable(): this is TokenOrPlayableCard {
        return true;
    }

    public override moveTo(targetZoneName: MoveZoneDestination) {
        Contract.assertFalse(this._parentCard && targetZoneName !== this._parentCard.zoneName,
            `Attempting to move upgrade ${this.internalName} while it is still attached to ${this._parentCard?.internalName}`);

        super.moveTo(targetZoneName);
    }

    protected override initializeForCurrentZone(prevZone?: ZoneName): void {
        super.initializeForCurrentZone(prevZone);

        switch (this.zoneName) {
            case ZoneName.Resource:
                this.setExhaustEnabled(true);
                break;

            default:
                this.setExhaustEnabled(false);
                break;
        }
    }
}