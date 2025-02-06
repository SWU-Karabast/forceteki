import type Player from '../Player';
import { WithPrintedHp } from './propertyMixins/PrintedHp';
import { WithCost } from './propertyMixins/Cost';
import { InPlayCard } from './baseClasses/InPlayCard';
import { WithPrintedPower } from './propertyMixins/PrintedPower';
import * as Contract from '../utils/Contract';
import type { MoveZoneDestination } from '../Constants';
import { AbilityType, CardType, ZoneName, WildcardRelativePlayer } from '../Constants';
import type { TokenOrPlayableCard, UnitCard } from './CardTypes';
import { PlayUpgradeAction } from '../../actions/PlayUpgradeAction';
import type { IActionAbilityProps, ITriggeredAbilityBaseProps, IConstantAbilityProps, IKeywordProperties, ITriggeredAbilityProps } from '../../Interfaces';
import type { Card } from './Card';
import OngoingEffectLibrary from '../../ongoingEffects/OngoingEffectLibrary';
import { WithStandardAbilitySetup } from './propertyMixins/StandardAbilitySetup';
import type { AbilityContext } from '../ability/AbilityContext';
import type { IPlayCardActionProperties } from '../ability/PlayCardAction';

interface IGainCondition<TSource extends UpgradeCard> {
    gainCondition?: (context: AbilityContext<TSource>) => boolean;
}

type ITriggeredAbilityPropsWithGainCondition<TSource extends UpgradeCard, TTarget extends Card> = ITriggeredAbilityProps<TTarget> & IGainCondition<TSource>;

type ITriggeredAbilityBasePropsWithGainCondition<TSource extends UpgradeCard, TTarget extends Card> = ITriggeredAbilityBaseProps<TTarget> & IGainCondition<TSource>;

type IActionAbilityPropsWithGainCondition<TSource extends UpgradeCard, TTarget extends Card> = IActionAbilityProps<TTarget> & IGainCondition<TSource>;

type IKeywordPropertiesWithGainCondition<TSource extends UpgradeCard> = IKeywordProperties & IGainCondition<TSource>;

const UpgradeCardParent = WithPrintedPower(WithPrintedHp(WithCost(WithStandardAbilitySetup(InPlayCard))));

export class UpgradeCard extends UpgradeCardParent {
    protected _parentCard?: UnitCard = null;

    private attachCondition: (card: Card) => boolean;

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

    public attachTo(newParentCard: UnitCard, newController?: Player) {
        Contract.assertTrue(newParentCard.isUnit());

        // this assert needed for type narrowing or else the moveTo fails
        Contract.assertTrue(newParentCard.zoneName === ZoneName.SpaceArena || newParentCard.zoneName === ZoneName.GroundArena);

        if (this._parentCard) {
            this.unattach();
        }

        if (newController && newController !== this.controller) {
            this.takeControl(newController, newParentCard.zoneName);
        } else {
            this.moveTo(newParentCard.zoneName);
        }

        newParentCard.attachUpgrade(this);
        this._parentCard = newParentCard;
    }

    public isAttached(): boolean {
        return !!this._parentCard;
    }

    public unattach() {
        Contract.assertNotNullLike(this._parentCard, 'Attempting to unattach upgrade when already unattached');

        this.parentCard.unattachUpgrade(this);
        this._parentCard = null;
    }

    /**
     * Checks whether the passed card meets any attachment restrictions for this card. Upgrade
     * implementations must override this if they have specific attachment conditions.
     */
    public canAttach(targetCard: Card, controller: Player = this.controller): boolean {
        if (!targetCard.isUnit() || (this.attachCondition && !this.attachCondition(targetCard))) {
            return false;
        }

        return true;
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
            targetController: WildcardRelativePlayer.Any,   // this means that the effect continues to work even if the other player gains control of the upgrade
            ongoingEffect: properties.ongoingEffect
        });
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is a triggered ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    protected addGainTriggeredAbilityTargetingAttached(properties: ITriggeredAbilityPropsWithGainCondition<this, UnitCard>) {
        const { gainCondition, ...gainedAbilityProperties } = properties;

        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainAbility({ type: AbilityType.Triggered, ...gainedAbilityProperties })
        });
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is an action ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    protected addGainActionAbilityTargetingAttached(properties: IActionAbilityPropsWithGainCondition<this, UnitCard>) {
        const { gainCondition, ...gainedAbilityProperties } = properties;

        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainAbility({ type: AbilityType.Action, ...gainedAbilityProperties })
        });
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is an "on attack" triggered ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    protected addGainOnAttackAbilityTargetingAttached(properties: ITriggeredAbilityBasePropsWithGainCondition<this, UnitCard>) {
        const { gainCondition, ...gainedAbilityProperties } = properties;
        const propsWithWhen = Object.assign(gainedAbilityProperties, { when: { onAttackDeclared: (event, context) => event.attack.attacker === context.source } });

        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainAbility({ type: AbilityType.Triggered, ...propsWithWhen })
        });
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is an "when defeated" triggered ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    protected addGainWhenDefeatedAbilityTargetingAttached(properties: ITriggeredAbilityBasePropsWithGainCondition<this, UnitCard>) {
        const { gainCondition, ...gainedAbilityProperties } = properties;
        const propsWithWhen = Object.assign(gainedAbilityProperties, { when: { onCardDefeated: (event, context) => event.card === context.source } });

        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainAbility({ type: AbilityType.Triggered, ...propsWithWhen })
        });
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is a keyword ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    protected addGainKeywordTargetingAttached(properties: IKeywordPropertiesWithGainCondition<this>) {
        const { gainCondition, ...keywordProperties } = properties;

        this.addConstantAbilityTargetingAttached({
            title: 'Give keyword to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainKeyword(keywordProperties)
        });
    }

    /**
     * This is required because a gainCondition call can happen after an upgrade is discarded,
     * so we need to short-circuit in that case to keep from trying to access illegal state such as parentCard
     */
    private addZoneCheckToGainCondition(gainCondition?: (context: AbilityContext<this>) => boolean) {
        return gainCondition == null
            ? null
            : (context: AbilityContext<this>) => this.isInPlay() && gainCondition(context);
    }

    /** Adds a condition that must return true for the upgrade to be allowed to attach to the passed card. */
    protected setAttachCondition(attachCondition: (card: Card) => boolean) {
        Contract.assertIsNullLike(this.attachCondition, 'Attach condition is already set');

        this.attachCondition = attachCondition;
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