import type { IActionAbilityProps, IConstantAbilityProps, IReplacementEffectAbilityProps, ITriggeredAbilityBaseProps, ITriggeredAbilityProps } from '../../../Interfaces';
import TriggeredAbility from '../../ability/TriggeredAbility';
import type { ZoneName } from '../../Constants';
import { CardType, RelativePlayer, WildcardZoneName } from '../../Constants';
import type Player from '../../Player';
import * as EnumHelpers from '../../utils/EnumHelpers';
import type { IDecreaseCostAbilityProps, IIgnoreAllAspectPenaltiesProps, IIgnoreSpecificAspectPenaltyProps } from './PlayableOrDeployableCard';
import { PlayableOrDeployableCard } from './PlayableOrDeployableCard';
import * as Contract from '../../utils/Contract';
import ReplacementEffectAbility from '../../ability/ReplacementEffectAbility';
import type { Card } from '../Card';
import { DefeatSourceType } from '../../../IDamageOrDefeatSource';
import { FrameworkDefeatCardSystem } from '../../../gameSystems/FrameworkDefeatCardSystem';
import type { IConstantAbility } from '../../ongoingEffect/IConstantAbility';

// required for mixins to be based on this class
export type InPlayCardConstructor = new (...args: any[]) => InPlayCard;

/**
 * Subclass of {@link Card} (via {@link PlayableOrDeployableCard}) that adds properties for cards that
 * can be in any "in-play" zones (`SWU 4.9`). This encompasses all card types other than events or bases.
 *
 * The unique properties of in-play cards added by this subclass are:
 * 1. "Ongoing" abilities, i.e., triggered abilities and constant abilities
 * 2. Defeat state management
 * 3. Uniqueness management
 */
export class InPlayCard extends PlayableOrDeployableCard {
    protected _disableOngoingEffectsForDefeat?: boolean = null;
    protected _mostRecentInPlayId = -1;
    protected _pendingDefeat?: boolean = null;
    protected triggeredAbilities: TriggeredAbility[] = [];

    private movedFromZone?: ZoneName = null;

    /**
     * If true, then this card's ongoing effects are disabled in preparation for it to be defeated (usually due to unique rule).
     * Triggered abilities are not disabled until it leaves the field.
     *
     * Can only be true if pendingDefeat is also true.
     */
    public get disableOngoingEffectsForDefeat() {
        this.assertPropertyEnabled(this._disableOngoingEffectsForDefeat, 'disableOngoingEffectsForDefeat');
        return this._disableOngoingEffectsForDefeat;
    }

    /**
     * Every time a card enters play, it becomes a new "copy" of the card as far as the game is concerned (SWU 8.6.4).
     * This in-play id is used to distinguish copies of the card - every time it enters play, the id is incremented.
     * If the card is no longer in play, this property is not available and {@link mostRecentInPlayId} should be used instead.
     */
    public get inPlayId() {
        this.assertPropertyEnabledBoolean(EnumHelpers.isArena(this.zoneName), 'inPlayId');
        return this._mostRecentInPlayId;
    }

