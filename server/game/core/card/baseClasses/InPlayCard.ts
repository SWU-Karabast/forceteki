import type { ICardDataJson } from '../../../../utils/cardData/CardDataInterfaces';
import { FrameworkDefeatCardSystem } from '../../../gameSystems/FrameworkDefeatCardSystem';
import { DefeatSourceType } from '../../../IDamageOrDefeatSource';
import type { IConstantAbilityProps, ITriggeredAbilityBaseProps, WhenTypeOrStandard } from '../../../Interfaces';
import type { AbilityContext } from '../../ability/AbilityContext';
import type TriggeredAbility from '../../ability/TriggeredAbility';
import * as CardSelectorFactory from '../../cardSelector/CardSelectorFactory';
import { CardType, EffectName, RelativePlayer, StandardTriggeredAbilityType, TargetMode, Trait, WildcardZoneName, ZoneName } from '../../Constants';
import type { GameObjectRef } from '../../GameObjectBase';
import type { ISelectCardPromptProperties } from '../../gameSteps/PromptInterfaces';
import { SelectCardMode } from '../../gameSteps/PromptInterfaces';
import type { Player } from '../../Player';
import * as Contract from '../../utils/Contract';
import * as EnumHelpers from '../../utils/EnumHelpers';
import * as Helpers from '../../utils/Helpers';
import type { IBasicAbilityRegistrar, IInPlayCardAbilityRegistrar } from '../AbilityRegistrationInterfaces';
import { InitializeCardStateOption, type Card } from '../Card';
import type { ICardWithActionAbilities } from '../propertyMixins/ActionAbilityRegistration';
import { WithAllAbilityTypes } from '../propertyMixins/AllAbilityTypeRegistrations';
import type { ICardWithConstantAbilities, IConstantAbilityRegistrar } from '../propertyMixins/ConstantAbilityRegistration';
import type { ICardWithCostProperty } from '../propertyMixins/Cost';
import { WithCost } from '../propertyMixins/Cost';
import type { ICardWithPreEnterPlayAbilities } from '../propertyMixins/PreEnterPlayAbilityRegistration';
import type { ICardWithTriggeredAbilities, ITriggeredAbilityRegistrar } from '../propertyMixins/TriggeredAbilityRegistration';
import type { IUnitCard } from '../propertyMixins/UnitProperties';
import type { IDecreaseCostAbilityProps, IIgnoreAllAspectPenaltiesProps, IIgnoreSpecificAspectPenaltyProps, IPlayableOrDeployableCard, IPlayableOrDeployableCardState } from './PlayableOrDeployableCard';
import { PlayableOrDeployableCard } from './PlayableOrDeployableCard';
import { getPrintedAttributesOverride } from '../../ongoingEffect/effectImpl/PrintedAttributesOverride';

const InPlayCardParent = WithAllAbilityTypes(WithCost(PlayableOrDeployableCard));

// required for mixins to be based on this class
export type InPlayCardConstructor<T extends IInPlayCardState = IInPlayCardState> = new (...args: any[]) => InPlayCard<T>;

export interface IInPlayCardState extends IPlayableOrDeployableCardState {
    disableOngoingEffectsForDefeat: boolean | null;
    mostRecentInPlayId: number;
    pendingDefeat: boolean | null;
    movedFromZone: ZoneName | null;
    parentCard: GameObjectRef<IUnitCard> | null;
}

export interface IInPlayCard extends IPlayableOrDeployableCard, ICardWithCostProperty, ICardWithActionAbilities<IInPlayCard>, ICardWithConstantAbilities<IInPlayCard>, ICardWithTriggeredAbilities<IInPlayCard>, ICardWithPreEnterPlayAbilities {
    get printedUpgradeHp(): number;
    get printedUpgradePower(): number;
    get disableOngoingEffectsForDefeat(): boolean;
    get inPlayId(): number;
    get mostRecentInPlayId(): number;
    get parentCard(): IUnitCard;
    get pendingDefeat(): boolean;
    getUpgradeHp(): number;
    getUpgradePower(): number;
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
    private readonly _printedUpgradeHp: number;
    private readonly _printedUpgradePower: number;

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
        Contract.assertNotNullLike(this.state.parentCard);
        // TODO: move IsInPlay to be usable here
        Contract.assertTrue(this.isInPlay());

