import type { AbilityContext } from '../core/ability/AbilityContext';
import {
    AbilityRestriction, EffectName,
    EntryType,
    EventName,
    PlayType,
    RelativePlayer,
    WildcardCardType,
    ZoneName
} from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { Card } from '../core/card/Card';
import type { Player } from '../core/Player';
import type { UnitsEnterPlayReadyForPlayer } from '../core/playerEffect/UnitsEnterPlayReadyForPlayer';
import { EnumHelpers } from '../core/utils/EnumHelpers';

export interface IPutIntoPlayProperties extends ICardTargetSystemProperties {
    controller?: Player | RelativePlayer;
    overrideZone?: ZoneName;
    entersReady?: boolean;

    /** How the unit is entering play. Default is `EntryType.Played` */
    entryType: EntryType;
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
        entersReady: false,
        entryType: EntryType.Played
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
        const { controller, overrideZone, entersReady, entryType } = this.generatePropertiesFromContext(
            context,
            additionalProperties
        ) as IPutIntoPlayProperties;
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        const newController = EnumHelpers.asConcretePlayer(controller, context.player);
        event.controller = controller;
        event.originalZone = overrideZone || card.zoneName;
        event.entryType = entryType;
        const matchersApply = this.checkEntersPlayReadyEffectsForPlayer(card, newController, context, entryType);
        event.entersReady = entersReady ||
          this.checkEntersPlayReady(card, newController) ||
          (newController.hasOngoingEffect(EffectName.TokenUnitsEnterPlayReady) && EnumHelpers.isToken(card.type)) ||
          matchersApply;
        event.newController = newController;
        event.setPreResolutionEffect((event) => {
            const card: Card = event.card;
            if (card.canRegisterPreEnterPlayAbilities()) {
                for (const ability of card.getPreEnterPlayAbilities()) {
                    context.game.resolveAbility(ability.createContext(context.player, event));
                }
                context.game.queueSimpleStep(() => {
                    if (!event.entersReady) {
                        const matchersApply = this.checkEntersPlayReadyEffectsForPlayer(card, newController, context, entryType);
                        event.entersReady = this.checkEntersPlayReady(card, newController) ||
                          (newController.hasOngoingEffect(EffectName.TokenUnitsEnterPlayReady) && EnumHelpers.isToken(card.type)) ||
                          matchersApply;
                    }
                }, `Update onUnitEntersPlay event after resolving pre-enter play abilities for ${card.internalName}`);
            }
        });
    }

    private getPutIntoPlayPlayer(context: AbilityContext, card: Card) {
        return context.player || card.owner;
    }

    /**
     * Consults any `UnitsEnterPlayReadyForPlayer` effects registered on the new controller.
     *
     * To ensure limits are counted correctly, we apply all effects that match the entering card,
     * even if the card will enter play ready after just one of them. This ensures that if multiple
     * effects apply to the same card, all of their limits will be incremented appropriately and
     * none of them will be able to apply more times than they should.
     */
    private checkEntersPlayReadyEffectsForPlayer(card: Card, newController: Player, context: AbilityContext, entryType: EntryType): boolean {
        const matchers = newController.getOngoingEffectValues<UnitsEnterPlayReadyForPlayer>(
            EffectName.UnitsEnterPlayReady
        );
        let didApply = false;
        for (const matcher of matchers) {
            if (matcher.canApplyTo(card, newController, context, entryType)) {
                matcher.applyTo(card, newController);
                didApply = true;
            }
        }
        return didApply;
    }

    /**
     * Evaluates EntersPlayReady constant ability conditions using the new controller as
     * `context.player`, rather than the card's current controller (which is the original
     * owner when an opponent plays the card via e.g. Vermillion).
     */
    private checkEntersPlayReady(card: Card, newController: Player): boolean {
        for (const ability of card.getConstantAbilities()) {
            for (const effect of ability.registeredEffects) {
                if (effect.type !== EffectName.EntersPlayReady) {
                    continue;
                }
                if (!effect.impl.isConditional) {
                    return true;
                }
                if (effect.condition(effect.context.copy({ player: newController }))) {
                    return true;
                }
            }
        }
        return false;
    }
}
