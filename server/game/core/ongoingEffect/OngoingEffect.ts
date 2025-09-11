import type { IOngoingEffectProps, WhenType } from '../../Interfaces';
import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type { ZoneFilter } from '../Constants';
import { Duration, WildcardZoneName, EffectName } from '../Constants';
import type Game from '../Game';
import type { GameObject } from '../GameObject';
import type { GameObjectRef, IGameObjectBaseState } from '../GameObjectBase';
import { GameObjectBase } from '../GameObjectBase';
import * as Contract from '../utils/Contract';
import type { OngoingEffectImpl } from './effectImpl/OngoingEffectImpl';
import { registerState, undoArray } from '../GameObjectUtils';

export interface IOngoingEffectState<TTarget extends GameObject> extends IGameObjectBaseState {
    targets: GameObjectRef<TTarget>[];
}

/**
 * Represents a card based effect applied to one or more targets.
 *
 * Properties:
 * matchTarget          - function that takes a card/player and context object
 *                        and returns a boolean about whether the passed object should
 *                        have the effect applied. Alternatively, a card/player can
 *                        be passed as the match property to match that single object.
 *                        Doesn't apply to attack effects. (TODO: still true?)
 * duration             - string representing how long the effect lasts.
 * condition            - function that returns a boolean determining whether the
 *                        effect can be applied. Use with cards that have a
 *                        condition that must be met before applying a persistent
 *                        effect (e.g. 'when exhausted').
 * zoneFilter       - zone where the source of this effect needs to be for
 *                        the effect to be active. Defaults to 'play area'.
 * targetController     - string that determines which player's cards are targeted.
 *                        Can be 'self' (default), 'opponent' or 'any'. For player
 *                        effects it determines which player(s) are affected.
 * targetZoneFilter - string that determines the zone of cards that can be
 *                        applied by the effect. Can be 'play area' (default),
 *                        'province', or a specific zone (e.g. 'stronghold province'
 *                        or 'hand'). This has no effect if a specific card is passed
 *                        to match.  Card effects only.
 * impl                 - object with details of effect to be applied. Includes duration
 *                        and the numerical value of the effect, if any.
 */
@registerState()
export abstract class OngoingEffect<TTarget extends GameObject = GameObject, TState extends IOngoingEffectState<TTarget> = IOngoingEffectState<TTarget>> extends GameObjectBase<TState> {
    public source: Card;
    // TODO: Can we make GameObject more specific? Can we add generics to the class for AbilityContext?
    public readonly matchTarget: TTarget | ((target: TTarget, context: AbilityContext) => boolean);
    public readonly duration?: Duration;
    public readonly until: WhenType;
    public readonly condition: (context?: AbilityContext) => boolean;
    public readonly sourceZoneFilter: ZoneFilter | ZoneFilter[];
    public readonly impl: OngoingEffectImpl<any>;
    public readonly ongoingEffect: IOngoingEffectProps<TTarget>;
    public context: AbilityContext;

    @undoArray()
    public accessor targets: readonly TTarget[] = [];

    public get type() {
        return this.impl.type;
    }


    public constructor(game: Game, source: Card, properties: IOngoingEffectProps<TTarget>, effectImpl: OngoingEffectImpl<any>) {
        Contract.assertFalse(
            properties.duration === Duration.WhileSourceInPlay && !source.canBeInPlay(),
            `${source.internalName} is not a legal target for an effect with duration '${Duration.WhileSourceInPlay}'`
        );
        super(game);

        this.source = source;
        this.matchTarget = properties.matchTarget || (() => true);
        this.duration = properties.duration;
        this.until = properties.until || {};
        this.condition = properties.condition || (() => true);
        this.sourceZoneFilter = properties.sourceZoneFilter || WildcardZoneName.AnyArena;
        this.impl = effectImpl;
        this.ongoingEffect = properties;
        this.refreshContext();

        this.impl.duration = this.duration;
        this.impl.isConditional = !!properties.condition;

        // bit of a hack to keep the impl object added to the game state
        this.impl.getRef();
    }

    public getValue(card: GameObject) {
        return this.impl.getValue(card);
    }

    public refreshContext() {
        this.context = this.game.getFrameworkContext(this.source.controller);
        this.context.source = this.source;
        // The process of creating the OngoingEffect tacks on additional properties that are ability related,
        //  so this is *probably* fine, but definitely a sign it needs a refactor at some point.
        this.context.ongoingEffect = this.ongoingEffect;
        this.impl.setContext(this.context);
    }

    public isValidTarget(target: TTarget) {
        return true;
    }

    public getDefaultTarget(context) {
        return null;
    }

    public getTargets() {
        return [];
    }

    public addTarget(target: TTarget) {
        this.targets = [...this.targets, target];
        // eslint-disable-next-line prefer-spread
        this.impl.apply(this, target);
    }

    public removeTarget(target) {
        this.removeTargets([target]);
    }

    public removeTargets(targets: TTarget[]) {
        targets.forEach((target) => this.impl.unapply(this, target));
        this.targets = this.targets.filter((target) => !targets.includes(target));
    }

    public hasTarget(target: TTarget) {
        return this.targets.includes(target);
    }

    public cancel() {
        this.targets.forEach((target) => this.impl.unapply(this, target));
        this.targets = [];
    }

    public isEffectActive() {
        if (this.impl.type === EffectName.DelayedEffect) {
            const limit = this.impl.getValue().limit;

            return !limit?.isAtMax(this.context.player);
        }

        if (this.duration !== Duration.Persistent || this.ongoingEffect.isLastingEffect) {
            return true;
        }

        // disable ongoing effects if the card is queued up to be defeated (e.g. due to combat or unique rule)
        if ((this.source.isUnit() || this.source.isUpgrade()) && this.source.isInPlay() && this.source.disableOngoingEffectsForDefeat) {
            return false;
        }

        if (!this.source.getConstantAbilities().some((effect) => effect.registeredEffects && effect.registeredEffects.includes(this))) {
            return false;
        }

        return true;
    }

    public resolveEffectTargets() {
        if (!this.isEffectActive() || !this.condition(this.context)) {
            const stateChanged = this.targets.length > 0;
            this.cancel();
            return stateChanged;
        } else if (typeof this.matchTarget === 'function') {
            // Get any targets which are no longer valid
            const invalidTargets = this.targets.filter((target) => !this.isValidTarget(target));
            // Remove invalid targets
            this.removeTargets(invalidTargets);
            let stateChanged = invalidTargets.length > 0;
            // Recalculate the effect for valid targets
            this.targets.forEach((target) => stateChanged = this.impl.recalculate(target) || stateChanged);
            // Check for new targets
            const newTargets = this.getTargets().filter((target) => !this.targets.includes(target) && this.isValidTarget(target));
            // Apply the effect to new targets
            newTargets.forEach((target) => this.addTarget(target));
            return stateChanged || newTargets.length > 0;
        } else if (this.targets.includes(this.matchTarget)) {
            if (!this.isValidTarget(this.matchTarget)) {
                this.cancel();
                return true;
            }
            return this.impl.recalculate(this.matchTarget);
        } else if (!this.targets.includes(this.matchTarget) && this.isValidTarget(this.matchTarget)) {
            this.addTarget(this.matchTarget);
            return true;
        }
        return false;
    }

    public getDebugInfo() {
        return {
            source: this.source.title,
            targets: this.targets.map((target) => target.name).join(','),
            active: this.isEffectActive(),
            condition: this.condition(this.context),
            effect: this.impl.getDebugInfo()
        };
    }

    public override afterSetAllState(oldState: TState) {
        this.refreshContext();
    }
}
