import Player from '../Player';
import { WithPrintedHp } from './propertyMixins/PrintedHp';
import { WithCost } from './propertyMixins/Cost';
import { InPlayCard } from './baseClasses/InPlayCard';
import { WithPrintedPower } from './propertyMixins/PrintedPower';
import * as Contract from '../utils/Contract';
import { AbilityType, CardType, KeywordName, Location, RelativePlayer } from '../Constants';
import { UnitCard } from './CardTypes';
import { PlayUpgradeAction } from '../../actions/PlayUpgradeAction';
import { IConstantAbilityProps, IKeywordProperties, ITriggeredAbilityProps } from '../../Interfaces';
import { Card } from './Card';
import * as EnumHelpers from '../utils/EnumHelpers';
import AbilityHelper from '../../AbilityHelper';
import { WithStandardAbilitySetup } from './propertyMixins/StandardAbilitySetup';
import { AbilityContext } from '../ability/AbilityContext';

const UpgradeCardParent = WithPrintedPower(WithPrintedHp(WithCost(WithStandardAbilitySetup(InPlayCard))));

export class UpgradeCard extends UpgradeCardParent {
    protected _parentCard?: UnitCard = null;

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        Contract.assertTrue([CardType.BasicUpgrade, CardType.TokenUpgrade].includes(this.printedType));

        this.defaultActions.push(new PlayUpgradeAction(this));
    }

    public override isUpgrade(): this is UpgradeCard {
        return true;
    }

    // TODO CAPTURE: we may need to use the "parent" concept for captured cards as well
    /** The card that this card is underneath */
    public get parentCard(): UnitCard {
        Contract.assertNotNullLike(this._parentCard);
        Contract.assertTrue(EnumHelpers.isArena(this.location));

        return this._parentCard;
    }

    public override moveTo(targetLocation: Location) {
        Contract.assertFalse(this._parentCard && targetLocation !== this._parentCard.location,
            `Attempting to move upgrade ${this.internalName} while it is still attached to ${this._parentCard?.internalName}`);

        super.moveTo(targetLocation);
    }

    public attachTo(newParentCard: UnitCard) {
        Contract.assertTrue(newParentCard.isUnit());
        Contract.assertTrue(EnumHelpers.isArena(newParentCard.location));

        if (this._parentCard) {
            this.unattach();
        } else {
            this.controller.removeCardFromPile(this);
        }

        this.moveTo(newParentCard.location);
        newParentCard.controller.putUpgradeInArena(this, newParentCard.location);
        newParentCard.attachUpgrade(this);
        this._parentCard = newParentCard;
    }

    public unattach() {
        Contract.assertTrue(this._parentCard !== null, 'Attempting to unattach upgrade when already unattached');

        this.parentCard.unattachUpgrade(this);
        this.parentCard.controller.removeCardFromPile(this);
        this._parentCard = null;
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
        if (this._parentCard) {
            this.unattach();
        }

        super.leavesPlay();
    }

    /**
     * Helper that adds an effect that applies to the attached unit. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    protected addConstantAbilityTargetingAttached(properties: Pick<IConstantAbilityProps<this>, 'title' | 'condition' | 'matchTarget' | 'ongoingEffect'>) {
        this.addConstantAbility({
            title: properties.title,
            condition: properties.condition || (() => true),
            matchTarget: (card, context) => card === context.source.parentCard && (!properties.matchTarget || properties.matchTarget(card, context)),
            targetController: RelativePlayer.Any,   // this means that the effect continues to work even if the other player gains control of the upgrade
            ongoingEffect: properties.ongoingEffect
        });
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is a triggered ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    protected addGainTriggeredAbilityTargetingAttached(properties: ITriggeredAbilityProps<UnitCard>, gainCondition: (context: AbilityContext<this>) => boolean = null) {
        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            condition: gainCondition,
            ongoingEffect: AbilityHelper.ongoingEffects.gainAbility(AbilityType.Triggered, properties)
        });
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is a keyword ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    protected addGainKeywordTargetingAttached(properties: IKeywordProperties, gainCondition: (context: AbilityContext<this>) => boolean = null) {
        this.addConstantAbilityTargetingAttached({
            title: 'Give keyword to the attached card',
            condition: gainCondition,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(properties)
        });
    }

    protected override initializeForCurrentLocation(prevLocation: Location): void {
        super.initializeForCurrentLocation(prevLocation);

        switch (this.location) {
            case Location.Resource:
                this.setExhaustEnabled(true);
                break;

            default:
                this.setExhaustEnabled(false);
                break;
        }
    }
}