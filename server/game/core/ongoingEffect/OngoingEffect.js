const { Location, Duration, WildcardLocation } = require('../Constants');
const EnumHelpers = require('../utils/EnumHelpers');

/**
 * Represents a card based effect applied to one or more targets.
 *
 * Properties:
 * matchTarget          - function that takes a card/player and context object
 *                        and returns a boolean about whether the passed object should
 *                        have the effect applied. Alternatively, a card/player can
 *                        be passed as the match property to match that single object.
 *                        Doesn't apply to attack effects. (TODO: still true?)
 * duration             - string representing how long the effect lasts.
 * condition            - function that returns a boolean determining whether the
 *                        effect can be applied. Use with cards that have a
 *                        condition that must be met before applying a persistent
 *                        effect (e.g. 'when exhausted').
 * locationFilter       - location where the source of this effect needs to be for
 *                        the effect to be active. Defaults to 'play area'.
 * targetController     - string that determines which player's cards are targeted.
 *                        Can be 'self' (default), 'opponent' or 'any'. For player
 *                        effects it determines which player(s) are affected.
 * targetLocationFilter - string that determines the location of cards that can be
 *                        applied by the effect. Can be 'play area' (default),
 *                        'province', or a specific location (e.g. 'stronghold province'
 *                        or 'hand'). This has no effect if a specific card is passed
 *                        to match.  Card effects only.
 * impl                 - object with details of effect to be applied. Includes duration
 *                        and the numerical value of the effect, if any.
 */
class OngoingEffect {
    constructor(game, source, properties, effectImpl) {
        this.game = game;
        this.source = source;
        this.matchTarget = properties.matchTarget || (() => true);
        this.duration = properties.duration;
        this.until = properties.until || {};
        this.condition = properties.condition || (() => true);
        this.sourceLocationFilter = properties.sourceLocationFilter || WildcardLocation.AnyArena;
        this.canChangeZoneOnce = !!properties.canChangeZoneOnce;
        this.canChangeZoneNTimes = properties.canChangeZoneNTimes || 0;
        this.impl = effectImpl;
        this.ability = properties;
        this.targets = [];
        this.refreshContext();
        this.impl.duration = this.duration;
        this.impl.isConditional = !!properties.condition;
    }

    refreshContext() {
        this.context = this.game.getFrameworkContext(this.source.controller);
        this.context.source = this.source;
        this.context.ability = this.ability;
        this.impl.setContext(this.context);
    }

    isValidTarget(target) {
        return true;
    }

    getDefaultTarget(context) {
        return null;
    }

    getTargets() {
        return [];
    }

    addTarget(target) {
        this.targets.push(target);
        this.impl.apply(target);
    }

    removeTarget(target) {
        this.removeTargets([target]);
    }

    removeTargets(targets) {
        targets.forEach((target) => this.impl.unapply(target));
        this.targets = this.targets.filter((target) => !targets.includes(target));
    }

    hasTarget(target) {
        return this.targets.includes(target);
    }

    cancel() {
        this.targets.forEach((target) => this.impl.unapply(target));
        this.targets = [];
    }

    isEffectActive() {
        if (this.duration !== Duration.Persistent) {
            return true;
        }

        // disable ongoing effects if the card is queued up to be defeated (e.g. due to combat or unique rule)
        if ((this.source.isUnit() || this.source.isUpgrade()) && this.source.isInPlay() && this.source.pendingDefeat) {
            return false;
        }

        if (!this.source.getConstantAbilities().some((effect) => effect.registeredEffects && effect.registeredEffects.includes(this))) {
            return false;
        }

        return !this.source.facedown;
    }

    resolveEffectTargets(stateChanged) {
        if (!this.condition(this.context) || !this.isEffectActive()) {
            stateChanged = this.targets.length > 0 || stateChanged;
            this.cancel();
            return stateChanged;
        } else if (typeof this.matchTarget === 'function') {
            // Get any targets which are no longer valid
            let invalidTargets = this.targets.filter((target) => !this.matchTarget(target, this.context) || !this.isValidTarget(target));
            // Remove invalid targets
            this.removeTargets(invalidTargets);
            stateChanged = stateChanged || invalidTargets.length > 0;
            // Recalculate the effect for valid targets
            this.targets.forEach((target) => stateChanged = this.impl.recalculate(target) || stateChanged);
            // Check for new targets
            let newTargets = this.getTargets().filter((target) => !this.targets.includes(target) && this.isValidTarget(target));
            // Apply the effect to new targets
            newTargets.forEach((target) => this.addTarget(target));
            return stateChanged || newTargets.length > 0;
        } else if (this.targets.includes(this.matchTarget)) {
            if (!this.isValidTarget(this.matchTarget)) {
                this.cancel();
                return true;
            }
            return this.impl.recalculate(this.matchTarget) || stateChanged;
        } else if (!this.targets.includes(this.matchTarget) && this.isValidTarget(this.matchTarget)) {
            this.addTarget(this.matchTarget);
            return true;
        }
        return stateChanged;
    }

    getDebugInfo() {
        return {
            source: this.source.name,
            targets: this.targets.map((target) => target.name).join(','),
            active: this.isEffectActive(),
            condition: this.condition(this.context),
            effect: this.impl.getDebugInfo()
        };
    }
}

module.exports = OngoingEffect;
