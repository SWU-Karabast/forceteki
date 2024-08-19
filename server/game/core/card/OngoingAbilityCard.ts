import AbilityHelper from '../../AbilityHelper';
import { IConstantAbilityProps, ITriggeredAbilityProps } from '../../Interfaces';
import TriggeredAbility from '../ability/TriggeredAbility';
import { CardType, Duration, Location, LocationFilter, WildcardLocation } from '../Constants';
import { IConstantAbility } from '../ongoingEffect/IConstantAbility';
import Player from '../Player';
import { cardLocationMatches, isArena } from '../utils/EnumHelpers';
import Card from './Card';
import { CardConstructor } from './NewCard';
import * as KeywordHelpers from './KeywordHelpers';
import { PlayableOrDeployableCard } from './PlayableOrDeployableCard';
import Contract from '../utils/Contract';

/**
 * Subclass of {@link NewCard} (via {@link PlayableOrDeployableCard}) that adds properties for cards that can
 * have "ongoing" abilities, i.e., triggered abilities and constant abilities. This excludes events and bases.
 */
export class OngoingAbilityCard extends PlayableOrDeployableCard {
    protected _triggeredAbilities: TriggeredAbility[];
    protected _constantAbilities: IConstantAbility[];

    // **************************************** ABILITY GETTERS ****************************************
    /**
     * `SWU 7.3.1`: A constant ability is always in effect while the card it is on is in play. Constant abilities
     * don’t have any special styling
     */
    public get constantAbilities() {
        return this.isBlank() ? []
            : this._constantAbilities;
    }


    // TODO THIS PR: go through and fix SWU rule reference numbers
    /**
     * `SWU 7.6.1`: Triggered abilities have bold text indicating their triggering condition, starting with the word
     * “When” or “On”, followed by a colon and an effect. Examples of triggered abilities are “When Played,”
     * “When Defeated,” and “On Attack” abilities
     */
    public get triggeredAbilities() {
        return this.isBlank() ? []
            : this._triggeredAbilities;
    }

    // **************************************** CONSTRUCTOR ****************************************
    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        // this class is for all card types other than Base and Event (Base is checked in the superclass constructor)
        Contract.assertFalse(this.printedTypes.has(CardType.Event));

        this._constantAbilities = KeywordHelpers.GenerateConstantAbilitiesFromKeywords(this.printedKeywords);
        this._triggeredAbilities = KeywordHelpers.GenerateTriggeredAbilitiesFromKeywords(this.printedKeywords);
    }


    // ********************************************* ABILITY SETUP *********************************************
    protected constantAbility(properties: IConstantAbilityProps<this>): void {
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
        this._constantAbilities.push({ duration: Duration.Persistent, locationFilter, ...properties });
    }

    // TODO THIS PR: consolidate these down to "add*" abilities (also in NewCard.ts). Also add docstr
    protected triggeredAbility(properties: ITriggeredAbilityProps): void {
        this._triggeredAbilities.push(this.createTriggeredAbility(properties));
    }

    protected whenPlayedAbility(properties: Omit<ITriggeredAbilityProps, 'when' | 'aggregateWhen'>): void {
        const triggeredProperties = Object.assign(properties, { when: { onUnitEntersPlay: (event) => event.card === this } });
        this.triggeredAbility(triggeredProperties);
    }

    private createTriggeredAbility(properties: ITriggeredAbilityProps): TriggeredAbility {
        properties.cardName = this.title;
        return new TriggeredAbility(this.game, this.generateOriginalCard(), properties);
    }

    // ******************************************** ABILITY STATE MANAGEMENT ********************************************
    protected override initializeForCurrentLocation(prevLocation: Location) {
        super.initializeForCurrentLocation(prevLocation);

        // TODO: do we need to consider a case where a card is moved from one arena to another?
        this.updateTriggeredAbilityEvents(prevLocation, this.location);
        this.updateConstantAbilityEffects(prevLocation, this.location);
    }

    /** Register / un-register the event triggers for any triggered abilities */
    private updateTriggeredAbilityEvents(from: Location, to: Location, reset: boolean = true) {
        // TODO CAPTURE: does being captured and then freed in the same turn reset any ability limits?
        this.resetLimits();

        for (const triggeredAbility of this._triggeredAbilities) {
            if (this.isEvent()) {
                // TODO EVENT: this block is here because jigoku would would register a 'bluff' triggered ability window in the UI, do we still need that?
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
            } else if (cardLocationMatches(to, triggeredAbility.location) && !cardLocationMatches(from, triggeredAbility.location)) {
                triggeredAbility.registerEvents();
            } else if (!cardLocationMatches(to, triggeredAbility.location) && cardLocationMatches(from, triggeredAbility.location)) {
                triggeredAbility.unregisterEvents();
            }
        }
    }

    private updateConstantAbilityEffects(from: Location, to: Location) {
        // removing any lasting effects from ourself
        if (!isArena(from) && !isArena(to)) {
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
                !cardLocationMatches(from, constantAbility.locationFilter) &&
                    cardLocationMatches(to, constantAbility.locationFilter)
            ) {
                constantAbility.registeredEffects = this.addEffectToEngine(constantAbility);
            } else if (
                cardLocationMatches(from, constantAbility.locationFilter) &&
                    !cardLocationMatches(to, constantAbility.locationFilter)
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