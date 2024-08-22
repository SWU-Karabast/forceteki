import Player from '../Player';
import { WithPrintedHp } from './propertyMixins/PrintedHp';
import { WithCost } from './propertyMixins/Cost';
import { InPlayCard } from './baseClasses/InPlayCard';
import { WithPrintedPower } from './propertyMixins/PrintedPower';
import Contract from '../utils/Contract';
import { CardType, Location, RelativePlayer } from '../Constants';
import { UnitCard } from './CardTypes';
import { PlayUpgradeAction } from '../../actions/PlayUpgradeAction';
import { IConstantAbilityProps } from '../../Interfaces';
import { Card } from './Card';

const UpgradeCardParent = WithPrintedPower(WithPrintedHp(WithCost(InPlayCard)));

export class UpgradeCard extends UpgradeCardParent {
    protected _parentCard?: UnitCard = null;

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        Contract.assertTrue(this.printedType === CardType.Upgrade);

        this.defaultActions.push(new PlayUpgradeAction(this));
    }

    public override isUpgrade() {
        return true;
    }

    // TODO CAPTURE: we may need to use the "parent" concept for captured cards as well
    /** The card that this card is underneath */
    public get parentCard(): UnitCard {
        this.assertPropertyEnabled(this._parentCard, 'parentCard');
        return this._parentCard;
    }

    /**
     * Helper that adds an "Attached unit gains:" ability. By default the effect will
     * target the parent unit, but you can provide a match function to narrow down whether the
     * effect is applied (for cases where the effect has conditions).
     */
    protected addAttachedUnitGains(properties: Pick<IConstantAbilityProps<this>, 'title' | 'condition' | 'match' | 'ongoingEffect'>) {
        this.addConstantAbility({
            title: properties.title,
            condition: properties.condition || (() => true),
            match: (card, context) => card === this.parentCard && (!properties.match || properties.match(card, context)),
            targetController: RelativePlayer.Any,   // this means that the effect continues to work even if the other player gains control of the upgrade
            ongoingEffect: properties.ongoingEffect
        });
    }

    protected override initializeForCurrentLocation(prevLocation: Location): void {
        super.initializeForCurrentLocation(prevLocation);

        switch (this.location) {
            case Location.Resource:
                this.enableExhaust(true);
                break;

            default:
                this.enableExhaust(false);
                break;
        }
    }

    /**
     * Checks whether the passed card meets any attachment restrictions for this card. Upgrade
     * implementations must override this if they have specific attachment conditions.
     */
    public canAttach(parentCard: Card, controller: Player = this.controller): boolean {
        if (!parentCard.isUnit()) {
            return false;
        }

        return true;
    }
}