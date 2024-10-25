import { IActionAbilityProps, IConstantAbilityProps, IReplacementEffectAbilityProps, ITriggeredAbilityBaseProps, ITriggeredAbilityProps } from '../../../Interfaces';
import TriggeredAbility from '../../ability/TriggeredAbility';
import { CardType, Location, WildcardLocation } from '../../Constants';
import Player from '../../Player';
import * as EnumHelpers from '../../utils/EnumHelpers';
import { IDecreaseEventCostAbilityProps, IIgnoreAspectPenaltiesProps, PlayableOrDeployableCard } from './PlayableOrDeployableCard';
import * as Contract from '../../utils/Contract';
import ReplacementEffectAbility from '../../ability/ReplacementEffectAbility';
import { Card } from '../Card';

// required for mixins to be based on this class
export type InPlayCardConstructor = new (...args: any[]) => InPlayCard;

/**
 * Subclass of {@link Card} (via {@link PlayableOrDeployableCard}) that adds properties for cards that
 * can be in any "in-play" zones (`SWU 4.9`). This encompasses all card types other than events or bases.
 *
 * The two unique properties of in-play cards added by this subclass are:
 * 1. "Ongoing" abilities, i.e., triggered abilities and constant abilities
 * 2. The ability to be defeated as an overridable method
 */
export class InPlayCard extends PlayableOrDeployableCard {
    protected triggeredAbilities: TriggeredAbility[] = [];

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        // this class is for all card types other than Base and Event (Base is checked in the superclass constructor)
        Contract.assertFalse(this.printedType === CardType.Event);
    }

    public isInPlay(): boolean {
        return EnumHelpers.isArena(this.location);
    }

    public override canBeInPlay(): this is InPlayCard {
        return true;
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
        this.constantAbilities.push(this.createConstantAbility(properties));
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
    protected addDecreaseCostAbility(properties: IDecreaseEventCostAbilityProps<this>): void {
        this.addConstantAbility(this.createConstantAbility(this.generateDecreaseCostAbilityProps(properties)));
    }

    /** Add a constant ability on the card that ignores all aspect penalties under the given condition */
    protected addIgnoreAllAspectPenaltiesAbility(properties: IIgnoreAspectPenaltiesProps<this>): void {
        this.addConstantAbility(this.createConstantAbility(this.generateIgnoreAllAspectPenaltiesAbilityProps(properties)));
    }

    /** Add a constant ability on the card that ignores specific aspect penalties under the given condition */
    protected addIgnoreSpecificAspectPenaltyAbility(properties: IIgnoreAspectPenaltiesProps<this>): void {
        this.addConstantAbility(this.createConstantAbility(this.generateIgnoreSpecificAspectPenaltiesAbilityProps(properties)));
    }

    // ******************************************** ABILITY STATE MANAGEMENT ********************************************
    /**
     * Adds a dynamically gained triggered ability to the unit and immediately registers its triggers. Used for "gain ability" effects.
     *
     * @returns The uuid of the created triggered ability
     */
    public addGainedTriggeredAbility(properties: ITriggeredAbilityProps): string {
        const addedAbility = this.createTriggeredAbility(properties);
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

    /** Update the context of each constant ability. Used when the card's controller has changed. */
    public updateConstantAbilityContexts() {
        for (const constantAbility of this.constantAbilities) {
            if (constantAbility.registeredEffects) {
                for (const effect of constantAbility.registeredEffects) {
                    effect.refreshContext();
                }
            }
        }
    }

    protected override initializeForCurrentLocation(prevLocation: Location) {
        super.initializeForCurrentLocation(prevLocation);

        // TODO: do we need to consider a case where a card is moved from one arena to another,
        // where we maybe wouldn't reset events / effects / limits?
        this.updateTriggeredAbilityEvents(prevLocation, this.location);
        this.updateConstantAbilityEffects(prevLocation, this.location);
    }

    /** Register / un-register the event triggers for any triggered abilities */
    private updateTriggeredAbilityEvents(from: Location, to: Location, reset: boolean = true) {
        // TODO CAPTURE: does being captured and then freed in the same turn reset any ability limits?
        this.resetLimits();

        for (const triggeredAbility of this.triggeredAbilities) {
            if (this.isEvent()) {
                // TODO EVENTS: this block is here because jigoku would would register a 'bluff' triggered ability window in the UI, do we still need that?
                // normal event abilities have their own category so this is the only 'triggered ability' for event cards
                if (
                    to === Location.Deck ||
                    this.controller.isCardInPlayableLocation(this) ||
                    (this.controller.opponent && this.controller.opponent.isCardInPlayableLocation(this))
                ) {
                    triggeredAbility.registerEvents();
                } else {
                    triggeredAbility.unregisterEvents();
                }
            } else if (EnumHelpers.cardLocationMatches(to, triggeredAbility.locationFilter) && !EnumHelpers.cardLocationMatches(from, triggeredAbility.locationFilter)) {
                triggeredAbility.registerEvents();
            } else if (!EnumHelpers.cardLocationMatches(to, triggeredAbility.locationFilter) && EnumHelpers.cardLocationMatches(from, triggeredAbility.locationFilter)) {
                triggeredAbility.unregisterEvents();
            }
        }
    }

    /** Register / un-register the effect registrations for any constant abilities */
    private updateConstantAbilityEffects(from: Location, to: Location) {
        // removing any lasting effects from ourself
        if (!EnumHelpers.isArena(from) && !EnumHelpers.isArena(to)) {
            this.removeLastingEffects();
        }

        // check to register / unregister any effects that we are the source of
        for (const constantAbility of this.constantAbilities) {
            if (constantAbility.sourceLocationFilter === WildcardLocation.Any) {
                continue;
            }
            if (
                !EnumHelpers.cardLocationMatches(from, constantAbility.sourceLocationFilter) &&
                EnumHelpers.cardLocationMatches(to, constantAbility.sourceLocationFilter)
            ) {
                constantAbility.registeredEffects = this.addEffectToEngine(constantAbility);
            } else if (
                EnumHelpers.cardLocationMatches(from, constantAbility.sourceLocationFilter) &&
                !EnumHelpers.cardLocationMatches(to, constantAbility.sourceLocationFilter)
            ) {
                this.removeEffectFromEngine(constantAbility.registeredEffects);
                constantAbility.registeredEffects = [];
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
}