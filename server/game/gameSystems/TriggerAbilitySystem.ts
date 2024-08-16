import type CardAbility from '../core/ability/CardAbility';
import type Card from '../core/card/Card';
import type { GameEvent } from '../core/event/GameEvent';
import AbilityResolver from '../core/gameSteps/AbilityResolver';
import type Player from '../core/Player';
import type TriggeredAbility from '../core/ability/TriggeredAbility';
import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';

export interface ITriggerAbilityProperties extends ICardTargetSystemProperties {
    ability: CardAbility;
    subResolution?: boolean;
    ignoredRequirements?: string[];
    player?: Player;
    event?: GameEvent;
}

export class TriggerAbilitySystem extends CardTargetSystem<ITriggerAbilityProperties> {
    override name = 'triggerAbility';
    override defaultProperties: ITriggerAbilityProperties = {
        ability: null,
        ignoredRequirements: [],
        subResolution: false
    };

    override getEffectMessage(context: TriggeredAbilityContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['resolve {0}\'s {1} ability', [properties.target, properties.ability.title]];
    }

    override canAffect(card: Card, context: TriggeredAbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const ability = properties.ability as TriggeredAbility;
        const player = properties.player || context.player;
        const newContextEvent = properties.event;
        if (
            !super.canAffect(card, context) ||
            !ability ||
            (!properties.subResolution && player.isAbilityAtMax(ability.maxIdentifier))
        ) {
            return false;
        }
        const newContext = ability.createContext(player, newContextEvent);
        const ignoredRequirements = properties.ignoredRequirements.concat('player', 'location', 'limit');
        return !ability.meetsRequirements(newContext, ignoredRequirements);
    }

    eventHandler(event, additionalProperties): void {
        const properties = this.generatePropertiesFromContext(event.context, additionalProperties);
        const player = properties.player || event.context.player;
        const newContextEvent = properties.event;
        const newContext = (properties.ability as TriggeredAbility).createContext(player, newContextEvent);
        newContext.subResolution = !!properties.subResolution;
        event.context.game.queueStep(new AbilityResolver(event.context.game, newContext));
    }

    override hasTargetsChosenByInitiatingPlayer(context) {
        const properties = this.generatePropertiesFromContext(context);
        return (
            properties.ability &&
            properties.ability.hasTargetsChosenByInitiatingPlayer &&
            properties.ability.hasTargetsChosenByInitiatingPlayer(context)
        );
    }
}