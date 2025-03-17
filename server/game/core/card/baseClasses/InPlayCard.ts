import type { IConstantAbilityProps, ITriggeredAbilityBaseProps, WhenTypeOrStandard } from '../../../Interfaces';
import type TriggeredAbility from '../../ability/TriggeredAbility';
import { ZoneName } from '../../Constants';
import { CardType, RelativePlayer, WildcardZoneName } from '../../Constants';
import type Player from '../../Player';
import * as EnumHelpers from '../../utils/EnumHelpers';
import type { IDecreaseCostAbilityProps, IIgnoreAllAspectPenaltiesProps, IIgnoreSpecificAspectPenaltyProps, IPlayableOrDeployableCard, IPlayableOrDeployableCardState } from './PlayableOrDeployableCard';
import { PlayableOrDeployableCard } from './PlayableOrDeployableCard';
import * as Contract from '../../utils/Contract';
import { DefeatSourceType } from '../../../IDamageOrDefeatSource';
import { FrameworkDefeatCardSystem } from '../../../gameSystems/FrameworkDefeatCardSystem';
import type { IConstantAbility } from '../../ongoingEffect/IConstantAbility';
import type { ICardWithCostProperty } from '../propertyMixins/Cost';
import { WithCost } from '../propertyMixins/Cost';
import type { ICardWithActionAbilities } from '../propertyMixins/ActionAbilityRegistration';
import type { ICardWithConstantAbilities } from '../propertyMixins/ConstantAbilityRegistration';
import type { ICardWithTriggeredAbilities } from '../propertyMixins/TriggeredAbilityRegistration';
import { WithAllAbilityTypes } from '../propertyMixins/AllAbilityTypeRegistrations';
import { SelectCardMode } from '../../gameSteps/PromptInterfaces';
import type { IUnitCard } from '../propertyMixins/UnitProperties';
import type { Card } from '../Card';
import type { AbilityContext } from '../../ability/AbilityContext';
import { StandardTriggeredAbilityType } from '../../Constants';
import * as Helpers from '../../utils/Helpers';

const InPlayCardParent = WithCost(WithAllAbilityTypes(PlayableOrDeployableCard));

// required for mixins to be based on this class
export type InPlayCardConstructor<T extends IInPlayCardState = IInPlayCardState> = new (...args: any[]) => InPlayCard<T>;

export interface IInPlayCardState extends IPlayableOrDeployableCardState {
    disableOngoingEffectsForDefeat: boolean | null;
    mostRecentInPlayId: number;
    pendingDefeat: boolean | null;
    movedFromZone: ZoneName | null;
}

export interface IInPlayCard extends IPlayableOrDeployableCard, ICardWithCostProperty, ICardWithActionAbilities, ICardWithConstantAbilities, ICardWithTriggeredAbilities {
    readonly printedUpgradeHp: number;
    readonly printedUpgradePower: number;
    get disableOngoingEffectsForDefeat(): boolean;
    get inPlayId(): number;
    get mostRecentInPlayId(): number;
    get parentCard(): IUnitCard;
    get pendingDefeat(): boolean;
    isInPlay(): boolean;
    registerPendingUniqueDefeat();
    checkUnique();
    attachTo(newParentCard: IUnitCard, newController?: Player);
    isAttached(): boolean;
    unattach(event?: any);
    canAttach(targetCard: Card, context: AbilityContext, controller?: Player): boolean;
}

/**
 * Subclass of {@link Card} (via {@link PlayableOrDeployableCard}) that adds properties for cards that
 * can be in any "in-play" zones (`SWU 4.9`). This encompasses all card types other than events or bases.
 *
 * The unique properties of in-play cards added by this subclass are:
 * 1. "Ongoing" abilities, i.e., triggered abilities and constant abilities
 * 2. Defeat state management
 * 3. Uniqueness management
 */
