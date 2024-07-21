import type BaseCard from '../../basecard';
import { AbilityTypes, Locations, CardTypes, EffectNames } from '../../Constants';
import { EffectBuilder } from '../EffectBuilder';
import { EffectValue } from '../EffectValue';
import GainAbility from '../GainAbility';

class CopyCard extends EffectValue<BaseCard> {
    actions: Array<GainAbility>;
    reactions: Array<GainAbility>;
    persistentEffects: Array<any>;
    abilitiesForTargets = new WeakMap<
        BaseCard,
        {
            actions: Array<GainAbility>;
            reactions: Array<GainAbility>;
        }
    >();

    constructor(card: BaseCard) {
        super(card);
        this.actions = card.abilities.actions.map((action) => new GainAbility(AbilityTypes.Action, action));
        this.reactions = card.abilities.reactions.map((ability) => new GainAbility(ability.abilityType, ability));
        this.persistentEffects = card.abilities.persistentEffects.map((effect) => Object.assign({}, effect));
    }

    apply(target: BaseCard) {
        this.abilitiesForTargets.set(target, {
            actions: this.actions.map((value) => {
                value.apply(target);
                return value.getValue();
            }),
            reactions: this.reactions.map((value) => {
                value.apply(target);
                return value.getValue();
            })
        });
        for (const effect of this.persistentEffects) {
            if (
                effect.location === Locations.Any ||
                (target.getType() === CardTypes.Character && effect.location === Locations.PlayArea) ||
                (target.getType() === CardTypes.Holding && effect.location === Locations.Provinces)
            ) {
                effect.ref = target.addEffectToEngine(effect);
            }
        }
    }

    unapply(target: BaseCard) {
        for (const value of this.getReactions(target)) {
            // @ts-ignore
            value.unregisterEvents();
        }
        for (const effect of this.persistentEffects) {
            if (effect.ref) {
                target.removeEffectFromEngine(effect.ref);
                delete effect.ref;
            }
        }
        this.abilitiesForTargets.delete(target);
    }

    getActions(target: BaseCard) {
        return this.abilitiesForTargets.get(target)?.actions ?? [];
    }

    getReactions(target: BaseCard) {
        return this.abilitiesForTargets.get(target)?.reactions ?? [];
    }

    getPersistentEffects() {
        return this.persistentEffects;
    }
}

export function copyCard(character: BaseCard) {
    return EffectBuilder.card.static(EffectNames.CopyCharacter, new CopyCard(character));
}
