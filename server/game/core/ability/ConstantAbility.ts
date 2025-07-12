import type { AbilityContext } from './AbilityContext.js';
import type { CardTypeFilter, RelativePlayerFilter, ZoneFilter } from '../Constants.js';
import { Duration, WildcardZoneName } from '../Constants.js';
import type { IConstantAbilityProps, IOngoingEffectGenerator } from '../../Interfaces.js';
import type { Card, ICardState } from '../card/Card.js';
import type Game from '../Game.js';
import type { OngoingEffect } from '../ongoingEffect/OngoingEffect.js';
import { GameObjectBase } from '../GameObjectBase.js';
import type { IConstantAbility } from '../ongoingEffect/IConstantAbility.js';

/**
 * Represents an action ability provided by card text.
 *
 * Properties:
 * title        - string that is used within the card menu associated with this
 *                action.
 * condition    - optional function that should return true when the action is
 *                allowed, false otherwise. It should generally be used to check
 *                if the action can modify game state (step #1 in ability
 *                resolution in the rules).
 * cost         - object or array of objects representing the cost required to
 *                be paid before the action will activate. See Costs.
 * phase        - string representing which phases the action may be executed.
 *                Defaults to 'any' which allows the action to be executed in
 *                any phase.
 * zone     - string indicating the zone the card should be in in order
 *                to activate the action. Defaults to 'play area'.
 * limit        - optional AbilityLimit object that represents the max number of
 *                uses for the action as well as when it resets.
 * clickToActivate - boolean that indicates the action should be activated when
 *                   the card is clicked.
 */
export class ConstantAbility extends GameObjectBase implements IConstantAbility {
    public readonly title: string;
    public readonly abilityIdentifier?: string;

    public readonly duration: Duration;
    public readonly sourceZoneFilter?: ZoneFilter | ZoneFilter[];

    public readonly condition?: (context?: AbilityContext) => boolean;
    public readonly matchTarget?: (card: Card, context?: AbilityContext<Card<ICardState>>) => boolean;
    public readonly targetController?: RelativePlayerFilter;
    public readonly targetZoneFilter?: ZoneFilter;
    public readonly targetCardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    public readonly cardName?: string;
    public readonly ongoingEffect: IOngoingEffectGenerator | IOngoingEffectGenerator[];
    public readonly createCopies?: boolean;

    public registeredEffects?: OngoingEffect[];

    public constructor(game: Game, card: Card, properties: IConstantAbilityProps) {
        super(game);

        this.title = properties.title;
        this.abilityIdentifier = properties.abilityIdentifier;
        this.duration = Duration.Persistent;
        this.sourceZoneFilter = properties.sourceZoneFilter || WildcardZoneName.AnyArena;

        // This object is destructured later and these properties will be to override defaults when the OngoingEffect is created. If these fields exist at all, even if undefined, it'll override the defaults when they shouldn't be.
        if (properties.condition) {
            this.condition = properties.condition;
        }
        if (properties.matchTarget) {
            this.matchTarget = properties.matchTarget;
        }
        if (properties.targetController) {
            this.targetController = properties.targetController;
        }
        if (properties.targetController) {
            this.targetZoneFilter = properties.targetZoneFilter;
        }
        if (properties.targetCardTypeFilter) {
            this.targetCardTypeFilter = properties.targetCardTypeFilter;
        }
        if (properties.cardName) {
            this.cardName = properties.cardName;
        }
        if (properties.ongoingEffect) {
            this.ongoingEffect = properties.ongoingEffect;
        }
        if (properties.createCopies) {
            this.createCopies = properties.createCopies;
        }
    }
}
