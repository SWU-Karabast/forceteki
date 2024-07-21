import type CardAbility from '../CardAbility';
import type DrawCard from '../drawcard';
import type { Event } from '../Events/Event';
import AbilityResolver from '../gamesteps/abilityresolver';
import type Player from '../player';
import type TriggeredAbility from '../triggeredability';
import type { TriggeredAbilityContext } from '../TriggeredAbilityContext';
import { CardGameAction, type CardActionProperties } from './CardGameAction';

export interface TriggerAbilityProperties extends CardActionProperties {
    ability: CardAbility;
    subResolution?: boolean;
    ignoredRequirements?: string[];
    player?: Player;
    event?: Event;
}

export class TriggerAbilityAction extends CardGameAction<TriggerAbilityProperties> {
    name = 'triggerAbility';
    defaultProperties: TriggerAbilityProperties = {
        ability: null,
        ignoredRequirements: [],
        subResolution: false
    };

    getEffectMessage(context: TriggeredAbilityContext): [string, any[]] {
        let properties = this.getProperties(context);
        return ["resolve {0}'s {1} ability", [properties.target, properties.ability.title]];
    }

    canAffect(card: DrawCard, context: TriggeredAbilityContext, additionalProperties = {}): boolean {
        let properties = this.getProperties(context, additionalProperties);
        let ability = properties.ability as TriggeredAbility;
        let player = properties.player || context.player;
        let newContextEvent = properties.event;
        if (
            !super.canAffect(card, context) ||
            !ability ||
            (!properties.subResolution && player.isAbilityAtMax(ability.maxIdentifier))
        ) {
            return false;
        }
        let newContext = ability.createContext(player, newContextEvent);
        let ignoredRequirements = properties.ignoredRequirements.concat('player', 'location', 'limit');
        return !ability.meetsRequirements(newContext, ignoredRequirements);
    }

    eventHandler(event, additionalProperties): void {
        let properties = this.getProperties(event.context, additionalProperties);
        let player = properties.player || event.context.player;
        let newContextEvent = properties.event;
        let newContext = (properties.ability as TriggeredAbility).createContext(player, newContextEvent);
        newContext.subResolution = !!properties.subResolution;
        event.context.game.queueStep(new AbilityResolver(event.context.game, newContext));
    }

    hasTargetsChosenByInitiatingPlayer(context) {
        let properties = this.getProperties(context);
        return (
            properties.ability &&
            properties.ability.hasTargetsChosenByInitiatingPlayer &&
            properties.ability.hasTargetsChosenByInitiatingPlayer(context)
        );
    }
}