export class InPlayCard<T extends IInPlayCardState = IInPlayCardState> extends InPlayCardParent<T> implements IInPlayCard {
    public readonly printedUpgradeHp: number;
    public readonly printedUpgradePower: number;

    protected _parentCard?: IUnitCard = null;

    protected attachCondition: (card: Card) => boolean;

    /**
     * If true, then this card's ongoing effects are disabled in preparation for it to be defeated (usually due to unique rule).
     * Triggered abilities are not disabled until it leaves the field.
     *
     * Can only be true if pendingDefeat is also true.
     */
    public get disableOngoingEffectsForDefeat() {
        this.assertPropertyEnabledForZone(this.state.disableOngoingEffectsForDefeat, 'disableOngoingEffectsForDefeat');
        return this.state.disableOngoingEffectsForDefeat;
    }

    /**
     * Every time a card enters play, it becomes a new "copy" of the card as far as the game is concerned (SWU 8.6.4).
     * This in-play id is used to distinguish copies of the card - every time it enters play, the id is incremented.
     * If the card is no longer in play, this property is not available and {@link mostRecentInPlayId} should be used instead.
     */
    public get inPlayId() {
        this.assertPropertyEnabledForZoneBoolean(EnumHelpers.isArena(this.zoneName), 'inPlayId');
        return this.state.mostRecentInPlayId;
    }

    /**
     * If the card is in a non-hidden, non-arena zone, this property is the most recent value of {@link inPlayId} for the card.
     * This is used to determine e.g. if a card in the discard pile was defeated this phase.
     */
    public get mostRecentInPlayId() {
        this.assertPropertyEnabledForZoneBoolean(
            !EnumHelpers.isArena(this.zoneName) && this.zone.hiddenForPlayers == null,
            'mostRecentInPlayId'
        );

        return this.state.mostRecentInPlayId;
    }

    /** The card that this card is underneath */
    public get parentCard(): IUnitCard {
        Contract.assertNotNullLike(this._parentCard);
        // TODO: move IsInPlay to be usable here
        Contract.assertTrue(this.isInPlay());

        return this._parentCard;
    }

    /**
     * If true, then this card is queued to be defeated as a consequence of another effect (damage, unique rule)
     * and will be removed from the field after the current event window has finished the resolution step.
     *
     * When this is true, most systems cannot target the card.
     */
    public get pendingDefeat() {
        this.assertPropertyEnabledForZone(this.state.pendingDefeat, 'pendingDefeat');
        return this.state.pendingDefeat;
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        // this class is for all card types other than Base and Event (Base is checked in the superclass constructor)
        Contract.assertFalse(this.printedType === CardType.Event);

        if (this.isUpgrade()) {
            Contract.assertNotNullLike(cardData.upgradeHp);
            Contract.assertNotNullLike(cardData.upgradePower);
        }

        const hasUpgradeStats = cardData.upgradePower != null && cardData.upgradeHp != null;

        Contract.assertTrue(hasUpgradeStats ||
          (cardData.upgradePower == null && cardData.upgradeHp == null));

        if (hasUpgradeStats) {
            this.printedUpgradePower = cardData.upgradePower;
            this.printedUpgradeHp = cardData.upgradeHp;
        }
    }

    public isInPlay(): boolean {
        return EnumHelpers.isArena(this.zoneName);
    }

    public override canBeInPlay(): this is IInPlayCard {
        return true;
    }

    protected setPendingDefeatEnabled(enabledStatus: boolean) {
        this.state.pendingDefeat = enabledStatus ? false : null;
        this.state.disableOngoingEffectsForDefeat = enabledStatus ? false : null;
    }

    public checkIsAttachable(): void {
        throw new Error(`Card ${this.internalName} may not be attached`);
    }

    public assertIsUpgrade(): void {
        Contract.assertTrue(this.isUpgrade());
        Contract.assertNotNullLike(this.parentCard);
    }

    public getUpgradeHp(): number {
        return this.printedUpgradeHp;
    }

    public getUpgradePower(): number {
        return this.printedUpgradePower;
    }

