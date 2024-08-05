const _ = require('underscore');

const AbilityDsl = require('../../AbilityDsl.js');
const { GameObject } = require('../GameObject.js');

const { Durations, WildcardLocations } = require('../Constants.js');

// This class is inherited by Ring and BaseCard and also represents Framework effects

class EffectSource extends GameObject {
    constructor(game, name = 'Framework effect') {
        super(game, name);
    }

    // /**
    //  * Applies an immediate effect which lasts until the end of the phase.
    //  */
    // untilEndOfPhase(propertyFactory) {
    //     var properties = propertyFactory(AbilityDsl);
    //     this.addEffectToEngine(Object.assign({ duration: Durations.UntilEndOfPhase, location: WildcardLocations.Any }, properties));
    // }

    // /**
    //  * Applies an immediate effect which lasts until the end of the round.
    //  */
    // untilEndOfRound(propertyFactory) {
    //     var properties = propertyFactory(AbilityDsl);
    //     this.addEffectToEngine(Object.assign({ duration: Durations.UntilEndOfRound, location: WildcardLocations.Any }, properties));
    // }

    // /**
    //  * Applies a lasting effect which lasts until an event contained in the
    //  * `until` property for the effect has occurred.
    //  */
    // lastingEffect(propertyFactory) {
    //     let properties = propertyFactory(AbilityDsl);
    //     this.addEffectToEngine(Object.assign({ duration: Durations.Custom, location: WildcardLocations.Any }, properties));
    // }

    // /*
    //  * Adds a persistent/lasting/delayed effect to the effect engine
    //  * @param {Object} properties - properties for the effect - see Effects/Effect.js
    //  */
    // addEffectToEngine(properties) {
    //     let effect = properties.effect;
    //     properties = _.omit(properties, 'effect');
    //     if(Array.isArray(effect)) {
    //         return effect.map(factory => this.game.effectEngine.add(factory(this.game, this, properties)));
    //     }
    //     return [this.game.effectEngine.add(effect(this.game, this, properties))];
    // }

    // removeEffectFromEngine(effectArray) {
    //     this.game.effectEngine.unapplyAndRemove(effect => effectArray.includes(effect));
    // }

    // removeLastingEffects() {
    //     this.game.effectEngine.removeLastingEffects(this);
    // }
}

module.exports = EffectSource;
