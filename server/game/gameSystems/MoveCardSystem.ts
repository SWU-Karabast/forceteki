import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { MoveZoneDestination } from '../core/Constants';
import { AbilityRestriction, EffectName, RelativePlayer } from '../core/Constants';
import {
    CardType,
    DeckZoneDestination,
    EventName,
    GameStateChangeRequired,
    WildcardCardType,
    ZoneName
} from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import * as Helpers from '../core/utils/Helpers.js';
import * as ChatHelpers from '../core/chat/ChatHelpers';
import type { AttachedUpgradeOverrideHandler } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import type { FormatMessage } from '../core/chat/GameChat';

/**
 * Properties for moving a card within the game.
 *
 * @remarks
 * Use this interface to specify the properties when moving a card to a new zone.
 * Note that to move cards to the discard pile, any arena, or to the resources, you should use the appropriate systems
 * such as {@link DiscardSpecificCardSystem}, {@link PlayCardSystem}, or {@link ResourceCardSystem}.
 *
 * @property destination - The target zone for the card. Excludes discard pile, space arena, ground arena, and resources.
 * @property shuffle - Indicates whether the card should be shuffled into the destination.
 * @property shuffleMovedCards - Indicates whether all targets should be shuffled before added into the destination.
 */
export interface IMoveCardProperties extends ICardTargetSystemProperties {
    destination: Exclude<MoveZoneDestination, ZoneName.Discard | ZoneName.SpaceArena | ZoneName.GroundArena | ZoneName.Resource>;
    shuffle?: boolean;
    shuffleMovedCards?: boolean;
    attachedUpgradeOverrideHandler?: AttachedUpgradeOverrideHandler;
}

export class MoveCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IMoveCardProperties> {
    public override readonly name = 'move';
    protected override readonly eventName = EventName.OnCardMoved;
    public override targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade, CardType.Event];

    protected override defaultProperties: IMoveCardProperties = {
        destination: null,
        shuffle: false,
    };

    public eventHandler(event: any): void {
        const card = event.card as Card;
        Contract.assertTrue(card.canBeExhausted());

        if (card.zoneName === ZoneName.Resource) {
            this.leavesResourceZoneEventHandler(card, event.context);
        }

        // Check if the card is leaving play
        if (EnumHelpers.isArena(card.zoneName) && !EnumHelpers.isArena(event.destination)) {
            this.leavesPlayEventHandler(card, event.destination, event.context, () => card.moveTo(event.destination));
        } else {
            card.moveTo(event.destination);

            // TODO: use ShuffleDeckSystem instead
            if (event.destination === ZoneName.Deck && event.shuffle) {
                card.owner.shuffleDeck();
            }
        }
    }

    public override getCostMessage(context: TContext): [string, any[]] {
        return this.getEffectMessage(context);
    }

    public override getEffectMessage(context: TContext, additionalProperties: Partial<IMoveCardProperties> = {}): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties) as IMoveCardProperties;

        let destination: FormatMessage = { format: 'their {0}', args: [properties.destination] };
        if (properties.destination === ZoneName.Hand || EnumHelpers.isDeckMoveZone(properties.destination)) {
            if (new Set(Helpers.asArray(properties.target).map((card) => card.owner)).size === 1) {
                const getDestination = (owner: string | FormatMessage): FormatMessage => {
                    if (EnumHelpers.isDeckMoveZone(properties.destination)) {
                        if (properties.shuffle) {
                            return { format: '{0} deck', args: [owner] };
                        }
                        return { format: 'the {0} of {1} deck', args: [properties.destination === DeckZoneDestination.DeckBottom ? 'bottom' : 'top', owner] };
                    }
                    return { format: '{0} {1}', args: [owner, properties.destination] };
                };

                if (Helpers.asArray(properties.target)[0].owner === context.player) {
                    destination = getDestination('their');
                } else {
                    destination = getDestination({ format: '{0}\'s', args: [Helpers.asArray(properties.target)[0].owner] });
                }
            } else {
                destination = { format: 'their owner {0}', args: [properties.destination] };
            }
        }

        if (properties.destination === ZoneName.Hand) {
            let target: Card | Card[] | string | FormatMessage = properties.target;
            if (Helpers.asArray(properties.target).some((card) => card.zoneName === ZoneName.Resource)) {
                const targets = Helpers.asArray(properties.target);
                target = ChatHelpers.pluralize(targets.length, 'a resource', 'resources');
            }
            return [`${ChatHelpers.verb(properties, 'return', 'returning')} {0} to {1}`, [target, destination]];
        } else if (EnumHelpers.isDeckMoveZone(properties.destination)) {
            if (properties.shuffle) {
                return [`${ChatHelpers.verb(properties, 'shuffle', 'shuffling')} {0} into {1}`, [properties.target, destination]];
            }
            const targets = Helpers.asArray(properties.target);
            let target: Card | Card[] | string | FormatMessage = properties.target;
            if (targets.some((target) => EnumHelpers.isHiddenFromOpponent(target.zoneName, RelativePlayer.Self))) {
                target = ChatHelpers.pluralize(targets.length, 'a card', 'cards');
            }
            return [`${ChatHelpers.verb(properties, 'move', 'moving')} {0} to {1}`, [target, destination]];
        }
        return [
            `${ChatHelpers.verb(properties, 'move', 'moving')} {0} to {1}`,
            [properties.target, properties.destination]
        ];
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties: Partial<IMoveCardProperties>): void {
        super.updateEvent(event, card, context, additionalProperties);
        const { attachedUpgradeOverrideHandler } = this.generatePropertiesFromContext(context, additionalProperties);

        // Check if the card is leaving play
        if (EnumHelpers.isArena(card.zoneName) && !EnumHelpers.isArena(event.destination)) {
            this.addLeavesPlayPropertiesToEvent(event, card, context, additionalProperties, attachedUpgradeOverrideHandler);
        }
    }

    public override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: Partial<IMoveCardProperties>): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        event.destination = properties.destination;
        event.shuffle = properties.shuffle;
    }

    public override canAffectInternal(card: Card, context: TContext, additionalProperties: Partial<IMoveCardProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties) as IMoveCardProperties;
        const { destination } = properties;

        Contract.assertNotNullLike(destination);

        if (card.isToken()) {
            if (destination === ZoneName.Base) {
                return false;
            }
        } else {
            // Used below. Units with leaders attached need to be considered basic units (tokens with leaders attached are handled above)
            const isUnitWithLeaderAttached = card.isUnit() && card.hasOngoingEffect(EffectName.IsLeader);

            // Ensure that we have a valid destination and that the card can be moved there
            if (!context.player.isLegalZoneForCardType(isUnitWithLeaderAttached ? CardType.BasicUnit : card.type, destination)) {
                return false;
            }
        }

        // Ensure that if the card is returning to the hand, it must be in the discard pile or in play or be a resource
        if (destination === ZoneName.Hand) {
            if (
                !([ZoneName.Discard, ZoneName.Resource].includes(card.zoneName)) && !EnumHelpers.isArena(card.zoneName)
            ) {
                return false;
            }

            if ((properties.isCost || mustChangeGameState !== GameStateChangeRequired.None) && card.hasRestriction(AbilityRestriction.ReturnToHand, context)) {
                return false;
            }
        }

        // Call the super implementation
        return super.canAffectInternal(card, context, additionalProperties, mustChangeGameState);
    }

    protected override processTargets(target: Card | Card[], context: TContext) {
        if (this.properties?.shuffleMovedCards && Array.isArray(target)) {
            Helpers.shuffleArray(target, context.game.randomGenerator);
        }
        return target;
    }
}
