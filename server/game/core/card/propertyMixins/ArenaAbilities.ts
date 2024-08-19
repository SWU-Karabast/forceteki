import AbilityHelper from '../../../AbilityHelper';
import { IActionAbilityProps, IConstantAbilityProps, ITriggeredAbilityProps } from '../../../Interfaces';
import { CardActionAbility } from '../../ability/CardActionAbility';
import TriggeredAbility from '../../ability/TriggeredAbility';
import { Duration, Location, LocationFilter, WildcardLocation } from '../../Constants';
import { IConstantAbility } from '../../ongoingEffect/IConstantAbility';
import { cardLocationMatches, isArena } from '../../utils/EnumHelpers';
import Card from '../Card';
import { CardConstructor } from '../NewCard';

export function ArenaAbilities<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithArenaAbilities extends BaseClass {
        protected _actionAbilities: CardActionAbility[] = [];
        protected _triggeredAbilities: TriggeredAbility[] = [];
        protected _constantAbilities: IConstantAbility[] = [];

        // **************************************** ABILITY GETTERS ****************************************
        public override get actions() {
            return this.isBlank() ? []
                : this.defaultActions.concat(this.actionAbilities);
        }

        /**
         * `SWU 7.2.1`: An action ability is an ability indicated by the bolded word “Action.” Most action abilities have
         * a cost in brackets that must be paid in order to use the ability.
         */
        public get actionAbilities() {
            return this.isBlank() ? []
                : this._actionAbilities;
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

        /**
         * `SWU 7.3.1`: A constant ability is always in effect while the card it is on is in play. Constant abilities
         * don’t have any special styling
         */
        public get constantAbilities() {
            return this.isBlank() ? []
                : this._constantAbilities;
        }

        // ********************************************* ABILITY SETUP *********************************************
        // TODO THIS PR: consolidate these down to "add*" abilities
        protected actionAbility(properties: IActionAbilityProps<this>): void {
            this.actions.push(this.createActionAbility(properties));
        }

        private createActionAbility(properties: IActionAbilityProps): CardActionAbility {
            properties.cardName = this.title;
            return new CardActionAbility(this.game, this.generateOriginalCard(), properties);
        }

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

        /**
         * Applies an effect that continues as long as the card providing the effect
         * is both in play and not blank.
         */
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

        // ******************************************** ABILITY STATE MANAGEMENT ********************************************
        private updateTriggeredAbilityEvents(from: Location, to: Location, reset: boolean = true) {
            if (reset) {
                this.resetLimits();
            }
            for (const triggeredAbility of this._triggeredAbilities) {
                if (this.isEvent()) {
                    // TODO EVENT: this is block is here because jigoku would would register a bluff 'reaction' window, do we still need that?
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

        private resetLimits() {
            for (const action of this._actionAbilities) {
                if (action.limit) {
                    action.limit.reset();
                }
            }
            for (const triggeredAbility of this._triggeredAbilities) {
                if (triggeredAbility.limit) {
                    triggeredAbility.limit.reset();
                }
            }
        }
    };
}