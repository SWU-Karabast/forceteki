import { v1 as uuidV1 } from 'uuid';

import type { AbilityContext } from './AbilityContext';
import { EffectNames, Stages } from './Constants';
import type { CardEffect } from './effects/types';
import type Game from './game';
import type { GameAction } from './gameActions/GameAction';
import * as GameActions from './gameActions/GameActions';
import type Player from './player';

export class GameObject {
    public uuid = uuidV1();
    protected id: string;
    protected printedType = '';
    private effects = [] as CardEffect[];

    public constructor(
        public game: Game,
        public name: string
    ) {
        this.id = name;
    }

    public get type() {
        return this.getType();
    }

    public addEffect(effect: CardEffect) {
        this.effects.push(effect);
    }

    public removeEffect(effect: CardEffect) {
        this.effects = this.effects.filter((e) => e !== effect);
    }

    public getEffects<V = any>(type: EffectNames): V[] {
        let filteredEffects = this.getRawEffects().filter((effect) => effect.type === type);
        return filteredEffects.map((effect) => effect.getValue(this));
    }

    public sumEffects(type: EffectNames) {
        let filteredEffects = this.getEffects(type);
        return filteredEffects.reduce((total, effect) => total + effect, 0);
    }

    public anyEffect(type: EffectNames) {
        return this.getEffects(type).length > 0;
    }

    public allowGameAction(actionType: string, context = this.game.getFrameworkContext()) {
        const gameActionFactory = GameActions[actionType];
        if (gameActionFactory) {
            const gameAction: GameAction = gameActionFactory();
            return gameAction.canAffect(this, context);
        }
        return this.checkRestrictions(actionType, context);
    }

    public checkRestrictions(actionType: string, context?: AbilityContext) {
        return !this.getEffects(EffectNames.AbilityRestrictions).some((restriction) =>
            restriction.isMatch(actionType, context, this)
        );
    }

    public isUnique() {
        return false;
    }

    public getType() {
        if (this.anyEffect(EffectNames.ChangeType)) {
            return this.mostRecentEffect(EffectNames.ChangeType);
        }
        return this.printedType;
    }

    public hasKeyword() {
        return false;
    }

    public hasTrait() {
        return false;
    }

    public getTraits() {
        return [];
    }

    public hasAspect() {
        return false;
    }

    public getAspects() {
        return [];
    }

    public hasToken() {
        return false;
    }

    public getShortSummary() {
        return {
            id: this.id,
            label: this.name,
            name: this.name,
            type: this.getType(),
            uuid: this.uuid
        };
    }

    // public canBeTargeted(context: AbilityContext, selectedCards: GameObject | GameObject[] = []) {
    //     if (!this.checkRestrictions('target', context)) {
    //         return false;
    //     }
    //     let targets = selectedCards;
    //     if (!Array.isArray(targets)) {
    //         targets = [targets];
    //     }

    //     targets = targets.concat(this);
    //     let targetingCost = context.player.getTargetingCost(context.source, targets);

    //     if (context.stage === Stages.PreTarget || context.stage === Stages.Cost) {
    //         //We haven't paid the cost yet, so figure out what it will cost to play this so we can know how much fate we'll have available for targeting
    //         let resourceCost = 0;
    //         // @ts-ignore
    //         if (context.ability.getReducedCost) {
    //             //we only want to consider the ability cost, not the card cost
    //             // @ts-ignore
    //             resourceCost = context.ability.getReducedCost(context);
    //         }

    //         return (context.player.countSpendableResources() >= targetingCost);
    //     } else if (context.stage === Stages.Target || context.stage === Stages.Effect) {
    //         //We paid costs first, or targeting has to be done after costs have been paid
    //         return (context.player.countSpendableResources() >= targetingCost);
    //     }

    //     return true;
    // }

    public getShortSummaryForControls(activePlayer: Player) {
        return this.getShortSummary();
    }

    public mostRecentEffect(type: EffectNames) {
        const effects = this.getEffects(type);
        return effects[effects.length - 1];
    }

    protected getRawEffects() {
        const suppressEffects = this.effects.filter((effect) => effect.type === EffectNames.SuppressEffects);
        const suppressedEffects = suppressEffects.reduce((array, effect) => array.concat(effect.getValue(this)), []);
        return this.effects.filter((effect) => !suppressedEffects.includes(effect));
    }
}