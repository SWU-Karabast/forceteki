const { OngoingEffectValueWrapper } = require('./OngoingEffectValueWrapper');
const { AbilityType, Location, WildcardLocation } = require('../../Constants');
const EnumHelpers = require('../../utils/EnumHelpers');

class GainAbility extends OngoingEffectValueWrapper {
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
            this.properties = Object.assign({}, ability.properties, newProps);
        } else {
            this.properties = Object.assign({ printedAbility: false }, ability);
        }
        if (abilityType === AbilityType.Constant && !this.properties.location) {
            this.properties.location = WildcardLocation.AnyArena;
            this.properties.abilityType = AbilityType.Constant;
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

    /**
     * @override
     */
    reset() {
        this.grantedAbilityLimits = {};
    }

    /**
     * @override
     */
    apply(target) {
        let properties = Object.assign({ origin: this.context.source }, this.properties);
        if (this.abilityType === AbilityType.Constant) {
            this.value = properties;
            if (EnumHelpers.isArena(target.location)) {
                this.value.registeredEffects = [target.addEffectToEngine(this.value)];
            }
            return;
        } else if (this.abilityType === AbilityType.Action) {
            this.value = target.createActionAbility(properties);
        } else {
            this.value = target.createTriggeredAbility(properties);
            this.value.registerEvents();
        }
        if (!this.grantedAbilityLimits[target.uuid]) {
            this.grantedAbilityLimits[target.uuid] = this.value.limit;
        } else {
            this.value.limit = this.grantedAbilityLimits[target.uuid];
        }
        this.grantedAbilityLimits[target.uuid].currentUser = target.uuid;
    }

    /**
     * @override
     */
    unapply(target) {
        if (this.grantedAbilityLimits[target.uuid]) {
            this.grantedAbilityLimits[target.uuid].currentUser = null;
        }
        if (this.abilityType === AbilityType.Triggered) {
            this.value.unregisterEvents();
        } else if (this.abilityType === AbilityType.Constant && this.value.registeredEffects) {
            target.removeEffectFromEngine(this.value.registeredEffects[0]);
            delete this.value.registeredEffects;
        }
    }
}

module.exports = GainAbility;
