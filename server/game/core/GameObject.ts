
import type { AbilityContext } from './ability/AbilityContext';
import { AbilityRestriction, EffectName, Stage } from './Constants';
import type { IOngoingCardEffect } from './ongoingEffect/IOngoingCardEffect';
import type Game from './Game';
import type Player from './Player';
import type { Card } from './card/Card';
import type { IGameObjectBaseState } from './GameObjectBase';
import { GameObjectBase } from './GameObjectBase';

export interface IGameObjectState extends IGameObjectBaseState {
    id: string;
    nameField: string;
}

// TODO: Rename to TargetableGameObject? Or something to imply this is a object with effects (as opposed to an Ability).
export abstract class GameObject<T extends IGameObjectState = IGameObjectState> extends GameObjectBase<T> {
    private ongoingEffects = [] as IOngoingCardEffect[];

    public get name() {
        return this.state.nameField;
    }

    public get id() {
        return this.state.id;
    }

    public set id(value) {
        this.state.id = value;
    }

    public constructor(
        game: Game,
        name: string,
        id?: string
    ) {
        super(game);

        this.state.id = id ?? name;
        this.state.nameField = name;
    }

    public addOngoingEffect(ongoingEffect: IOngoingCardEffect) {
        this.ongoingEffects.push(ongoingEffect);
    }

    public removeOngoingEffect(ongoingEffect: IOngoingCardEffect) {
        this.ongoingEffects = this.ongoingEffects.filter((e) => e !== ongoingEffect);
    }

    public removeOngoingEffects(type: EffectName) {
        this.ongoingEffects = this.ongoingEffects.filter((e) => e.type !== type);
    }

    public getOngoingEffectValues<V = any>(type: EffectName): V[] {
        const filteredEffects = this.getOngoingEffects().filter((ongoingEffect) => ongoingEffect.type === type);
        return filteredEffects.map((ongoingEffect) => ongoingEffect.getValue(this));
    }

    public hasOngoingEffect(type: EffectName) {
        return this.getOngoingEffectValues(type).length > 0;
    }

    /**
     * Returns true if the card has any ability restriction matching the given name. Restriction names
     * can be a value of {@link AbilityRestriction} or an arbitrary string such as a card name.
     */
    public hasRestriction(actionType: string, context?: AbilityContext) {
        return this.getOngoingEffectValues(EffectName.AbilityRestrictions).some((restriction) =>
            restriction.isMatch(actionType, context, this)
        );
    }

    public getShortSummary() {
        return {
            id: this.id,
            label: this.name,
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

    protected getOngoingEffects() {
        const suppressEffects = this.ongoingEffects.filter((ongoingEffect) => ongoingEffect.type === EffectName.SuppressEffects);
        const suppressedEffects = suppressEffects.reduce((array, ongoingEffect) => array.concat(ongoingEffect.getValue(this)), []);
        return this.ongoingEffects.filter((ongoingEffect) => !suppressedEffects.includes(ongoingEffect));
    }

    public isPlayer(): this is Player {
        return false;
    }

    public isCard(): this is Card {
        return false;
    }
}
