
import type { AbilityContext } from './ability/AbilityContext';
import { AbilityRestriction, EffectName, Stage } from './Constants';
import type Game from './Game';
import type { Player } from './Player';
import type { Card } from './card/Card';
import type { IGameObjectBaseState } from './GameObjectBase';
import { GameObjectBase } from './GameObjectBase';
import type { Restriction } from './ongoingEffect/effectImpl/Restriction';
import type { OngoingCardEffect } from './ongoingEffect/OngoingCardEffect';
import { registerState, undoArray, undoState } from './GameObjectUtils';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IGameObjectState extends IGameObjectBaseState {
    // id: string;
    // nameField: string;
    // ongoingEffects: GameObjectRef<OngoingCardEffect>[];
}

export interface IOngoingEffectFilters {
    type?: EffectName;
    source?: Card;
    value?: (value: any) => boolean;
}

// TODO: Rename to TargetableGameObject? Or something to imply this is a object with effects (as opposed to an Ability).
@registerState()
export abstract class GameObject extends GameObjectBase {
    @undoArray(false)
    private accessor _ongoingEffects: OngoingCardEffect[] = [];

    @undoState()
    private accessor _name: string;

    public get name() {
        return this._name;
    }

    @undoState()
    public accessor id: string;

    public constructor(
        game: Game,
        name: string,
        id?: string
    ) {
        super(game);

        this.id = id ?? name;
        this._name = name;
    }

    public addOngoingEffect(ongoingEffect: OngoingCardEffect) {
        this._ongoingEffects.push(ongoingEffect);
    }

    public removeOngoingEffect(ongoingEffect: OngoingCardEffect) {
        this._ongoingEffects = this._ongoingEffects.filter((e) => e.uuid !== ongoingEffect.uuid);
    }

    public removeOngoingEffects(type: EffectName) {
        this._ongoingEffects = this._ongoingEffects.filter((e) => e.type !== type);
    }

    public getOngoingEffectValues<V = any>(type: EffectName): V[] {
        const effects = this._ongoingEffects;
        const result: V[] = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < effects.length; i++) {
            // This call will want to be swapped out when the decorator is in place
            const effect = effects[i];
            if (effect.type === type) {
                result.push(effect.getValue(this));
            }
        }
        return result;
    }

    public getOngoingEffectSources(type: EffectName): Card[] {
        const effects = this._ongoingEffects;
        const result: Card[] = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < effects.length; i++) {
            // This call will want to be swapped out when the decorator is in place
            const effect = effects[i];
            if (effect.type === type) {
                result.push(effect.context.source);
            }
        }
        return result;
    }

    public hasOngoingEffect(type: EffectName): boolean {
        const effects = this._ongoingEffects;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < effects.length; i++) {
            const effect = effects[i];
            // This call will want to be swapped out when the decorator is in place
            if (effect.type === type) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns true if the card has any ability restriction matching the given name. Restriction names
     * can be a value of {@link AbilityRestriction} or an arbitrary string such as a card name.
     */
    public hasRestriction(actionType: (AbilityRestriction | EffectName) | (AbilityRestriction | EffectName)[], context?: AbilityContext) {
        return this.getOngoingEffectValues<Restriction>(EffectName.AbilityRestrictions)
            .some((restriction) => restriction.isMatch(actionType, context));
    }

    /**
     * Returns true if the card has any ability restriction matching the given name. Restriction names
     * can be a value of {@link AbilityRestriction} or an arbitrary string such as a card name.
     */
    public getMatchingRestrictions(actionType: (AbilityRestriction | EffectName) | (AbilityRestriction | EffectName)[], context?: AbilityContext) {
        return this.getOngoingEffectValues<Restriction>(EffectName.AbilityRestrictions)
            .filter((restriction) => restriction.isMatch(actionType, context));
    }

    public getShortSummary() {
        return {
            id: this.id,
            name: this.name,
            uuid: this.uuid
        };
    }

    public canBeTargeted(context: AbilityContext, selectedCards: GameObject | GameObject[] = []) {
        if (this.hasRestriction(AbilityRestriction.AbilityTarget, context)) {
            return false;
        }
        let targets = selectedCards;
        if (!Array.isArray(targets)) {
            targets = [targets];
        }

        targets = targets.concat(this);
        // let targetingCost = context.player.getTargetingCost(context.source, targets);

        if (context.stage === Stage.PreTarget || context.stage === Stage.Cost) {
            // We haven't paid the cost yet, so figure out what it will cost to play this so we can know how much fate we'll have available for targeting
            let resourceCost = 0;
            // @ts-expect-error
            if (context.ability.getAdjustedCost) {
                // we only want to consider the ability cost, not the card cost
                // @ts-expect-error
                resourceCost = context.ability.getAdjustedCost(context);
            }

            // return (context.player.readyResourceCount >= targetingCost);
        } else if (context.stage === Stage.Target || context.stage === Stage.Effect) {
            // We paid costs first, or targeting has to be done after costs have been paid
            // return (context.player.readyResourceCount >= targetingCost);
        }

        return true;
    }

    public getShortSummaryForControls(activePlayer: Player): any {
        return this.getShortSummary();
    }

    public mostRecentOngoingEffect(type: EffectName) {
        const effects = this.getOngoingEffectValues(type);
        return effects[effects.length - 1];
    }

    protected getOngoingEffects(): readonly OngoingCardEffect[] {
        // Curently this still derefs the entire array of ongoing effects from the gamestate manager
        return this._ongoingEffects;
    }

    public isPlayer(): this is Player {
        return false;
    }

    public isCard(): this is Card {
        return false;
    }
}

