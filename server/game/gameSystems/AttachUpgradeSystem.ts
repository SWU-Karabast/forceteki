import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { GameEvent } from '../core/event/GameEvent.js';
import type { CardTypeFilter } from '../core/Constants';
import { PlayType, RelativePlayer } from '../core/Constants';
import { AbilityRestriction, EventName, WildcardCardType } from '../core/Constants';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import type { IInPlayCard, InPlayCard } from '../core/card/baseClasses/InPlayCard';

export interface IAttachUpgradeProperties extends ICardTargetSystemProperties {
    upgrade?: IInPlayCard;
    newController?: RelativePlayer;
}

export class AttachUpgradeSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IAttachUpgradeProperties> {
    public override readonly name = 'attach';
    public override readonly eventName = EventName.OnUpgradeAttached;
    protected override readonly targetTypeFilter: CardTypeFilter[] = [WildcardCardType.Unit];

    public override eventHandler(event): void {
        const upgradeCard = (event.upgradeCard as InPlayCard);
        const parentCard = (event.parentCard as Card);

        Contract.assertTrue(
            upgradeCard.isUpgrade() ||
            (upgradeCard.isUnit() && upgradeCard.canAttach(parentCard, event.context, event.newController)),
        );
        Contract.assertTrue(parentCard.isUnit());

        event.originalZone = upgradeCard.zoneName;

        // attachTo manages all of the unattach and move zone logic
        upgradeCard.attachTo(parentCard, event.newController);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['attach {1} to {0}', [this.getTargetMessage(properties.target, context), properties.upgrade]];
    }

    public override canAffectInternal(card: Card, context: TContext, additionalProperties: Partial<IAttachUpgradeProperties> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const contextCopy = context.copy({ source: card });

        const upgrade = properties.upgrade;

        Contract.assertNotNullLike(context);
        Contract.assertNotNullLike(context.player);
        Contract.assertNotNullLike(card);
        Contract.assertNotNullLike(upgrade);

        if (!card.isUnit()) {
            return false;
        }
        if (!card.isInPlay()) {
            return false;
        }
        if (!upgrade.canAttach(card, context, this.getFinalController(properties, context))) {
            return false;
        }
        if (card.hasRestriction(AbilityRestriction.EnterPlay, context)) {
            return false;
        }
        if (context.player.hasRestriction(AbilityRestriction.PutIntoPlay, contextCopy)) {
            return false;
        }

        return super.canAffectInternal(card, context);
    }

    public override checkEventCondition(event, additionalProperties: Partial<IAttachUpgradeProperties>): boolean {
        return this.canAffect(event.parentCard, event.context, additionalProperties);
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties: Partial<IAttachUpgradeProperties>): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const upgrade = properties.upgrade;

        event.parentCard = card;
        event.upgradeCard = upgrade;
        event.newController = this.getFinalController(properties, context);
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties: Partial<IAttachUpgradeProperties>): void {
        super.updateEvent(event, card, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const upgrade = properties.upgrade;

        event.setContingentEventsGenerator(() => {
            const contingentEvents = [];

            if (upgrade.isAttached()) {
                contingentEvents.push(new GameEvent(
                    EventName.OnUpgradeUnattached,
                    context,
                    {
                        card,
                        upgradeCard: upgrade,
                        parentCard: upgrade.parentCard,
                        newController: this.getFinalController(properties, context),
                    }
                ));
            } else if (upgrade.isUnit() && upgrade.isInPlay()) {
                // if we're attaching a unit, remove any upgrades / rescue any captured units
                contingentEvents.push(...this.buildUnitCleanupContingentEvents(upgrade, context, event));
            }

            return contingentEvents;
        });
    }

    private getFinalController(properties: IAttachUpgradeProperties, context: TContext) {
        // If playing from out of play, the controller is always the player
        if (context.playType && context.playType === PlayType.PlayFromOutOfPlay) {
            return context.player;
        }

        if (!properties.newController) {
            return properties.upgrade.controller;
        }

        switch (properties.newController) {
            case RelativePlayer.Self:
                return context.player;
            case RelativePlayer.Opponent:
                return context.player.opponent;
            default:
                Contract.fail(`Unknown value of RelativePlayer: ${properties.newController}`);
        }
    }
}
