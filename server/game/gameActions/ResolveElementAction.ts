import type { AbilityContext } from '../AbilityContext';
import { EffectNames, EventNames } from '../Constants';
import { Event } from '../Events/Event';
import type Player from '../player';
import Ring from '../ring';
import { RingEffects } from '../RingEffects';
import { RingAction, type RingActionProperties } from './RingAction';

export interface ResolveElementProperties extends RingActionProperties {
    physicalRing?: Ring;
    player?: Player;
    enforceOrderedResolution?: boolean;
}

export class ResolveElementAction extends RingAction<ResolveElementProperties> {
    name = 'resolveElement';
    eventName = EventNames.OnResolveRingElement;
    effect = 'resolve {0} effect';

    addEventsToArray(events: any[], context: AbilityContext, additionalProperties: any = {}): void {
        const properties = this.getProperties(context, additionalProperties);
        const target = properties.target as Ring[];
        const rings = target.flatMap((element) => {
            if (typeof element === 'string') {
                const ring = context.game.rings[element];
                return ring ? [ring] : [];
            }
            if (element instanceof Ring) {
                return [element];
            }
            return [];
        });

        if (rings.length === 1) {
            events.push(this.getEvent(rings[0], context, additionalProperties));
            return;
        }

        if (rings.length > 1) {
            const sortedRings = properties.enforceOrderedResolution
                ? rings
                : rings.sort(
                      (a, b) =>
                          (context.player.firstPlayer ? 1 : -1) *
                          (RingEffects.contextFor(context.player, a.element).ability.defaultPriority -
                              RingEffects.contextFor(context.player, b.element).ability.defaultPriority)
                  );
            additionalProperties.optional = false;
            const effectObjects = sortedRings.map((ring) => ({
                title: RingEffects.getRingName(ring.element) + ' Effect',
                handler: () => context.game.openEventWindow(this.getEvent(ring, context, additionalProperties))
            }));
            events.push(
                new Event(EventNames.Unnamed, {}, () => context.game.openSimultaneousEffectWindow(effectObjects))
            );
        }
    }

    addPropertiesToEvent(event: any, ring: Ring, context: AbilityContext, additionalProperties: any): void {
        let { physicalRing, optional, player } = this.getProperties(context, additionalProperties);
        super.addPropertiesToEvent(event, ring, context, additionalProperties);
        event.player = player || context.player;
        event.physicalRing = physicalRing;
        event.optional = optional;
        event.effectivellyResolvedEffect = false;
    }

    eventHandler(event: any): void {
        const cannotResolveRingEffects = event.context.player.getEffects(EffectNames.CannotResolveRings);

        if (cannotResolveRingEffects.length) {
            event.context.game.addMessage("{0}'s ring effect is cancelled.", event.context.player);
            event.cancel();
            return;
        }

        event.context.game.resolveAbility(
            RingEffects.contextFor(event.player, event.ring.element, event.optional, (resolved) => {
                event.effectivellyResolvedEffect = resolved;
            })
        );
    }
}