        return this.game.gameObjectManager.get(this.state.parentCard);
    }

    protected set parentCard(value: IUnitCard | null) {
        this.state.parentCard = value?.getRef();
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

    public constructor(owner: Player, cardData: ICardDataJson) {
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
            this._printedUpgradePower = cardData.upgradePower;
            this._printedUpgradeHp = cardData.upgradeHp;
        }
    }

    protected override setupDefaultState() {
        super.setupDefaultState();

        this.state.pendingDefeat = null;
        this.state.mostRecentInPlayId = -1;
        this.state.disableOngoingEffectsForDefeat = null;
        this.state.parentCard = null;
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
        Contract.assertNotNullLike(this.state.parentCard);
    }

    public get printedUpgradeHp(): number {
        if (this.hasOngoingEffect(EffectName.PrintedAttributesOverride)) {
            const override = getPrintedAttributesOverride('printedUpgradeHp', this.getOngoingEffectValues(EffectName.PrintedAttributesOverride));
            if (override != null) {
                return override;
            }
        }

        return this._printedUpgradeHp;
    }

    public get printedUpgradePower(): number {
        if (this.hasOngoingEffect(EffectName.PrintedAttributesOverride)) {
            const override = getPrintedAttributesOverride('printedUpgradePower', this.getOngoingEffectValues(EffectName.PrintedAttributesOverride));
            if (override != null) {
                return override;
            }
        }

        return this._printedUpgradePower;
    }

    public getUpgradeHp(): number {
        return this.printedUpgradeHp;
    }

    public getUpgradePower(): number {
        return this.printedUpgradePower;
    }

    protected get canBeUpgrade(): boolean {
        return this.printedUpgradeHp != null && this.printedUpgradePower != null;
    }

    public attachTo(newParentCard: IUnitCard, newController?: Player) {
        this.checkIsAttachable();
        Contract.assertTrue(newParentCard.isUnit());

        // this assert needed for type narrowing or else the moveTo fails
        Contract.assertTrue(newParentCard.zoneName === ZoneName.SpaceArena || newParentCard.zoneName === ZoneName.GroundArena);

        if (this.state.parentCard) {
            this.unattach();
        }

        if (newController && newController !== this.controller) {
            this.takeControl(newController, newParentCard.zoneName);
        } else {
            this.moveTo(
                newParentCard.zoneName,
                EnumHelpers.isArena(this.zoneName) ? InitializeCardStateOption.DoNotInitialize : InitializeCardStateOption.Initialize
            );
        }

        this.updateStateOnAttach();

        if (this.isUnit() && this.hasSomeTrait(Trait.Pilot)) {
            Contract.assertTrue(newParentCard.canAttachPilot(this));
        } else if (this.attachCondition) {
            Contract.assertTrue(this.attachCondition(newParentCard));
        }

        newParentCard.attachUpgrade(this);

        this.parentCard = newParentCard;
    }

    protected updateStateOnAttach() {
        return;
    }

    public isAttached(): boolean {
        // TODO: I think we can't check this here because we need to be able to check if this is attached in some places like the getType method
        // this.assertIsUpgrade();
        return !!this.state.parentCard;
    }

    public unattach(event = null) {
        Contract.assertNotNullLike(this.state.parentCard, 'Attempting to unattach upgrade when already unattached');
        this.assertIsUpgrade();

        this.parentCard.unattachUpgrade(this, event);
        this.parentCard = null;
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
            parentCardId: this.state.parentCard ? this.state.parentCard.uuid : null };
    }

    // ********************************************* ABILITY SETUP *********************************************
    protected override getAbilityRegistrar(): IInPlayCardAbilityRegistrar<this> {
        const registrar = super.getAbilityRegistrar() as IBasicAbilityRegistrar<this>;

        return {
            ...registrar,
            addDecreaseCostAbility: (properties) => this.addDecreaseCostAbility(properties, registrar),
            addWhenPlayedAbility: (properties) => this.addWhenPlayedAbility(properties, registrar),
            addWhenDefeatedAbility: (properties) => this.addWhenDefeatedAbility(properties, registrar),
            addIgnoreAllAspectPenaltiesAbility: (properties) => this.addIgnoreAllAspectPenaltiesAbility(properties, registrar),
            addIgnoreSpecificAspectPenaltyAbility: (properties) => this.addIgnoreSpecificAspectPenaltyAbility(properties, registrar),
        };
    }

    private addWhenPlayedAbility(properties: ITriggeredAbilityBaseProps<this>, registrar: ITriggeredAbilityRegistrar<this>): TriggeredAbility {
        const when: WhenTypeOrStandard = { [StandardTriggeredAbilityType.WhenPlayed]: true };
        return registrar.addTriggeredAbility({ ...properties, when });
    }

    private addWhenDefeatedAbility(properties: ITriggeredAbilityBaseProps<this>, registrar: ITriggeredAbilityRegistrar<this>): TriggeredAbility {
        const when: WhenTypeOrStandard = { [StandardTriggeredAbilityType.WhenDefeated]: true };
        const triggeredProperties = Object.assign(properties, { when });
        return registrar.addTriggeredAbility(triggeredProperties);
    }

    /** Add a constant ability on the card that decreases its cost under the given condition */
    private addDecreaseCostAbility(properties: IDecreaseCostAbilityProps<this>, registrar: IConstantAbilityRegistrar<this>): IConstantAbilityProps<this> {
        return registrar.addConstantAbility(this.createConstantAbility(this.generateDecreaseCostAbilityProps(properties)));
    }

    /** Add a constant ability on the card that ignores all aspect penalties under the given condition */
    private addIgnoreAllAspectPenaltiesAbility(properties: IIgnoreAllAspectPenaltiesProps<this>, registrar: IConstantAbilityRegistrar<this>): IConstantAbilityProps<this> {
        return registrar.addConstantAbility(this.createConstantAbility(this.generateIgnoreAllAspectPenaltiesAbilityProps(properties)));
    }

    /** Add a constant ability on the card that ignores specific aspect penalties under the given condition */
    private addIgnoreSpecificAspectPenaltyAbility(properties: IIgnoreSpecificAspectPenaltyProps<this>, registrar: IConstantAbilityRegistrar<this>): IConstantAbilityProps<this> {
        return registrar.addConstantAbility(this.createConstantAbility(this.generateIgnoreSpecificAspectPenaltiesAbilityProps(properties)));
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

    protected override validateCardAbilities(abilities: TriggeredAbility[], cardText?: string) {
        if (!this.hasImplementationFile || cardText == null) {
            return;
        }

        Contract.assertFalse(
            !this.disableWhenDefeatedCheck &&
            cardText && Helpers.hasSomeMatch(cardText, /(?:^|(?:[\n/]))When Defeated/gi) &&
            !abilities.some((ability) => ability.isWhenDefeated),
            `Card ${this.internalName} has one or more 'When Defeated' keywords in its text but no corresponding ability definition or set property 'disableWhenDefeatedCheck' to true on card implementation`
        );
        Contract.assertFalse(
            !this.disableOnAttackCheck &&
            cardText && Helpers.hasSomeMatch(cardText, /(?:^|(?:[\n/]))On Attack\b/gi) &&
            !abilities.some((ability) => ability.isOnAttackAbility),
            `Card ${this.internalName} has one or more 'On Attack' keywords in its text but no corresponding ability definition or set property 'disableOnAttackCheck' to true on card implementation`
        );
        Contract.assertFalse(
            !this.disableWhenPlayedCheck &&
            cardText && Helpers.hasSomeMatch(cardText, /(?:^|(?:[\n/]))When Played\b/gi) &&
            !abilities.some((ability) => ability.isWhenPlayed),
            `Card ${this.internalName} has one or more 'When Played' keywords in its text but no corresponding ability definition or set property 'disableWhenPlayedCheck' to true on card implementation`
        );
        Contract.assertFalse(
            !this.disableWhenPlayedUsingSmuggleCheck &&
            cardText && Helpers.hasSomeMatch(cardText, /(?:^|(?:[\n/]))When Played using Smuggle\b/gi) &&
            !abilities.some((ability) => ability.isWhenPlayedUsingSmuggle),
            `Card ${this.internalName} has one or more 'When Played using Smuggle' keywords in its text but no corresponding ability definition or set property 'disableWhenPlayedUsingSmuggleCheck' to true on card implementation`
        );
    }

    // ******************************************** UNIQUENESS MANAGEMENT ********************************************
    public registerPendingUniqueDefeat() {
        Contract.assertTrue(this.getDuplicatesInPlayForController().length > 0);

        this.state.pendingDefeat = true;
        this.state.disableOngoingEffectsForDefeat = true;
    }

    public checkUnique() {
        Contract.assertTrue(this.unique);

        // need to filter for other cards that have unique = true since Clone will create non-unique duplicates
        const numUniqueDuplicatesInPlay = this.getDuplicatesInPlayForController().length;
        if (numUniqueDuplicatesInPlay === 0) {
            return;
        }

        const unitDisplayName = this.title + (this.subtitle ? ', ' + this.subtitle : '');

        const selector = CardSelectorFactory.create({
            mode: TargetMode.Exactly,
            numCards: numUniqueDuplicatesInPlay,
            zoneFilter: WildcardZoneName.AnyArena,
            controller: RelativePlayer.Self,
            cardCondition: (card: InPlayCard) =>
                card.unique && card.title === this.title && card.subtitle === this.subtitle && !card.pendingDefeat,
        });

        const chooseDuplicateToDefeatPromptProperties: ISelectCardPromptProperties = {
            activePromptTitle: `Choose which ${numUniqueDuplicatesInPlay > 1 ? 'copies' : 'copy'} of ${unitDisplayName} to defeat`,
            waitingPromptTitle: `Waiting for opponent to choose which ${numUniqueDuplicatesInPlay > 1 ? 'copies' : 'copy'} of ${unitDisplayName} to defeat`,
            source: 'Unique rule',
            isOpponentEffect: false,
            selectCardMode: numUniqueDuplicatesInPlay > 1 ? SelectCardMode.Multiple : SelectCardMode.Single,
            selector: selector,
            onSelect: (cardOrCards) => {
                if (Array.isArray(cardOrCards)) {
                    for (const card of cardOrCards) {
                        Contract.assertTrue(card.canBeInPlay(), `Card ${card.title} is not a IInPlayCard`);
                        this.resolveUniqueDefeat(card);
                    }
                    this.game.addMessage(
                        '{0} defeats {1} {2} of {3} due to the uniqueness rule',
                        this.controller, cardOrCards.length, cardOrCards.length > 1 ? 'copies' : 'copy', this
                    );
                    return true;
                }
                Contract.assertTrue(cardOrCards.canBeInPlay(), `Card ${cardOrCards.title} is not a IInPlayCard`);
                this.game.addMessage(
                    '{0} defeats 1 copy of {1} due to the uniqueness rule',
                    this.controller, this
                );
                return this.resolveUniqueDefeat(cardOrCards);
            }
        };
        this.game.promptForSelect(this.controller, chooseDuplicateToDefeatPromptProperties);
    }

    private getDuplicatesInPlayForController() {
        return this.controller.getDuplicatesInPlay(this).filter(
            (duplicateCard) => duplicateCard.unique && !duplicateCard.pendingDefeat
        );
    }

    private resolveUniqueDefeat(duplicateToDefeat: IInPlayCard) {
        const duplicateDefeatSystem = new FrameworkDefeatCardSystem({ defeatSource: DefeatSourceType.UniqueRule, target: duplicateToDefeat });
        this.game.addSubwindowEvents(duplicateDefeatSystem.generateEvent(this.game.getFrameworkContext()));

        duplicateToDefeat.registerPendingUniqueDefeat();

        return true;
    }
}
