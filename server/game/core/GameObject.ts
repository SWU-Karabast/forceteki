
import type { AbilityContext } from './ability/AbilityContext';
import { AbilityRestriction, EffectName, Stage } from './Constants';
import type Game from './Game';
import type { Player } from './Player';
import type { Card } from './card/Card';
import type { GameObjectRef, IGameObjectBaseState } from './GameObjectBase';
import { GameObjectBase } from './GameObjectBase';
import type { Restriction } from './ongoingEffect/effectImpl/Restriction';
import type { OngoingCardEffect } from './ongoingEffect/OngoingCardEffect';

export interface IGameObjectState extends IGameObjectBaseState {
    id: string;
    nameField: string;
    ongoingEffects: GameObjectRef<OngoingCardEffect>[];
}

// TODO: Rename to TargetableGameObject? Or something to imply this is a object with effects (as opposed to an Ability).
export abstract class GameObject<T extends IGameObjectState = IGameObjectState> extends GameObjectBase<T> {
    private get ongoingEffects(): readonly OngoingCardEffect[] {
        return this.state.ongoingEffects.map((x) => this.game.getFromRef(x));
    }

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

    protected override setupDefaultState() {
        super.setupDefaultState();
        this.state.ongoingEffects = [];
    }

    public addOngoingEffect(ongoingEffect: OngoingCardEffect) {
        this.state.ongoingEffects.push(ongoingEffect.getRef());
    }

    public removeOngoingEffect(ongoingEffect: OngoingCardEffect) {
        this.state.ongoingEffects = this.ongoingEffects.filter((e) => e.uuid !== ongoingEffect.uuid).map((x) => x.getRef());
    }

    public removeOngoingEffects(type: EffectName) {
        this.state.ongoingEffects = this.ongoingEffects.filter((e) => e.type !== type).map((x) => x.getRef());
    }

    public getOngoingEffectValues<V = any>(type: EffectName): V[] {
        const filteredEffects = this.getOngoingEffects().filter((ongoingEffect) => ongoingEffect.type === type);
        return filteredEffects.map((ongoingEffect) => ongoingEffect.getValue(this));
    }

    public getOngoingEffectSources(type: EffectName): Card[] {
        const filteredEffects = this.getOngoingEffects().filter((ongoingEffect) => ongoingEffect.type === type);
        return filteredEffects.map((ongoingEffect) => ongoingEffect.context.source);
    }

    public hasOngoingEffect(type: EffectName) {
        return this.getOngoingEffectValues(type).length > 0;
    }

    /**
     * Returns true if the card has any ability restriction matching the given name. Restriction names
     * can be a value of {@link AbilityRestriction} or an arbitrary string such as a card name.
     */
    public hasRestriction(actionType: string, context?: AbilityContext) {
        return this.getOngoingEffectValues<Restriction>(EffectName.AbilityRestrictions).some((restriction) =>
            restriction.isMatch(actionType, context)
        );
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
