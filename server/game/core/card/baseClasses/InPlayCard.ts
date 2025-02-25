import type { IActionAbilityProps, IConstantAbilityProps, IReplacementEffectAbilityProps, ITriggeredAbilityBaseProps, ITriggeredAbilityProps } from '../../../Interfaces';
import type TriggeredAbility from '../../ability/TriggeredAbility';
import { ZoneName } from '../../Constants';
import { CardType, RelativePlayer, WildcardZoneName } from '../../Constants';
import type Player from '../../Player';
import * as EnumHelpers from '../../utils/EnumHelpers';
import type { IDecreaseCostAbilityProps, IIgnoreAllAspectPenaltiesProps, IIgnoreSpecificAspectPenaltyProps, IPlayableOrDeployableCard } from './PlayableOrDeployableCard';
import { PlayableOrDeployableCard } from './PlayableOrDeployableCard';
import * as Contract from '../../utils/Contract';
import { DefeatSourceType } from '../../../IDamageOrDefeatSource';
import { FrameworkDefeatCardSystem } from '../../../gameSystems/FrameworkDefeatCardSystem';
import type { IConstantAbility } from '../../ongoingEffect/IConstantAbility';
import type { ICardWithCostProperty } from '../propertyMixins/Cost';
import { WithCost } from '../propertyMixins/Cost';
import type { ICardWithTriggeredAbilities } from '../propertyMixins/TriggeredAbilityRegistration';
import { WithAllAbilityTypes } from '../propertyMixins/AllAbilityTypeRegistrations';
import type { IUnitCard } from '../propertyMixins/UnitProperties';
import type { Card } from '../Card';

const InPlayCardParent = WithCost(WithAllAbilityTypes(PlayableOrDeployableCard));

// required for mixins to be based on this class
export type InPlayCardConstructor = new (...args: any[]) => InPlayCard;

export interface IInPlayCard extends IPlayableOrDeployableCard, ICardWithCostProperty, ICardWithTriggeredAbilities {
    get disableOngoingEffectsForDefeat(): boolean;
    get inPlayId(): number;
    get mostRecentInPlayId(): number;
    get pendingDefeat(): boolean;
    isInPlay(): boolean;
    addGainedActionAbility(properties: IActionAbilityProps): string;
    removeGainedActionAbility(removeAbilityUuid: string): void;
    addGainedConstantAbility(properties: IConstantAbilityProps): string;
    removeGainedConstantAbility(removeAbilityUuid: string): void;
    addGainedTriggeredAbility(properties: ITriggeredAbilityProps): string;
    addGainedReplacementEffectAbility(properties: IReplacementEffectAbilityProps): string;
    removeGainedTriggeredAbility(removeAbilityUuid: string): void;
    removeGainedReplacementEffectAbility(removeAbilityUuid: string): void;
    registerPendingUniqueDefeat();
    checkUnique();
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
export class InPlayCard extends InPlayCardParent implements IInPlayCard {
    protected _disableOngoingEffectsForDefeat?: boolean = null;
    protected _mostRecentInPlayId = -1;
    protected _pendingDefeat?: boolean = null;
    // protected triggeredAbilities: TriggeredAbility[] = [];


    /**
     * If true, then this card's ongoing effects are disabled in preparation for it to be defeated (usually due to unique rule).
     * Triggered abilities are not disabled until it leaves the field.
     *
     * Can only be true if pendingDefeat is also true.
     */
    public get disableOngoingEffectsForDefeat() {
        this.assertPropertyEnabledForZone(this._disableOngoingEffectsForDefeat, 'disableOngoingEffectsForDefeat');
        return this._disableOngoingEffectsForDefeat;
    }

    /**
     * Every time a card enters play, it becomes a new "copy" of the card as far as the game is concerned (SWU 8.6.4).
     * This in-play id is used to distinguish copies of the card - every time it enters play, the id is incremented.
     * If the card is no longer in play, this property is not available and {@link mostRecentInPlayId} should be used instead.
     */
    public get inPlayId() {
        this.assertPropertyEnabledForZoneBoolean(EnumHelpers.isArena(this.zoneName), 'inPlayId');
        return this._mostRecentInPlayId;
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

        return this._mostRecentInPlayId;
    }

