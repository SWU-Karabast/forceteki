import type { AbilityContext } from '../core/ability/AbilityContext';
import {
    AbilityRestriction, EffectName,
    EventName,
    PlayType,
    RelativePlayer,
    WildcardCardType,
    ZoneName
} from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { Card } from '../core/card/Card';
import type { Player } from '../core/Player';
import * as EnumHelpers from '../core/utils/EnumHelpers';

export interface IPutIntoPlayProperties extends ICardTargetSystemProperties {
    controller?: Player | RelativePlayer;
    overrideZone?: ZoneName;
    entersReady?: boolean;
}

export class PutIntoPlaySystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IPutIntoPlayProperties> {
    public override readonly name = 'putIntoPlay';
    public override readonly eventName = EventName.OnUnitEntersPlay;
    public override effectDescription = 'put {0} into play';
    public override readonly costDescription = 'putting {0} into play';

    protected override readonly targetTypeFilter = [WildcardCardType.Unit];
    protected override defaultProperties: IPutIntoPlayProperties = {
        controller: RelativePlayer.Self,
        overrideZone: null,
        entersReady: false
    };

    public eventHandler(event): void {
        if (event.newController && event.newController !== event.card.controller) {
            event.card.takeControl(event.newController, event.card.defaultArena);
        } else {
            event.card.moveTo(event.card.defaultArena);
        }

        if (event.entersReady) {
            event.card.ready();
        } else {
            event.card.exhaust();
        }
    }

    public override canAffectInternal(card: Card, context: TContext): boolean {
        const contextCopy = context.copy({ source: card });
        const player = this.getPutIntoPlayPlayer(contextCopy, card);
        if (!super.canAffectInternal(card, context)) {
            return false;
        } else if (!card.canBeInPlay() || card.isInPlay()) {
            return false;
        } else if (
            card.zoneName === ZoneName.Resource &&
            !(context.playType === PlayType.Smuggle || context.playType === PlayType.PlayFromOutOfPlay || context.playType === PlayType.Plot)
        ) {
            return false;
        } else if (card.hasRestriction(AbilityRestriction.EnterPlay, context)) {
            return false;
        } else if (player.hasRestriction(AbilityRestriction.PutIntoPlay, contextCopy)) {
            return false;
        }
        return true;
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties: Partial<IPutIntoPlayProperties>): void {
        // TODO:rename this class and all related classes / methods as PutUnitIntoPlay
        const { controller, overrideZone, entersReady } = this.generatePropertiesFromContext(
            context,
            additionalProperties
        ) as IPutIntoPlayProperties;
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        const newController = EnumHelpers.asConcretePlayer(controller, context.player);
        event.controller = controller;
        event.originalZone = overrideZone || card.zoneName;
        event.entersReady = entersReady ||
          card.hasOngoingEffect(EffectName.EntersPlayReady) ||
          (newController.hasOngoingEffect(EffectName.TokenUnitsEnterPlayReady) && EnumHelpers.isToken(card.type));
        event.newController = newController;
        event.setPreResolutionEffect((event) => {
            const card: Card = event.card;
            if (card.canRegisterPreEnterPlayAbilities()) {
                for (const ability of card.getPreEnterPlayAbilities()) {
                    context.game.resolveAbility(ability.createContext(context.player, event));
                }
                context.game.queueSimpleStep(() => {
                    if (!event.entersReady) {
                        event.entersReady = card.hasOngoingEffect(EffectName.EntersPlayReady) ||
                          (newController.hasOngoingEffect(EffectName.TokenUnitsEnterPlayReady) && EnumHelpers.isToken(card.type));
                    }
                }, `Update onUnitEntersPlay event after resolving pre-enter play abilities for ${card.internalName}`);
            }
        });
    }

    private getPutIntoPlayPlayer(context: AbilityContext, card: Card) {
        return context.player || card.owner;
    }
}
