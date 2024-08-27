import Player from '../Player';
import { WithPrintedHp } from './propertyMixins/PrintedHp';
import { WithCost } from './propertyMixins/Cost';
import { InPlayCard } from './baseClasses/InPlayCard';
import { WithPrintedPower } from './propertyMixins/PrintedPower';
import Contract from '../utils/Contract';
import { AbilityType, CardType, Location, RelativePlayer } from '../Constants';
import { UnitCard } from './CardTypes';
import { PlayUpgradeAction } from '../../actions/PlayUpgradeAction';
import { IActionAbilityProps, IConstantAbilityProps, ITriggeredAbilityProps } from '../../Interfaces';
import { Card } from './Card';
import * as EnumHelpers from '../utils/EnumHelpers';
import AbilityHelper from '../../AbilityHelper';

const UpgradeCardParent = WithPrintedPower(WithPrintedHp(WithCost(InPlayCard)));

export class UpgradeCard extends UpgradeCardParent {
    protected _parentCard?: UnitCard = null;

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        Contract.assertTrue([CardType.Upgrade, CardType.TokenUpgrade].includes(this.printedType));

        this.defaultActions.push(new PlayUpgradeAction(this));
    }

    public override isUpgrade() {
        return true;
    }

    // TODO CAPTURE: we may need to use the "parent" concept for captured cards as well
    /** The card that this card is underneath */
    public get parentCard(): UnitCard {
        if (!Contract.assertNotNullLike(this._parentCard) || !Contract.assertTrue(EnumHelpers.isArena(this.location))) {
            return null;
        }

        return this._parentCard;
    }

    /** The card that this card is underneath */
    public set parentCard(card: Card | null) {
        if (card === null) {
            this._parentCard = null;
            return;
        }

        if (!Contract.assertTrue(card.isUnit()) || !Contract.assertTrue(EnumHelpers.isArena(this.location))) {
            return;
        }

        this._parentCard = card as UnitCard;
    }

    /**
     * Checks whether the passed card meets any attachment restrictions for this card. Upgrade
     * implementations must override this if they have specific attachment conditions.
     */
    public canAttach(targetCard: Card, controller: Player = this.controller): boolean {
        if (!targetCard.isUnit()) {
            return false;
        }

        return true;
    }

    public override leavesPlay() {
        // If this is an attachment and is attached to another card, we need to remove all links between them
        if (this._parentCard && this._parentCard.upgrades) {
            this._parentCard.removeUpgrade(this);
        }

        super.leavesPlay();
    }

    /**
     * Helper that adds an effect that applies to the attached unit. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    protected addConstantAbilityTargetingAttached(properties: Pick<IConstantAbilityProps<this>, 'title' | 'condition' | 'match' | 'ongoingEffect'>) {
        this.addConstantAbility({
            title: properties.title,
            condition: properties.condition || (() => true),
            match: (card, context) => card === this.parentCard && (!properties.match || properties.match(card, context)),
            targetController: RelativePlayer.Any,   // this means that the effect continues to work even if the other player gains control of the upgrade
            ongoingEffect: properties.ongoingEffect
        });
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is a triggered ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    protected addGainTriggeredAbilityTargetingAttached(properties: ITriggeredAbilityProps) {
        this.addConstantAbility({
            title: 'Give ability to the attached card',
            ongoingEffect: AbilityHelper.ongoingEffects.gainTriggeredAbility(properties)
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
}