import { v1 as uuidV1 } from 'uuid';

import type { AbilityContext } from './ability/AbilityContext';
import { AbilityRestriction, EffectName, Stage } from './Constants';
import type { IOngoingCardEffect } from './ongoingEffect/IOngoingCardEffect';
import type Game from './Game';
import type { GameSystem } from './gameSystem/GameSystem';
import * as GameSystems from '../gameSystems/GameSystemLibrary';
import type Player from './Player';

export abstract class GameObject {
    public uuid = uuidV1();
    protected id: string;
    private effects = [] as IOngoingCardEffect[];
    private nameField: string;

    public get name() {
        return this.nameField;
    }

    public constructor(
        public game: Game,
        name: string
    ) {
        this.id = name;
        this.nameField = name;
    }

    public addEffect(effect: IOngoingCardEffect) {
        this.effects.push(effect);
    }

    public removeEffect(effect: IOngoingCardEffect) {
        this.effects = this.effects.filter((e) => e !== effect);
    }

    public getEffectValues<V = any>(type: EffectName): V[] {
        const filteredEffects = this.getEffects().filter((effect) => effect.type === type);
        return filteredEffects.map((effect) => effect.getValue(this));
    }

    public sumEffects(type: EffectName) {
        const filteredEffects = this.getEffectValues(type);
        return filteredEffects.reduce((total, effect) => total + effect, 0);
    }

    public hasEffect(type: EffectName) {
        return this.getEffectValues(type).length > 0;
    }

    public allowGameAction(actionType: string, context = this.game.getFrameworkContext()) {
        const gameActionFactory = GameSystems[actionType];
        if (gameActionFactory) {
            const gameSystem: GameSystem = gameActionFactory();
            return gameSystem.canAffect(this, context);
        }
        return !this.hasRestriction(actionType, context);
    }

    /**
     * Returns true if the card has any ability restriction matching the given name. Restriction names
     * can be a value of {@link AbilityRestriction} or an arbitrary string such as a card name.
     */
    public hasRestriction(actionType: string, context?: AbilityContext) {
        return this.getEffectValues(EffectName.AbilityRestrictions).some((restriction) =>
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
        if (this.hasRestriction(AbilityRestriction.Target, context)) {
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
        } else if (context.stage === Stage.Target || context.stage === Stage.EffectTmp) {
            //We paid costs first, or targeting has to be done after costs have been paid
            // return (context.player.countSpendableResources() >= targetingCost);
        }

        return true;
    }

    public getShortSummaryForControls(activePlayer: Player): any {
        return this.getShortSummary();
    }

    public mostRecentEffect(type: EffectName) {
        const effects = this.getEffectValues(type);
        return effects[effects.length - 1];
    }

    protected getEffects() {
        const suppressEffects = this.effects.filter((effect) => effect.type === EffectName.SuppressEffects);
        const suppressedEffects = suppressEffects.reduce((array, effect) => array.concat(effect.getValue(this)), []);
        return this.effects.filter((effect) => !suppressedEffects.includes(effect));
    }
}
