import { v1 as uuidV1 } from 'uuid';

import type { AbilityContext } from './ability/AbilityContext';
import { EffectName, Stage } from './Constants';
import type { ICardEffect } from './effect/ICardEffect';
import type Game from './Game';
import type { GameSystem } from './gameSystem/GameSystem';
import * as GameSystems from '../gameSystems/GameSystemLibrary';
import type Player from './Player';

export abstract class GameObject {
    public uuid = uuidV1();
    protected id: string;
    protected printedType = '';
    private effects = [] as ICardEffect[];
    private nameField: string;

    public constructor(
        public game: Game,
        name: string
    ) {
        this.id = name;
        this.nameField = name;
    }

    public get type() {
        return this.getType();
    }

    public get name() {
        return this.nameField;
    }

    public addEffect(effect: ICardEffect) {
        this.effects.push(effect);
    }

    public removeEffect(effect: ICardEffect) {
        this.effects = this.effects.filter((e) => e !== effect);
    }

    public getEffects<V = any>(type: EffectName): V[] {
        const filteredEffects = this.getRawEffects().filter((effect) => effect.type === type);
        return filteredEffects.map((effect) => effect.getValue(this));
    }

    public sumEffects(type: EffectName) {
        const filteredEffects = this.getEffects(type);
        return filteredEffects.reduce((total, effect) => total + effect, 0);
    }

    public anyEffect(type: EffectName) {
        return this.getEffects(type).length > 0;
    }

    public allowGameAction(actionType: string, context = this.game.getFrameworkContext()) {
        const gameActionFactory = GameSystems[actionType];
        if (gameActionFactory) {
            const gameSystem: GameSystem = gameActionFactory();
            return gameSystem.canAffect(this, context);
        }
        return this.checkRestrictions(actionType, context);
    }

    public checkRestrictions(actionType: string, context?: AbilityContext) {
        return !this.getEffects(EffectName.AbilityRestrictions).some((restriction) =>
            restriction.isMatch(actionType, context, this)
        );
    }

    public getType() {
        if (this.anyEffect(EffectName.ChangeType)) {
            return this.mostRecentEffect(EffectName.ChangeType);
        }
        return this.printedType;
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

    public canBeTargeted(context: AbilityContext, selectedCards: GameObject | GameObject[] = []) {
        if (!this.checkRestrictions('target', context)) {
            return false;
        }
        let targets = selectedCards;
        if (!Array.isArray(targets)) {
            targets = [targets];
        }

        targets = targets.concat(this);
        // let targetingCost = context.player.getTargetingCost(context.source, targets);

        if (context.stage === Stage.PreTarget || context.stage === Stage.Cost) {
            //We haven't paid the cost yet, so figure out what it will cost to play this so we can know how much fate we'll have available for targeting
            let resourceCost = 0;
            // @ts-expect-error
            if (context.ability.getReducedCost) {
                //we only want to consider the ability cost, not the card cost
                // @ts-expect-error
                resourceCost = context.ability.getReducedCost(context);
            }

            // return (context.player.countSpendableResources() >= targetingCost);
        } else if (context.stage === Stage.Target || context.stage === Stage.Effect) {
            //We paid costs first, or targeting has to be done after costs have been paid
            // return (context.player.countSpendableResources() >= targetingCost);
        }

        return true;
    }

    public getShortSummaryForControls(activePlayer: Player): any {
        return this.getShortSummary();
    }

    public mostRecentEffect(type: EffectName) {
        const effects = this.getEffects(type);
        return effects[effects.length - 1];
    }

    protected getRawEffects() {
        const suppressEffects = this.effects.filter((effect) => effect.type === EffectName.SuppressEffects);
        const suppressedEffects = suppressEffects.reduce((array, effect) => array.concat(effect.getValue(this)), []);
        return this.effects.filter((effect) => !suppressedEffects.includes(effect));
    }
}