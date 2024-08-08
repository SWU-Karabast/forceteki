const { EffectValue } = require('./EffectValue');
const { AbilityType, Location, WildcardLocation } = require('../../Constants');

class GainAbility extends EffectValue {
    constructor(abilityType, ability) {
        super(true);
        this.abilityType = abilityType;
        if (ability.createCopies) {
            this.createCopies = true;
            this.forCopying = {};
            this.forCopying.abilityType = abilityType;
            this.forCopying.ability = ability;
        }
        this.grantedAbilityLimits = {};
        if (ability.properties) {
            let newProps = {
                printedAbility: false,
                abilityIdentifier: ability.abilityIdentifier,
                origin: ability.card
            };
            if (ability.properties.limit) {
                // If the copied ability has a limit, we need to create a new instantiation of it, with the same max and reset event
                newProps.limit = ability.properties.limit.clone();
            }
            if (ability.properties.max) {
                // Same for max
                newProps.max = ability.properties.max.clone();
            }
            this.properties = Object.assign({}, ability.properties, newProps);
        } else {
            this.properties = Object.assign({ printedAbility: false }, ability);
        }
        if (abilityType === AbilityType.Persistent && !this.properties.location) {
            this.properties.location = WildcardLocation.AnyArena;
            this.properties.abilityType = AbilityType.Persistent;
        }
    }

    getCopy() {
        if (this.createCopies) {
            const ability = new GainAbility(this.forCopying.abilityType, this.forCopying.ability);
            ability.context = this.context;
            return ability;
        }
        return this;
    }

    /** @override */
    reset() {
        this.grantedAbilityLimits = {};
    }

    // apply(target) {
    //     let properties = Object.assign({ origin: this.context.source }, this.properties);
    //     if (this.abilityType === AbilityType.Persistent) {
    //         const activeLocations = {
    //             'play area': [Location.PlayArea],
    //             province: this.context.game.getProvinceArray()
    //         };
    //         this.value = properties;
    //         if (activeLocations[this.value.location].includes(target.location)) {
    //             this.value.ref = target.addEffectToEngine(this.value);
    //         }
    //         return;
    //     } else if (this.abilityType === AbilityType.Action) {
    //         this.value = target.createAction(properties);
    //     } else {
    //         this.value = target.createTriggeredAbility(this.abilityType, properties);
    //         this.value.registerEvents();
    //     }
    //     if (!this.grantedAbilityLimits[target.uuid]) {
    //         this.grantedAbilityLimits[target.uuid] = this.value.limit;
    //     } else {
    //         this.value.limit = this.grantedAbilityLimits[target.uuid];
    //     }
    //     this.grantedAbilityLimits[target.uuid].currentUser = target.uuid;
    // }

    /** @override */
    unapply(target) {
        if (this.grantedAbilityLimits[target.uuid]) {
            this.grantedAbilityLimits[target.uuid].currentUser = null;
        }
        if (
            [
                AbilityType.ForcedInterrupt,
                AbilityType.ForcedReaction,
                AbilityType.Interrupt,
                AbilityType.Reaction,
                AbilityType.WouldInterrupt
            ].includes(this.abilityType)
        ) {
            this.value.unregisterEvents();
        } else if (this.abilityType === AbilityType.Persistent && this.value.ref) {
            target.removeEffectFromEngine(this.value.ref);
            delete this.value.ref;
        }
    }
}

module.exports = GainAbility;