    public attachTo(newParentCard: IUnitCard, newController?: Player) {
        this.checkIsAttachable();
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
        // TODO: I think we can't check this here because we need to be able to check if this is attached in some places like the getType method
        // this.assertIsUpgrade();
        return !!this._parentCard;
    }

    public unattach(event = null) {
        Contract.assertNotNullLike(this._parentCard, 'Attempting to unattach upgrade when already unattached');
        this.assertIsUpgrade();

        this.parentCard.unattachUpgrade(this, event);
        this._parentCard = null;
    }

    /**
     * Checks whether the passed card meets any attachment restrictions for this card. Upgrade
     * implementations must override this if they have specific attachment conditions.
     */
    public canAttach(targetCard: Card, context: AbilityContext, controller: Player = this.controller): boolean {
        this.checkIsAttachable();
        if (!targetCard.isUnit() || (this.attachCondition && !this.attachCondition(targetCard))) {
            return false;
        }

        return true;
    }

    /**
     * This is required because a gainCondition call can happen after an upgrade is discarded,
     * so we need to short-circuit in that case to keep from trying to access illegal state such as parentCard
     */
    protected addZoneCheckToGainCondition(gainCondition?: (context: AbilityContext<this>) => boolean) {
        return gainCondition == null
            ? null
            : (context: AbilityContext<this>) => this.isInPlay() && gainCondition(context);
    }

    public override getSummary(activePlayer: Player) {
        return { ...super.getSummary(activePlayer),
            parentCardId: this._parentCard ? this._parentCard.uuid : null };
    }

    // ********************************************* ABILITY SETUP *********************************************
    protected override addConstantAbility(properties: IConstantAbilityProps<this>): IConstantAbility {
        const ability = super.addConstantAbility(properties);
        // This check is necessary to make sure on-play cost-reduction effects are registered
        if (ability.sourceZoneFilter === WildcardZoneName.Any) {
            ability.registeredEffects = this.addEffectToEngine(ability);
        }
        return ability;
    }

    protected addWhenPlayedAbility(properties: ITriggeredAbilityBaseProps<this>): TriggeredAbility {
        const triggeredProperties = Object.assign(properties, { when: { onCardPlayed: (event, context) => event.card === context.source } });
        return this.addTriggeredAbility(triggeredProperties);
    }

    protected addWhenDefeatedAbility(properties: ITriggeredAbilityBaseProps<this>): TriggeredAbility {
        const when: WhenTypeOrStandard = { [StandardTriggeredAbilityType.WhenDefeated]: true };
        const triggeredProperties = Object.assign(properties, { when });
        return this.addTriggeredAbility(triggeredProperties);
    }

    /** Add a constant ability on the card that decreases its cost under the given condition */
    protected addDecreaseCostAbility(properties: IDecreaseCostAbilityProps<this>): IConstantAbilityProps<this> {
        return this.addConstantAbility(this.createConstantAbility(this.generateDecreaseCostAbilityProps(properties)));
    }

    /** Add a constant ability on the card that ignores all aspect penalties under the given condition */
    protected addIgnoreAllAspectPenaltiesAbility(properties: IIgnoreAllAspectPenaltiesProps<this>): IConstantAbilityProps<this> {
        return this.addConstantAbility(this.createConstantAbility(this.generateIgnoreAllAspectPenaltiesAbilityProps(properties)));
    }

    /** Add a constant ability on the card that ignores specific aspect penalties under the given condition */
    protected addIgnoreSpecificAspectPenaltyAbility(properties: IIgnoreSpecificAspectPenaltyProps<this>): IConstantAbilityProps<this> {
        return this.addConstantAbility(this.createConstantAbility(this.generateIgnoreSpecificAspectPenaltiesAbilityProps(properties)));
    }

    public override registerMove(movedFromZone: ZoneName): void {
        super.registerMove(movedFromZone);

        this.movedFromZone = movedFromZone;
    }

