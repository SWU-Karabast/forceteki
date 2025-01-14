import { v4 as uuidv4 } from 'uuid';
import type { AbilityContext } from './ability/AbilityContext';
import { AbilityRestriction, EffectName, Stage } from './Constants';
import type { IOngoingCardEffect } from './ongoingEffect/IOngoingCardEffect';
import type Game from './Game';
import type Player from './Player';
import type { Card } from './card/Card';

export interface IGameObjectState {
    id: string;
    uuid: any;
    nameField: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
export interface GameObjectRef<T extends GameObject = GameObject> {
    uuid: any;
    id: string;
}

export abstract class GameObject<T extends IGameObjectState = IGameObjectState> {
    public get uuid() {
        return this.state.uuid;
    }

    public get id() {
        return this.state.id;
    }

    private ongoingEffects = [] as IOngoingCardEffect[];
    protected state: T;

    public get name() {
        return this.state.nameField;
    }

    public constructor(
        public game: Game,
        name: string,
        uuid?: any
    ) {
        // @ts-expect-error state is a generic object that is defined by the deriving classes, it's essentially w/e the children want it to be.
        this.state = {};
        this.state.id = name;
        this.state.nameField = name;
        if (!uuid) {
            this.state.uuid = uuidv4();
        } else {
            // If we have uuid, that means it's old UUID is being restored (useful if we wanted to rebuild a match from the ground up, rather than updating game objects to a previous state)
            this.state.uuid = uuid;
        }
        // STATE ISSUE: This has an initial issue because in theory the derived constructors could still affect the state, overriding this.
        //              So, logically, we'd need to call the setState *after* the object was fully instantiated and let the default setup happen unhindered.
        // else {
        //     this.setState(storedState);
        // }
        this.onSetupDefaultState();
        // TODO: Does this actually work like I think it does?
        this.game.registerGameObject(this);
    }

    /** A overridable method so a child can set defaults for it's state. Always ensure to call super.onSetupGameState() as the first line if you do override this.  */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected onSetupDefaultState() { }

    public addOngoingEffect(ongoingEffect: IOngoingCardEffect) {
        this.ongoingEffects.push(ongoingEffect);
    }

    public removeOngoingEffect(ongoingEffect: IOngoingCardEffect) {
        this.ongoingEffects = this.ongoingEffects.filter((e) => e !== ongoingEffect);
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
            id: this.state.id,
            label: this.name,
            name: this.name,
            uuid: this.uuid
        };
    }

    public setState(state: T) {
        this.state = state;
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

    public getRef<T extends GameObject = this>(): GameObjectRef<T> {
        return { uuid: this.state.uuid, id: this.state.id };
    }
}
