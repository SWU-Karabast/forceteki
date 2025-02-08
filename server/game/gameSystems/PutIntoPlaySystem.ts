import type { AbilityContext } from '../core/ability/AbilityContext';
import {
    AbilityRestriction, EffectName,
    EventName,
    KeywordName,
    RelativePlayer,
    WildcardCardType,
    ZoneName
} from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { Card } from '../core/card/Card';
import * as Contract from '../core/utils/Contract';

export interface IPutIntoPlayProperties extends ICardTargetSystemProperties {
    controller?: RelativePlayer;
    overrideZone?: ZoneName;
    entersReady?: boolean;
}

export class PutIntoPlaySystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IPutIntoPlayProperties> {
    public override readonly name = 'putIntoPlay';
    public override readonly eventName = EventName.OnUnitEntersPlay;
    public override readonly costDescription = 'putting {0} into play';

    protected override readonly targetTypeFilter = [WildcardCardType.Unit];
    protected override defaultProperties: IPutIntoPlayProperties = {
        controller: RelativePlayer.Self,
        overrideZone: null,
        entersReady: false
    };

    public eventHandler(event, additionalProperties = {}): void {
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

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { target } = this.generatePropertiesFromContext(context);
        return ['put {0} into play', [target]];
    }

    public override canAffect(card: Card, context: TContext): boolean {
        const contextCopy = context.copy({ source: card });
        const player = this.getPutIntoPlayPlayer(contextCopy, card);
        if (!super.canAffect(card, context)) {
            return false;
        } else if (!card.canBeInPlay() || card.isInPlay()) {
            return false;
        } else if (card.zoneName === ZoneName.Resource && !card.hasSomeKeyword(KeywordName.Smuggle)) {
            return false;
        } else if (card.hasRestriction(AbilityRestriction.EnterPlay, context)) {
            return false;
        } else if (player.hasRestriction(AbilityRestriction.PutIntoPlay, contextCopy)) {
            return false;
        }
        return true;
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties): void {
        // TODO:rename this class and all related classes / methods as PutUnitIntoPlay
        const { controller, overrideZone, entersReady } = this.generatePropertiesFromContext(
            context,
            additionalProperties
        ) as IPutIntoPlayProperties;
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.controller = controller;
        event.originalZone = overrideZone || card.zoneName;
        event.entersReady = entersReady || card.hasOngoingEffect(EffectName.EntersPlayReady);
        event.newController = this.getFinalController(controller, context);
    }

    private getPutIntoPlayPlayer(context: AbilityContext, card: Card) {
        return context.player || card.owner;
    }

    private getFinalController(controller: RelativePlayer, context: TContext) {
        switch (controller) {
            case RelativePlayer.Self:
                return context.player;
            case RelativePlayer.Opponent:
                return context.player.opponent;
            default:
                Contract.fail(`Unknown value of RelativePlayer: ${controller}`);
        }
    }
}