    protected override initializeForCurrentZone(prevZone?: ZoneName) {
        super.initializeForCurrentZone(prevZone);

        if (EnumHelpers.isArena(this.zoneName)) {
            this.setPendingDefeatEnabled(true);

            // increment to a new in-play id if we're entering play, indicating that we are now a new "copy" of this card (SWU 8.6.4)
            if (!EnumHelpers.isArena(prevZone)) {
                this.state.mostRecentInPlayId += 1;
            }
        } else {
            this.setPendingDefeatEnabled(false);

            // if we're moving from a visible zone (discard, capture) to a hidden zone, increment the in-play id to represent the loss of information (card becomes a new copy)
            if (EnumHelpers.isHiddenFromOpponent(this.zoneName, RelativePlayer.Self) && !EnumHelpers.isHiddenFromOpponent(prevZone, RelativePlayer.Self)) {
                this.state.mostRecentInPlayId += 1;
            }
        }
    }

    protected override validateCardAbilities(cardText?: string) {
        if (!this.hasImplementationFile || cardText == null) {
            return;
        }

        Contract.assertFalse(
            !this.disableWhenDefeatedCheck &&
            cardText && Helpers.hasSomeMatch(cardText, /(?:^|(?:\n)|(?:\/))When Defeated/g) &&
            !this.triggeredAbilities.some((ability) => ability.isWhenDefeated),
            `Card ${this.internalName} has one or more 'When Defeated' keywords in its text but no corresponding ability definition or set property 'disableWhenDefeatedCheck' to true on card implementation`
        );
    }

    // ******************************************** UNIQUENESS MANAGEMENT ********************************************
    public registerPendingUniqueDefeat() {
        Contract.assertTrue(this.getDuplicatesInPlayForController().length === 1);

        this.state.pendingDefeat = true;
        this.state.disableOngoingEffectsForDefeat = true;
    }

    public checkUnique() {
        Contract.assertTrue(this.unique);

        // need to filter for other cards that have unique = true since Clone will create non-unique duplicates
        const uniqueDuplicatesInPlay = this.getDuplicatesInPlayForController();
        if (uniqueDuplicatesInPlay.length === 0) {
            return;
        }

        Contract.assertTrue(
            uniqueDuplicatesInPlay.length < 2,
            `Found that ${this.controller.name} has ${uniqueDuplicatesInPlay.length} duplicates of ${this.internalName} in play`
        );

        const unitDisplayName = this.title + (this.subtitle ? ', ' + this.subtitle : '');

        const chooseDuplicateToDefeatPromptProperties = {
            activePromptTitle: `Choose which copy of ${unitDisplayName} to defeat`,
            waitingPromptTitle: `Waiting for opponent to choose which copy of ${unitDisplayName} to defeat`,
            source: 'Unique rule',
            selectCardMode: SelectCardMode.Single,
            zoneFilter: WildcardZoneName.AnyArena,
            controller: RelativePlayer.Self,
            cardCondition: (card: InPlayCard) =>
                card.unique && card.title === this.title && card.subtitle === this.subtitle && !card.pendingDefeat,
            onSelect: (card) => this.resolveUniqueDefeat(card)
        };
        this.game.promptForSelect(this.controller, chooseDuplicateToDefeatPromptProperties);
    }

    private getDuplicatesInPlayForController() {
        return this.controller.getDuplicatesInPlay(this).filter(
            (duplicateCard) => duplicateCard.unique && !duplicateCard.pendingDefeat
        );
    }

    private resolveUniqueDefeat(duplicateToDefeat: InPlayCard) {
        const duplicateDefeatSystem = new FrameworkDefeatCardSystem({ defeatSource: DefeatSourceType.UniqueRule, target: duplicateToDefeat });
        this.game.addSubwindowEvents(duplicateDefeatSystem.generateEvent(this.game.getFrameworkContext()));

        duplicateToDefeat.registerPendingUniqueDefeat();

        return true;
    }
}
