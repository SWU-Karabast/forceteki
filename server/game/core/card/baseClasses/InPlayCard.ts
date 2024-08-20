import { IConstantAbilityProps, ITriggeredAbilityProps } from '../../../Interfaces';
import TriggeredAbility from '../../ability/TriggeredAbility';
import { AbilityRestriction, AbilityType, Arena, CardType, Duration, EventName, Location, LocationFilter, WildcardLocation } from '../../Constants';
import { IConstantAbility } from '../../ongoingEffect/IConstantAbility';
import Player from '../../Player';
import * as EnumHelpers from '../../utils/EnumHelpers';
import * as KeywordHelpers from '../KeywordHelpers';
import { PlayableOrDeployableCard } from './PlayableOrDeployableCard';
import Contract from '../../utils/Contract';

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
    public readonly defaultArena: Arena;

    protected _triggeredAbilities: TriggeredAbility[] = [];
    protected _constantAbilities: IConstantAbility[] = [];

    private _enteredPlayThisRound?: boolean = null;

    public get enteredPlayThisRound(): boolean {
        Contract.assertNotNullLike(this._enteredPlayThisRound);
        return this._enteredPlayThisRound;
    }

    // ********************************************** CONSTRUCTOR **********************************************
    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        Contract.assertNotNullLike(cardData.arena);
        switch (cardData.arena) {
            case 'space':
                this.defaultArena = Location.SpaceArena;
                break;
            case 'ground':
                this.defaultArena = Location.GroundArena;
                break;
            default:
                Contract.fail(`Unknown arena type in card data: ${cardData.arena}`);
        }

        // this class is for all card types other than Base and Event (Base is checked in the superclass constructor)
        Contract.assertFalse(this.printedTypes.has(CardType.Event));

        this._constantAbilities.push(...KeywordHelpers.GenerateConstantAbilitiesFromKeywords(this.printedKeywords));
        this._triggeredAbilities.push(...KeywordHelpers.GenerateTriggeredAbilitiesFromKeywords(this.printedKeywords));

        this.activateAbilityInitializersForTypes([AbilityType.Constant, AbilityType.Triggered]);
    }


    // **************************************** ABILITY GETTERS ****************************************
    /**
     * `SWU 7.3.1`: A constant ability is always in effect while the card it is on is in play. Constant abilities
     * don’t have any special styling
     */
    public getConstantAbilities(): IConstantAbility[] {
        return this.isBlank() ? []
            : this._constantAbilities;
    }

    /**
     * `SWU 7.6.1`: Triggered abilities have bold text indicating their triggering condition, starting with the word
     * “When” or “On”, followed by a colon and an effect. Examples of triggered abilities are “When Played,”
     * “When Defeated,” and “On Attack” abilities
     */
    public getTriggeredAbilities(): TriggeredAbility[] {
        return this.isBlank() ? []
            : this._triggeredAbilities;
    }

    public override canRegisterConstantAbilities(): boolean {
        return true;
    }

    public override canRegisterTriggeredAbilities(): boolean {
        return true;
    }


    // ********************************************* ABILITY SETUP *********************************************
    protected addConstantAbility(properties: IConstantAbilityProps<this>): void {
        const allowedLocationFilters = [
            WildcardLocation.Any,
            Location.Discard,
            WildcardLocation.AnyArena,
            Location.Leader,
            Location.Base,
        ];

        const locationFilter = properties.locationFilter || WildcardLocation.AnyArena;

        let notAllowedLocations: LocationFilter[];
        if (Array.isArray(locationFilter)) {
            notAllowedLocations = allowedLocationFilters.filter((location) => locationFilter.includes(location));
        } else {
            notAllowedLocations = allowedLocationFilters.includes(locationFilter) ? [] : [locationFilter];
        }

        if (notAllowedLocations.length > 0) {
            throw new Error(`Illegal effect location(s) specified: '${notAllowedLocations.join(', ')}'`);
        }
        properties.cardName = this.title;

        this.abilityInitializers.push({
            abilityType: AbilityType.Constant,
            initialize: () => this._constantAbilities.push({ duration: Duration.Persistent, locationFilter, ...properties })
        });
    }

    protected addTriggeredAbility(properties: ITriggeredAbilityProps): void {
        this.abilityInitializers.push({
            abilityType: AbilityType.Triggered,
            initialize: () => this._triggeredAbilities.push(this.createTriggeredAbility(properties))
        });
    }

    protected addAttackAbility(properties:Omit<ITriggeredAbilityProps, 'when' | 'aggregateWhen'>): void {
        const triggeredProperties = Object.assign(properties, { when: { onAttackDeclared: (event) => event.attacker === this } });
        this.addTriggeredAbility(triggeredProperties);
    }

    protected addWhenPlayedAbility(properties: Omit<ITriggeredAbilityProps, 'when' | 'aggregateWhen'>): void {
        const triggeredProperties = Object.assign(properties, { when: { onUnitEntersPlay: (event) => event.card === this } });
        this.addTriggeredAbility(triggeredProperties);
    }

    public createTriggeredAbility(properties: ITriggeredAbilityProps): TriggeredAbility {
        properties.cardName = this.title;
        return new TriggeredAbility(this.game, this, properties);
    }


    // ******************************************** PLAY / DEFEAT MANAGEMENT ********************************************
    // TODO LEADER: TODO TOKEN: add custom defeat logic here. figure out how it should interact with player.defeatCard()
    // and the DefeatCardSystem

    private resetEnteredPlayThisRound() {
        // if the value is null, the card is no longer in play
        if (this._enteredPlayThisRound !== null) {
            this._enteredPlayThisRound = false;
        }
    }

    // ******************************************** ABILITY STATE MANAGEMENT ********************************************
    protected override initializeForCurrentLocation(prevLocation: Location) {
        super.initializeForCurrentLocation(prevLocation);

        // TODO: do we need to consider a case where a card is moved from one arena to another,
        // where we maybe wouldn't reset events / effects / limits?
        this.updateTriggeredAbilityEvents(prevLocation, this.location);
        this.updateConstantAbilityEffects(prevLocation, this.location);

        this._enteredPlayThisRound = EnumHelpers.isArena(this.location) ? true : null;

        // register a handler to reset the enteredPlayThisRound flag after the end of the round
        this.game.on(EventName.OnRoundEndedCleanup, this.resetEnteredPlayThisRound);
    }

    /** Register / un-register the event triggers for any triggered abilities */
    private updateTriggeredAbilityEvents(from: Location, to: Location, reset: boolean = true) {
        // TODO CAPTURE: does being captured and then freed in the same turn reset any ability limits?
        this.resetLimits();

        for (const triggeredAbility of this._triggeredAbilities) {
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
            } else if (EnumHelpers.cardLocationMatches(to, triggeredAbility.location) && !EnumHelpers.cardLocationMatches(from, triggeredAbility.location)) {
                triggeredAbility.registerEvents();
            } else if (!EnumHelpers.cardLocationMatches(to, triggeredAbility.location) && EnumHelpers.cardLocationMatches(from, triggeredAbility.location)) {
                triggeredAbility.unregisterEvents();
            }
        }
    }

    private updateConstantAbilityEffects(from: Location, to: Location) {
        // removing any lasting effects from ourself
        if (!EnumHelpers.isArena(from) && !EnumHelpers.isArena(to)) {
            this.removeLastingEffects();
        }

        // TODO UPGRADES: is this needed for upgrades?
        // this.updateStatusTokenEffects();

        // check to register / unregister any effects that we are the source of
        for (const constantAbility of this._constantAbilities) {
            if (constantAbility.locationFilter === WildcardLocation.Any) {
                continue;
            }
            if (
                !EnumHelpers.cardLocationMatches(from, constantAbility.locationFilter) &&
                    EnumHelpers.cardLocationMatches(to, constantAbility.locationFilter)
            ) {
                constantAbility.registeredEffects = this.addEffectToEngine(constantAbility);
            } else if (
                EnumHelpers.cardLocationMatches(from, constantAbility.locationFilter) &&
                    !EnumHelpers.cardLocationMatches(to, constantAbility.locationFilter)
            ) {
                this.removeEffectFromEngine(constantAbility.registeredEffects);
                constantAbility.registeredEffects = [];
            }
        }
    }

    protected override resetLimits() {
        super.resetLimits();

        for (const triggeredAbility of this._triggeredAbilities) {
            if (triggeredAbility.limit) {
                triggeredAbility.limit.reset();
            }
        }
    }
}