import type BaseCard from '../../basecard';
import { AbilityTypes, EffectNames, Locations } from '../../Constants';
import { EffectBuilder } from '../EffectBuilder';
import { EffectValue } from '../EffectValue';
import GainAbility from '../GainAbility';

export class GainAllAbilities extends EffectValue<BaseCard> {
    actions: Array<GainAbility>;
    reactions: Array<GainAbility>;
    persistentEffects: Array<any>;
    abilitiesForTargets: Record<string, undefined | { actions: Array<GainAbility>; reactions: Array<GainAbility> }>;

    constructor(card: BaseCard) {
        super(card);
        this.actions = card.abilities.actions.map((action) => new GainAbility(AbilityTypes.Action, action));
        //Need to ignore keyword reactions or we double up on the pride / courtesy / sincerity triggers
        this.reactions = card.abilities.reactions
            .filter((a) => !a.isKeywordAbility())
            .map((ability) => new GainAbility(ability.abilityType, ability));
        this.persistentEffects = card.abilities.persistentEffects.map((effect) => Object.assign({}, effect));
        this.abilitiesForTargets = {};
    }

    apply(target: BaseCard) {
        this.abilitiesForTargets[target.uuid] = {
            actions: this.actions.map((value) => {
                value.apply(target);
                return value.getValue();
            }),
            reactions: this.reactions.map((value) => {
                value.apply(target);
                return value.getValue();
            })
        };
        for (const effect of this.persistentEffects) {
            if (effect.location === Locations.PlayArea || effect.location === Locations.Any) {
                effect.ref = target.addEffectToEngine(effect);
            }
        }
    }

    unapply(target: BaseCard) {
        for (const value of this.abilitiesForTargets[target.uuid].reactions) {
            // @ts-ignore
            value.unregisterEvents();
        }
        for (const effect of this.persistentEffects) {
            if (effect.ref) {
                target.removeEffectFromEngine(effect.ref);
                delete effect.ref;
            }
        }
        delete this.abilitiesForTargets[target.uuid];
    }

    getActions(target: BaseCard) {
        if (this.abilitiesForTargets[target.uuid]) {
            return this.abilitiesForTargets[target.uuid].actions;
        }
        return [];
    }

    getReactions(target: BaseCard) {
        if (this.abilitiesForTargets[target.uuid]) {
            return this.abilitiesForTargets[target.uuid].reactions;
        }
        return [];
    }

    getPersistentEffects() {
        return this.persistentEffects;
    }
}

export function gainAllAbilities(character: BaseCard) {
    return EffectBuilder.card.static(EffectNames.GainAllAbilities, new GainAllAbilities(character));
}