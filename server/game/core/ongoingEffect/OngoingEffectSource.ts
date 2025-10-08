import type { IGameObjectState } from '../GameObject';
import { GameObject } from '../GameObject.js';
import * as Helpers from '../utils/Helpers.js';
import { Duration, WildcardZoneName } from '../Constants.js';
import type { OngoingEffect } from './OngoingEffect';
import type Game from '../Game';
import type { IOngoingEffectFactory } from '../../Interfaces';
import { registerState } from '../GameObjectUtils';

// This class is inherited by Card and also represents Framework effects

// Here mostly as a placeholder.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IOngoingEffectSourceState extends IGameObjectState { }

@registerState()
export class OngoingEffectSource<T extends IOngoingEffectSourceState = IOngoingEffectSourceState> extends GameObject<T> {
    public constructor(game: Game, name = 'Framework effect') {
        super(game, name);
    }

    /**
     * Applies an effect which persists.
     */
    public persistent(propertyFactory: () => IOngoingEffectFactory<this>) {
        const properties = propertyFactory();
        this.addEffectToEngine(Object.assign({ duration: Duration.Persistent, zoneFilter: WildcardZoneName.Any }, properties));
    }

    /**
     * Applies an effect which lasts until the end of the attack.
     */
    public untilEndOfAttack(propertyFactory: () => IOngoingEffectFactory<this>) {
        const properties = propertyFactory();
        this.addEffectToEngine(Object.assign({ duration: Duration.UntilEndOfAttack, zoneFilter: WildcardZoneName.Any }, properties));
    }

    /**
     * Applies an effect which lasts until the end of the phase.
     */
    public untilEndOfPhase(propertyFactory: () => IOngoingEffectFactory<this>) {
        const properties = propertyFactory();
        this.addEffectToEngine(Object.assign({ duration: Duration.UntilEndOfPhase, zoneFilter: WildcardZoneName.Any }, properties));
    }

    /**
     * Applies an effect which lasts until the end of the round.
     */
    public untilEndOfRound(propertyFactory: () => IOngoingEffectFactory<this>) {
        const properties = propertyFactory();
        this.addEffectToEngine(Object.assign({ duration: Duration.UntilEndOfRound, zoneFilter: WildcardZoneName.Any }, properties));
    }

    /**
     * Applies an effect which lasts while the source card of the effect is in play.
     */
    public whileSourceInPlay(propertyFactory: () => IOngoingEffectFactory<this>) {
        const properties = propertyFactory();
        this.addEffectToEngine(Object.assign({ duration: Duration.WhileSourceInPlay, zoneFilter: WildcardZoneName.Any }, properties));
    }


    /**
     * Applies a 'lasting effect' (SWU 7.7.3) which lasts until an event contained in the `until` property for the effect has occurred.
     */
    public lastingEffect(propertyFactory: () => IOngoingEffectFactory<this>) {
        const properties = propertyFactory();
        this.addEffectToEngine(Object.assign({ duration: Duration.Custom, zoneFilter: WildcardZoneName.Any }, properties));
    }

    /**
     * Adds persistent/lasting/delayed effect(s) to the effect engine
     * @param {Object} properties properties for the effect(s), see {@link OngoingEffect}
     * @returns the effect(s) that were added to the engine
     */
    public addEffectToEngine(properties: IOngoingEffectFactory<this>): OngoingEffect<this>[] {
        const { ongoingEffect, ...propertiesWithoutEffect } = properties;

        if (Array.isArray(ongoingEffect)) {
            return ongoingEffect.map((factory) => this.game.ongoingEffectEngine.add(factory(this.game, this, propertiesWithoutEffect)));
        }
        return [this.game.ongoingEffectEngine.add(ongoingEffect(this.game, this, propertiesWithoutEffect))];
    }

    public removeEffectFromEngine(effects: OngoingEffect | OngoingEffect[]) {
        this.game.ongoingEffectEngine.unapplyAndRemove((effect) => Helpers.asArray(effects).includes(effect));
    }

    public removeLastingEffects() {
        this.game.ongoingEffectEngine.removeLastingEffects(this);
    }
}
