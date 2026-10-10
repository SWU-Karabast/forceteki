import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EffectName, EventName, ZoneName, RelativePlayer, WildcardCardType, GameStateChangeRequired, PlayType } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { Contract } from '../core/utils/Contract';
import type { GameEvent } from '../core/event/GameEvent';
import { ReadySystem } from './ReadySystem';
import { ChatHelpers } from '../core/chat/ChatHelpers';
import { Helpers } from '../core/utils/Helpers';

export interface IResourceCardProperties extends ICardTargetSystemProperties {
    // TODO: remove completely if faceup logic is not needed
    // faceup?: boolean;
    targetPlayer?: RelativePlayer;
    readyResource?: boolean;
}

export class ResourceCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IResourceCardProperties> {
    public override readonly name = 'resource';
    public override targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade, CardType.Event];
    public override readonly eventName = EventName.OnCardResourced;

    protected override defaultProperties: IGameSystemInput<IResourceCardProperties> = {
        // TODO: remove completely if faceup logic is not needed
        // faceup: false,
        targetPlayer: RelativePlayer.Self,
        readyResource: false
    };

    protected override eventHandlerInternal(event: any): void {
        // TODO: remove this completely if determined we don't need card snapshots
        // event.cardStateWhenMoved = card.createSnapshot();

        const card = event.card as Card;
        Contract.assertTrue(card.isPlayable());

        if (event.resourceControllingPlayer !== card.controller) {
            Contract.assertTrue(card.canChangeController(), `Card ${card.internalName} cannot change controller`);
            card.takeControl(event.resourceControllingPlayer, ZoneName.Resource);
        } else {
            card.moveTo(ZoneName.Resource);
        }
    }

    protected override updateEvent(event: GameEvent, target: any, context: TContext, properties: IResourceCardProperties, additionalProperties: Partial<IGameSystemInput<IResourceCardProperties>> = {}): void {
        const targets = Array.isArray(properties.target) ? properties.target : [properties.target];

        if (properties.readyResource) {
            event.setContingentEventsGenerator((event) => {
                // TODO Refactor ReadySystem to be able to handle multiple targets
                return [...targets.map((x) => new ReadySystem({ target: x }).generateEvent(context))];
            });
        }
        super.updateEvent(event, target, context, properties, additionalProperties);
    }

    protected override getCostMessageInternal(context: TContext, properties: IResourceCardProperties): [string, any[]] {
        return ['moving {0} to resources', [this.getTargetMessage(properties.target, context)]];
    }

    protected override getEffectMessageInternal(context: TContext, properties: IResourceCardProperties): [string, any[]] {
        const card = Array.isArray(properties.target) ? properties.target[0] : properties.target;
        const numberOfTargets = Helpers.asArray(properties.target).length;

        let suffix = '';
        if (properties.readyResource) {
            if (numberOfTargets === 1) {
                suffix = ' and to ready it';
            } else {
                suffix = ' and to ready them';
            }
        }

        if (properties.targetPlayer === RelativePlayer.Self) {
            if (numberOfTargets === 1 && card === context.source) {
                return [`move {0} to their resources${suffix}`, [this.getTargetMessage(card, context)]];
            }
            return [`move {0} to their resources${suffix}`, [ChatHelpers.pluralize(numberOfTargets, 'a card', 'cards')]];
        }

        if (numberOfTargets === 1 && card === context.source) {
            return [`move {0} to {1}'s resources${suffix}`, [this.getTargetMessage(card, context), card.controller.opponent]];
        }
        if (numberOfTargets === 1 && card === context.player.opponent.getTopCardOfDeck()) {
            return [`move the top card of {0}'s deck to their resources${suffix}`, [context.player.opponent]];
        }
        return [`move {0} to {1}'s resources${suffix}`, [ChatHelpers.pluralize(numberOfTargets, 'a card', 'cards'), context.player.opponent]];
    }

    protected override addPropertiesToEvent(event: any, card: Card, context: TContext, properties: IResourceCardProperties): void {
        super.addPropertiesToEvent(event, card, context, properties);

        event.resourceControllingPlayer = this.getResourceControllingPlayer(properties, context);
    }

    protected override canAffectInternal(card: Card, context: TContext, properties: IResourceCardProperties, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const resourceControllingPlayer = this.getResourceControllingPlayer(properties, context);

        // if the card is already resourced by the target player, no game state change will occur
        if (
            mustChangeGameState !== GameStateChangeRequired.None &&
            card.controller === resourceControllingPlayer &&
            card.zoneName === ZoneName.Resource &&
            context.playType !== PlayType.Smuggle && context.playType !== PlayType.Plot
        ) {
            return false;
        }

        if (resourceControllingPlayer !== card.controller && card.hasRestriction(EffectName.TakeControl, context)) {
            return false;
        }

        if (!context.player.isLegalZoneForCardType(card.type, ZoneName.Resource)) {
            return false;
        }

        return super.canAffectInternal(card, context, properties, GameStateChangeRequired.None);
    }

    private getResourceControllingPlayer(properties: IResourceCardProperties, context: TContext) {
        return properties.targetPlayer === RelativePlayer.Self ? context.player : context.player.opponent;
    }
}