    /**
     * If the card is in a non-hidden, non-arena zone, this property is the most recent value of {@link inPlayId} for the card.
     * This is used to determine e.g. if a card in the discard pile was defeated this phase.
     */
    public get mostRecentInPlayId() {
        this.assertPropertyEnabledBoolean(
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
        this.assertPropertyEnabled(this._pendingDefeat, 'pendingDefeat');
        return this._pendingDefeat;
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        // this class is for all card types other than Base and Event (Base is checked in the superclass constructor)
        Contract.assertFalse(this.printedType === CardType.Event);
    }

    public isInPlay(): boolean {
        return EnumHelpers.isArena(this.zoneName);
    }

    public override canBeInPlay(): this is InPlayCard {
        return true;
    }

    protected setPendingDefeatEnabled(enabledStatus: boolean) {
        this._pendingDefeat = enabledStatus ? false : null;
        this._disableOngoingEffectsForDefeat = enabledStatus ? false : null;
    }

    // ********************************************** ABILITY GETTERS **********************************************
    /**
     * `SWU 7.6.1`: Triggered abilities have bold text indicating their triggering condition, starting with the word
     * “When” or “On”, followed by a colon and an effect. Examples of triggered abilities are “When Played,”
     * “When Defeated,” and “On Attack” abilities
     */
    public getTriggeredAbilities(): TriggeredAbility[] {
        return this.triggeredAbilities;
    }

    public override canRegisterConstantAbilities(): this is InPlayCard {
        return true;
    }

    public override canRegisterTriggeredAbilities(): this is InPlayCard {
        return true;
    }


    // ********************************************* ABILITY SETUP *********************************************
    protected addActionAbility(properties: IActionAbilityProps<this>) {
        this.actionAbilities.push(this.createActionAbility(properties));
    }

    protected addConstantAbility(properties: IConstantAbilityProps<this>): void {
        const ability = this.createConstantAbility(properties);
        // This check is necessary to make sure on-play cost-reduction effects are registered
        if (ability.sourceZoneFilter === WildcardZoneName.Any) {
            ability.registeredEffects = this.addEffectToEngine(ability);
        }
        this.constantAbilities.push(ability);
    }

    protected addReplacementEffectAbility(properties: IReplacementEffectAbilityProps<this>): void {
        // for initialization and tracking purposes, a ReplacementEffect is basically a Triggered ability
        this.triggeredAbilities.push(this.createReplacementEffectAbility(properties));
    }

    protected addTriggeredAbility(properties: ITriggeredAbilityProps<this>): void {
        this.triggeredAbilities.push(this.createTriggeredAbility(properties));
    }

    protected addWhenPlayedAbility(properties: ITriggeredAbilityBaseProps<this>): void {
        const triggeredProperties = Object.assign(properties, { when: { onCardPlayed: (event, context) => event.card === context.source } });
        this.addTriggeredAbility(triggeredProperties);
    }

    protected addWhenDefeatedAbility(properties: ITriggeredAbilityBaseProps<this>): void {
        const triggeredProperties = Object.assign(properties, { when: { onCardDefeated: (event, context) => event.card === context.source } });
        this.addTriggeredAbility(triggeredProperties);
    }

    public createReplacementEffectAbility<TSource extends Card = this>(properties: IReplacementEffectAbilityProps<TSource>): ReplacementEffectAbility {
        return new ReplacementEffectAbility(this.game, this, Object.assign(this.buildGeneralAbilityProps('replacement'), properties));
    }

    public createTriggeredAbility<TSource extends Card = this>(properties: ITriggeredAbilityProps<TSource>): TriggeredAbility {
        return new TriggeredAbility(this.game, this, Object.assign(this.buildGeneralAbilityProps('triggered'), properties));
    }

    /** Add a constant ability on the card that decreases its cost under the given condition */
    protected addDecreaseCostAbility(properties: IDecreaseCostAbilityProps<this>): void {
        this.addConstantAbility(this.createConstantAbility(this.generateDecreaseCostAbilityProps(properties)));
    }

    /** Add a constant ability on the card that ignores all aspect penalties under the given condition */
    protected addIgnoreAllAspectPenaltiesAbility(properties: IIgnoreAllAspectPenaltiesProps<this>): void {
        this.addConstantAbility(this.createConstantAbility(this.generateIgnoreAllAspectPenaltiesAbilityProps(properties)));
    }

    /** Add a constant ability on the card that ignores specific aspect penalties under the given condition */
    protected addIgnoreSpecificAspectPenaltyAbility(properties: IIgnoreSpecificAspectPenaltyProps<this>): void {
        this.addConstantAbility(this.createConstantAbility(this.generateIgnoreSpecificAspectPenaltiesAbilityProps(properties)));
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

    public override resolveAbilitiesForNewZone() {
        // TODO: do we need to consider a case where a card is moved from one arena to another,
        // where we maybe wouldn't reset events / effects / limits?
        this.updateTriggeredAbilityEvents(this.movedFromZone, this.zoneName);
        this.updateConstantAbilityEffects(this.movedFromZone, this.zoneName);
        this.updateKeywordAbilityEffects(this.movedFromZone, this.zoneName);

        this.movedFromZone = null;
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
        }
    }

    /** Register / un-register the event triggers for any triggered abilities */
    private updateTriggeredAbilityEvents(from: ZoneName, to: ZoneName, reset: boolean = true) {
        if (!EnumHelpers.isArena(from) && !EnumHelpers.isArena(to)) {
            this.resetLimits();
        }

        for (const triggeredAbility of this.triggeredAbilities) {
            if (EnumHelpers.cardZoneMatches(to, triggeredAbility.zoneFilter) && !EnumHelpers.cardZoneMatches(from, triggeredAbility.zoneFilter)) {
                triggeredAbility.registerEvents();
            } else if (!EnumHelpers.cardZoneMatches(to, triggeredAbility.zoneFilter) && EnumHelpers.cardZoneMatches(from, triggeredAbility.zoneFilter)) {
                triggeredAbility.unregisterEvents();
            }
        }
    }

    /** Register / un-register the effect registrations for any constant abilities */
    private updateConstantAbilityEffects(from: ZoneName, to: ZoneName) {
        // removing any lasting effects from ourself
        if (EnumHelpers.isArena(from) && !EnumHelpers.isArena(to)) {
            this.removeLastingEffects();
        }

        // check to register / unregister any effects that we are the source of
        for (const constantAbility of this.constantAbilities) {
            if (constantAbility.sourceZoneFilter === WildcardZoneName.Any) {
                continue;
            }
            if (
                !EnumHelpers.cardZoneMatches(from, constantAbility.sourceZoneFilter) &&
                EnumHelpers.cardZoneMatches(to, constantAbility.sourceZoneFilter)
            ) {
                constantAbility.registeredEffects = this.addEffectToEngine(constantAbility);
            } else if (
                EnumHelpers.cardZoneMatches(from, constantAbility.sourceZoneFilter) &&
                !EnumHelpers.cardZoneMatches(to, constantAbility.sourceZoneFilter)
            ) {
                this.removeEffectFromEngine(constantAbility.registeredEffects);
                constantAbility.registeredEffects = [];
            }
        }
    }

    /** Register / un-register the effects for any abilities from keywords */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected updateKeywordAbilityEffects(from: ZoneName, to: ZoneName) { }

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
            zoneFilter: WildcardZoneName.AnyArena,
            controller: RelativePlayer.Self,
            cardCondition: (card: InPlayCard) =>
                card.unique && card.title === this.title && card.subtitle === this.subtitle && !card.pendingDefeat,
            onSelect: (player, card) => this.resolveUniqueDefeat(card)
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
