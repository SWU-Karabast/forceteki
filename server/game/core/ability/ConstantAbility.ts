import type { AbilityContext } from './AbilityContext.js';
import type { ZoneFilter } from '../Constants.js';
import { Duration, WildcardZoneName } from '../Constants.js';
import type { IConstantAbilityProps, IOngoingEffectFactory, IOngoingEffectGenerator } from '../../Interfaces.js';
import type { Card } from '../card/Card.js';
import type { Game } from '../Game.js';
import type { OngoingEffect } from '../ongoingEffect/OngoingEffect.js';
import { GameObjectBase } from '../GameObjectBase.js';
import type { IConstantAbility } from '../ongoingEffect/IConstantAbility.js';
import { registerState, stateRefArray } from '../GameObjectUtils';

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
@registerState()
export class ConstantAbility extends GameObjectBase implements IConstantAbility {
    public readonly properties: IConstantAbilityProps;

    // Stored fields: computed/defaulted values or from constructor args
    public readonly duration: Duration;
    public readonly sourceZoneFilter?: ZoneFilter | ZoneFilter[];
    public readonly sourceCard: Card;

    // Getters delegating to properties
    public get title(): string {
        return this.properties.title;
    }

    public get contextTitle(): ((context: AbilityContext) => string) | undefined {
        return this.properties.contextTitle;
    }

    public get abilityIdentifier(): string | undefined {
        return this.properties.abilityIdentifier;
    }

    public get printedAbility(): boolean {
        return this.properties.printedAbility ?? true;
    }

    public get gainAbilitySource(): Card | undefined {
        return this.properties.gainAbilitySource;
    }

    public get ongoingEffect(): IOngoingEffectGenerator | IOngoingEffectGenerator[] {
        return this.properties.ongoingEffect;
    }

    @stateRefArray()
    public accessor registeredEffects: readonly OngoingEffect[] = [];

    public constructor(game: Game, card: Card, properties: IConstantAbilityProps) {
        super(game);

        this.properties = properties;
        this.duration = Duration.Persistent;
        this.sourceZoneFilter = properties.sourceZoneFilter || WildcardZoneName.AnyArena;
        this.sourceCard = card;
    }

    /**
     * Builds a plain object suitable for passing to {@link OngoingEffectSource.addEffectToEngine}.
     * Conditionally includes optional properties so that `undefined` values don't override
     * defaults when the result is destructured in the effect engine.
     */
    public buildEffectFactoryProps<TTarget extends Card = Card>(): IOngoingEffectFactory<TTarget> {
        const props = this.properties;
        // Using a typed base and adding optional properties conditionally so that
        // undefined values don't override defaults when destructured in the effect engine.
        const result: IOngoingEffectFactory<Card> & Record<string, unknown> = {
            ongoingEffect: props.ongoingEffect,
            sourceZoneFilter: this.sourceZoneFilter,
            duration: this.duration,
        };

        if (props.condition) {
            result.condition = props.condition;
        }
        if (props.matchTarget) {
            result.matchTarget = props.matchTarget;
        }
        if (props.targetController) {
            result.targetController = props.targetController;
        }
        if (props.targetZoneFilter) {
            result.targetZoneFilter = props.targetZoneFilter;
        }
        if (props.targetCardTypeFilter) {
            result.targetCardTypeFilter = props.targetCardTypeFilter;
        }
        if (props.cardName) {
            result.cardName = props.cardName;
        }
        if (props.abilityIdentifier) {
            result.abilityIdentifier = props.abilityIdentifier;
        }

        return result as unknown as IOngoingEffectFactory<TTarget>;
    }

    public getTitle<T extends AbilityContext>(context?: T): string {
        if (this.contextTitle && context) {
            return this.contextTitle(context);
        }

        return this.title;
    }
}


