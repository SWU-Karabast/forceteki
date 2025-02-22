import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { GameEvent } from '../core/event/GameEvent.js';
import type { CardTypeFilter } from '../core/Constants';
import { KeywordName, RelativePlayer } from '../core/Constants';
import { AbilityRestriction, EventName, WildcardCardType } from '../core/Constants';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import type { PlayableOrDeployableCard } from '../core/card/baseClasses/PlayableOrDeployableCard';
import type { IUpgradeCard } from '../core/card/CardInterfaces';

export interface IAttachUpgradeProperties extends ICardTargetSystemProperties {
    upgrade?: IUpgradeCard;
    newController?: RelativePlayer;
}

export class AttachUpgradeSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IAttachUpgradeProperties> {
    public override readonly name = 'attach';
    public override readonly eventName = EventName.OnUpgradeAttached;
    protected override readonly targetTypeFilter: CardTypeFilter[] = [WildcardCardType.Unit];

    public override eventHandler(event, additionalProperties = {}): void {
        const upgradeCard = (event.upgradeCard as PlayableOrDeployableCard);
        const parentCard = (event.parentCard as Card);

        Contract.assertTrue(upgradeCard.isUpgrade() || (upgradeCard.isUnit() && upgradeCard.hasSomeKeyword(KeywordName.Piloting)));
        Contract.assertTrue(parentCard.isUnit());

        event.originalZone = upgradeCard.zoneName;

        // attachTo manages all of the unattach and move zone logic
        upgradeCard.attachTo(parentCard, event.newController);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['attach {1} to {0}', [properties.target, properties.upgrade]];
    }

    public override canAffect(card: Card, context: TContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const contextCopy = context.copy({ source: card });

        Contract.assertNotNullLike(context);
        Contract.assertNotNullLike(context.player);
        Contract.assertNotNullLike(card);
        Contract.assertNotNullLike(properties.upgrade);

        if (!card.isUnit()) {
            return false;
        }

        if (!properties.upgrade.canAttach(card, this.getFinalController(properties, context))) {
            return false;
        } else if (card.hasRestriction(AbilityRestriction.EnterPlay, context)) {
            return false;
        } else if (context.player.hasRestriction(AbilityRestriction.PutIntoPlay, contextCopy)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    public override checkEventCondition(event, additionalProperties): boolean {
        return this.canAffect(event.parentCard, event.context, additionalProperties);
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const upgrade = properties.upgrade;

        event.parentCard = card;
        event.upgradeCard = upgrade;
        event.newController = this.getFinalController(properties, context);
        event.setContingentEventsGenerator(() => {
            const contingentEvents = [];

            if (upgrade.isInPlay()) {
                contingentEvents.push(new GameEvent(
                    EventName.OnUpgradeUnattached,
                    context,
                    {
                        card,
                        upgradeCard: upgrade,
                        parentCard: upgrade.parentCard,
                    }
                ));
            }

            return contingentEvents;
        });
    }

    private getFinalController(properties: IAttachUpgradeProperties, context: TContext) {
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
