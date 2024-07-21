import type { AbilityContext } from '../AbilityContext';
import { EventNames } from '../Constants';
import { SimpleStep } from '../gamesteps/SimpleStep.js';
import type { GameAction } from './GameAction';
import type Player from '../player';
import { PlayerAction, type PlayerActionProperties } from './PlayerAction';
import { FateBidPrompt } from '../gamesteps/FateBidPrompt';
import { LoseFateAction } from './LoseFateAction';
import { JointGameAction } from './JointGameAction';

export interface FateBidProperties extends PlayerActionProperties {
    postBidAction?: GameAction;
    message?: string;
    messageArgs?: (context: AbilityContext) => any | any[];
}

export class FateBidAction extends PlayerAction {
    name = 'fateBid';
    eventName = EventNames.Unnamed;
    defaultProperties: FateBidProperties = {
        postBidAction: undefined
    };

    constructor(propertyFactory: FateBidProperties | ((context: AbilityContext) => FateBidProperties)) {
        super(propertyFactory);
    }

    defaultTargets(context: AbilityContext) {
        return [context.player];
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        const players = [context.player, context.player.opponent];
        return ['have {0} select an amount of fate from their pool', [players]];
    }

    addPropertiesToEvent(event: any, player: Player, context: AbilityContext, additionalProperties: any): void {
        let { postBidAction, message, messageArgs } = this.getProperties(
            context,
            additionalProperties
        ) as FateBidProperties;
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.postBidAction = postBidAction;
        event.message = message;
        event.messageArgs = messageArgs;
    }

    eventHandler(
        event: { context: AbilityContext } & Pick<FateBidProperties, 'postBidAction' | 'messageArgs' | 'message'>
    ): void {
        const context = event.context;
        context.game.queueStep(
            new FateBidPrompt(context.game, 'Choose an amount of fate', (result, context) => {
                const actions: Array<LoseFateAction> = [];
                for (const [player, amount] of result.bids) {
                    context.game.addMessage('{0} spends {1} fate', player, amount);
                    actions.push(new LoseFateAction({ amount, target: player }));
                }
                new JointGameAction(actions).resolve(undefined, context);
                // @ts-ignore
                context.fateBidResult = result;
            })
        );
        context.game.queueStep(
            new SimpleStep(context.game, () => event.postBidAction.resolve(context.player, context))
        );
        context.game.queueStep(
            new SimpleStep(context.game, () => {
                const [message, messageArgs] = event.message
                    ? [event.message, event.messageArgs ? Array.from(event.messageArgs(context)) : []]
                    : event.postBidAction.getEffectMessage(context);
                context.game.addMessage(message, ...messageArgs);
            })
        );
    }
}