const AbilityHelper = require('../../AbilityHelper');
const { GameObject } = require('../GameObject.js');

const { Duration, WildcardLocation } = require('../Constants.js');
const OngoingEffect = require('./OngoingEffect.js');
const Contract = require('../utils/Contract.js');

// This class is inherited by Card and also represents Framework effects

class OngoingEffectSource extends GameObject {
    constructor(game, name = 'Framework effect') {
        super(game, name);
    }

    /**
     * Applies an effect which lasts until the end of the action.
     */
    untilEndOfAction(propertyFactory) {
        var properties = propertyFactory(AbilityHelper);
        this.addEffectToEngine(Object.assign({ duration: Duration.UntilEndOfAction, locationFilter: WildcardLocation.Any }, properties));
    }

    /**
     * Applies an effect which lasts until the end of the phase.
     */
    untilEndOfPhase(propertyFactory) {
        var properties = propertyFactory(AbilityHelper);
        this.addEffectToEngine(Object.assign({ duration: Duration.UntilEndOfPhase, locationFilter: WildcardLocation.Any }, properties));
    }

    /**
     * Applies an effect which lasts until the end of the round.
     */
    untilEndOfRound(propertyFactory) {
        var properties = propertyFactory(AbilityHelper);
        this.addEffectToEngine(Object.assign({ duration: Duration.UntilEndOfRound, locationFilter: WildcardLocation.Any }, properties));
    }

    /**
     * Applies a 'lasting effect' (SWU 7.7.3) which lasts until an event contained in the `until` property for the effect has occurred.
     */
    lastingEffect(propertyFactory) {
        let properties = propertyFactory(AbilityHelper);
        this.addEffectToEngine(Object.assign({ duration: Duration.Custom, locationFilter: WildcardLocation.Any }, properties));
    }

    /**
     * Adds persistent/lasting/delayed effect(s) to the effect engine
     * @param {Object} properties properties for the effect(s), see {@link OngoingEffect}
     * @returns {OngoingEffect[]} the effect(s) that were added to the engine
     */
    addEffectToEngine(properties) {
        let ongoingEffect = properties.ongoingEffect;

        let propertiesWithoutEffect;
        {
            let { ongoingEffect, ...remainingProperties } = properties;
            propertiesWithoutEffect = remainingProperties;
        }

        if (Array.isArray(ongoingEffect)) {
            return ongoingEffect.map((factory) => this.game.ongoingEffectEngine.add(factory(this.game, this, propertiesWithoutEffect)));
        }
        return [this.game.ongoingEffectEngine.add(ongoingEffect(this.game, this, propertiesWithoutEffect))];
    }

    removeEffectFromEngine(effectArray) {
        this.game.ongoingEffectEngine.unapplyAndRemove((effect) => effectArray.includes(effect));
    }

    removeLastingEffects() {
        this.game.ongoingEffectEngine.removeLastingEffects(this);
    }
}

module.exports = OngoingEffectSource;
