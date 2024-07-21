const { EffectValue } = require('./EffectValue');
const GainAbility = require('./GainAbility');
const { AbilityTypes } = require('../Constants');

// This ignores persistent effects since it's used by Shosuro Deceiver who only takes triggered abilities
class GainAllAbilitiesDynamic extends EffectValue {
    constructor(match) {
        super(match);
        this.match = match;
        this.createdAbilities = {};
        this.abilitiesForTargets = {};
    }

    _setAbilities(cards, target) {
        if (!Array.isArray(cards)) {
            cards = [cards];
        }

        this.actions = [];
        this.reactions = [];
        this.persistentEffects = [];
        cards.forEach((card) => {
            card._getActions(true)
                .filter((a) => a.isTriggeredAbility() && (!card.isBlank() || !a.printedAbility))
                .forEach((action) => this.actions.push(this.getAbility(AbilityTypes.Action, action, target)));
            card._getReactions(true)
                .filter((a) => a.isTriggeredAbility() && (!card.isBlank() || !a.printedAbility))
                .forEach((ability) => {
                    this.reactions.push(this.getAbility(ability.abilityType, ability, target));
                });
        });
    }

    getAbilityIdentifier(ability) {
        return `${ability.abilityIdentifier}-${ability.card.uuid}`;
    }

    getAbility(abilityType, ability, target) {
        const id = this.getAbilityIdentifier(ability);
        if (!this.createdAbilities[id]) {
            const res = new GainAbility(abilityType, ability);
            this.createdAbilities[id] = res;
            this.createdAbilities[id].apply(target);
        }
        return this.createdAbilities[id];
    }

    calculate(target, context) {
        let cards = [];
        if (typeof this.match === 'function') {
            cards = this.match(target, context);
        } else {
            cards = this.match;
        }

        this.unapply(target);
        this._setAbilities(cards, target);
        this.abilitiesForTargets[target.uuid] = {
            actions: this.actions.map((value) => {
                return value.getValue();
            }),
            reactions: this.reactions.map((value) => {
                return value.getValue();
            })
        };
        this._applyAbilities(target);
    }

    _applyAbilities(target) {
        if (this.abilitiesForTargets[target.uuid]) {
            for (const value of this.abilitiesForTargets[target.uuid].reactions) {
                value.registerEvents();
            }
        }
    }

    _unapplyAbilities(target) {
        this.unapply(target);
    }

    unapply(target) {
        if (this.abilitiesForTargets[target.uuid]) {
            for (const value of this.abilitiesForTargets[target.uuid].reactions) {
                value.unregisterEvents();
            }
        }
    }

    getActions(target) {
        if (this.abilitiesForTargets[target.uuid]) {
            return this.abilitiesForTargets[target.uuid].actions;
        }
        return [];
    }

    getReactions(target) {
        if (this.abilitiesForTargets[target.uuid]) {
            return this.abilitiesForTargets[target.uuid].reactions;
        }
        return [];
    }

    getPersistentEffects() {
        return this.persistentEffects;
    }
}

module.exports = GainAllAbilitiesDynamic;
