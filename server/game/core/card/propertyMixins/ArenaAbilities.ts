import AbilityHelper from '../../../AbilityHelper';
import { IActionProps, IConstantAbilityProps, ITriggeredAbilityProps } from '../../../Interfaces';
import { CardActionAbility } from '../../ability/CardActionAbility';
import TriggeredAbility from '../../ability/TriggeredAbility';
import { Duration, Location, LocationFilter, WildcardLocation } from '../../Constants';
import { IConstantAbility } from '../../ongoingEffect/IConstantAbility';
import Card from '../Card';
import { CardConstructor } from '../NewCard';

export function ArenaAbilities<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithArenaAbilities extends BaseClass {
        protected triggeredAbilites: TriggeredAbility[] = [];
        protected constantAbilities: IConstantAbility[] = [];

        // TODO: consolidate these down to "add*" abilities
        protected actionAbility(properties: IActionProps<this>): void {
            this.actions.push(this.createActionAbility(properties));
        }

        private createActionAbility(properties: IActionProps): CardActionAbility {
            properties.cardName = this.title;
            return new CardActionAbility(this.game, this.generateOriginalCard(), properties);
        }

        protected triggeredAbility(properties: ITriggeredAbilityProps): void {
            this.triggeredAbilites.push(this.createTriggeredAbility(properties));
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
            this.constantAbilities.push({ duration: Duration.Persistent, locationFilter, ...properties });
        }
    };
}