    /**
     * If true, then this card is queued to be defeated as a consequence of another effect (damage, unique rule)
     * and will be removed from the field after the current event window has finished the resolution step.
     *
     * When this is true, most systems cannot target the card.
     */
    public get pendingDefeat() {
        this.assertPropertyEnabledForZone(this._pendingDefeat, 'pendingDefeat');
        return this._pendingDefeat;
    }

    public override get type(): CardType {
        // TODO: should we add a CardType.PilotUpgrade?
        return this.isAttached() ? CardType.BasicUpgrade : this.printedType;
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        // this class is for all card types other than Base and Event (Base is checked in the superclass constructor)
        Contract.assertFalse(this.printedType === CardType.Event);
    }

    public isInPlay(): boolean {
        return EnumHelpers.isArena(this.zoneName);
    }

    public override canBeInPlay(): this is IInPlayCard {
        return true;
    }

    protected setPendingDefeatEnabled(enabledStatus: boolean) {
        this._pendingDefeat = enabledStatus ? false : null;
        this._disableOngoingEffectsForDefeat = enabledStatus ? false : null;
    }

    public checkIsAttachable(): void {
        throw new Error('Card may not be attached');
    }

    public assertIsUpgrade(): void {
        Contract.assertTrue(this.isUpgrade());
        Contract.assertNotNullLike(this.parentCard);
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
        this.assertIsUpgrade();
        return !!this._parentCard;
    }

    public unattach() {
        Contract.assertNotNullLike(this._parentCard, 'Attempting to unattach upgrade when already unattached');
        this.assertIsUpgrade();

        this.parentCard.unattachUpgrade(this);
        this._parentCard = null;
    }

    /**
     * Checks whether the passed card meets any attachment restrictions for this card. Upgrade
     * implementations must override this if they have specific attachment conditions.
     */
    public canAttach(targetCard: Card, controller: Player = this.controller): boolean {
        this.checkIsAttachable();
        if (!targetCard.isUnit() || (this.attachCondition && !this.attachCondition(targetCard))) {
            return false;
        }

        return true;
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
        const triggeredProperties = Object.assign(properties, { when: { onCardDefeated: (event, context) => event.card === context.source } });
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

    // ******************************************** ABILITY STATE MANAGEMENT ********************************************
    /**
     * Adds a dynamically gained action ability to the card. Used for "gain ability" effects.
     *
     * Duplicates of the same gained action from duplicates of the same source card can be added,
     * but only one will be presented to the user as an available action.
     *
     * @returns The uuid of the created action ability
     */
    public addGainedActionAbility(properties: IActionAbilityProps): string {
        const addedAbility = this.createActionAbility(properties);
        this.actionAbilities.push(addedAbility);

        return addedAbility.uuid;
    }

    /** Removes a dynamically gained action ability */
    public removeGainedActionAbility(removeAbilityUuid: string): void {
        const updatedAbilityList = this.actionAbilities.filter((ability) => ability.uuid !== removeAbilityUuid);
        Contract.assertEqual(updatedAbilityList.length, this.actionAbilities.length - 1, `Expected to find one instance of gained action ability to remove but instead found ${this.actionAbilities.length - updatedAbilityList.length}`);

        this.actionAbilities = updatedAbilityList;
    }

    /**
     * Adds a dynamically gained constant ability to the card and immediately registers its triggers. Used for "gain ability" effects.
     *
     * @returns The uuid of the created triggered ability
     */
    public addGainedConstantAbility(properties: IConstantAbilityProps): string {
        const addedAbility = this.createConstantAbility(properties);
        this.constantAbilities.push(addedAbility);
        addedAbility.registeredEffects = this.addEffectToEngine(addedAbility);

        return addedAbility.uuid;
    }

    /** Removes a dynamically gained constant ability and unregisters its effects */
    public removeGainedConstantAbility(removeAbilityUuid: string): void {
        let abilityToRemove: IConstantAbility = null;
        const remainingAbilities: IConstantAbility[] = [];

        for (const constantAbility of this.constantAbilities) {
            if (constantAbility.uuid === removeAbilityUuid) {
                if (abilityToRemove) {
                    Contract.fail(`Expected to find one instance of gained ability '${abilityToRemove.abilityIdentifier}' on card ${this.internalName} to remove but instead found multiple`);
                }

                abilityToRemove = constantAbility;
            } else {
                remainingAbilities.push(constantAbility);
            }
        }

        if (abilityToRemove == null) {
            Contract.fail(`Did not find any instance of target gained ability to remove on card ${this.internalName}`);
        }

        this.constantAbilities = remainingAbilities;

        this.removeEffectFromEngine(abilityToRemove.registeredEffects);
        abilityToRemove.registeredEffects = [];
    }

    /**
     * Adds a dynamically gained triggered ability to the card and immediately registers its triggers. Used for "gain ability" effects.
     *
     * @returns The uuid of the created triggered ability
     */
    public addGainedTriggeredAbility(properties: ITriggeredAbilityProps): string {
        const addedAbility = this.createTriggeredAbility(properties);
        this.triggeredAbilities.push(addedAbility);
        addedAbility.registerEvents();

        return addedAbility.uuid;
    }

    /**
     * Adds a dynamically gained triggered ability to the card and immediately registers its triggers. Used for "gain ability" effects.
     *
     * @returns The uuid of the created triggered ability
     */
    public addGainedReplacementEffectAbility(properties: IReplacementEffectAbilityProps): string {
        const addedAbility = this.createReplacementEffectAbility(properties);
        this.triggeredAbilities.push(addedAbility);
        addedAbility.registerEvents();

        return addedAbility.uuid;
    }

    /** Removes a dynamically gained triggered ability and unregisters its effects */
    public removeGainedTriggeredAbility(removeAbilityUuid: string): void {
        let abilityToRemove: TriggeredAbility = null;
        const remainingAbilities: TriggeredAbility[] = [];

        for (const triggeredAbility of this.triggeredAbilities) {
            if (triggeredAbility.uuid === removeAbilityUuid) {
                if (abilityToRemove) {
                    Contract.fail(`Expected to find one instance of gained ability '${abilityToRemove.abilityIdentifier}' on card ${this.internalName} to remove but instead found multiple`);
                }

                abilityToRemove = triggeredAbility;
            } else {
                remainingAbilities.push(triggeredAbility);
            }
        }

        if (abilityToRemove == null) {
            Contract.fail(`Did not find any instance of target gained ability to remove on card ${this.internalName}`);
        }

        this.triggeredAbilities = remainingAbilities;
        abilityToRemove.unregisterEvents();
    }

    public removeGainedReplacementEffectAbility(removeAbilityUuid: string): void {
        this.removeGainedTriggeredAbility(removeAbilityUuid);
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
                this._mostRecentInPlayId += 1;
            }
        } else {
            this.setPendingDefeatEnabled(false);

            // if we're moving from a visible zone (discard, capture) to a hidden zone, increment the in-play id to represent the loss of information (card becomes a new copy)
            if (EnumHelpers.isHiddenFromOpponent(this.zoneName, RelativePlayer.Self) && !EnumHelpers.isHiddenFromOpponent(prevZone, RelativePlayer.Self)) {
                this._mostRecentInPlayId += 1;
            }
        }
    }


    protected override resetLimits() {
        super.resetLimits();

        for (const triggeredAbility of this.triggeredAbilities) {
            if (triggeredAbility.limit) {
                triggeredAbility.limit.reset();
            }
        }
    }

    // ******************************************** UNIQUENESS MANAGEMENT ********************************************
    public registerPendingUniqueDefeat() {
        Contract.assertTrue(this.getDuplicatesInPlayForController().length === 1);

        this._pendingDefeat = true;
        this._disableOngoingEffectsForDefeat = true;
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
