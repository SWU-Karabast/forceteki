import { resourceCard } from '../../gameSystems/GameSystemLibrary';
import type { IActionTargetResolver } from '../../TargetInterfaces';
import type { Card } from '../card/Card';
import type { Aspect } from '../Constants';
import { EffectName, EventName, KeywordName, PhaseName, PlayType } from '../Constants';
import type { ICost } from '../cost/ICost';
import type { AbilityContext } from './AbilityContext';
import PlayerAction from './PlayerAction';
import { TriggerHandlingMode } from '../event/EventWindow.js';
import type { CostAdjuster } from '../cost/CostAdjuster';
import * as Helpers from '../utils/Helpers';
import * as Contract from '../utils/Contract';
import { PlayCardResourceCost } from '../../costs/PlayCardResourceCost';
import { GameEvent } from '../event/GameEvent';
import { ExploitCostAdjuster } from '../../abilities/keyword/ExploitCostAdjuster';
import type Game from '../Game';
import type Player from '../Player';

export interface IPlayCardActionPropertiesBase {
    playType: PlayType;
    title?: string;
    triggerHandlingMode?: TriggerHandlingMode;
    costAdjusters?: CostAdjuster | CostAdjuster[];
    targetResolver?: IActionTargetResolver;
    additionalCosts?: ICost[];
    exploitValue?: number;
    canPlayFromAnyZone?: boolean;
}

interface IStandardPlayActionProperties extends IPlayCardActionPropertiesBase {
    playType: PlayType.PlayFromHand | PlayType.PlayFromOutOfPlay;
}

export interface ISmuggleCardActionProperties extends IPlayCardActionPropertiesBase {
    playType: PlayType.Smuggle;
    smuggleResourceCost: number;
    smuggleAspects: Aspect[];
    appendSmuggleToTitle?: boolean;
}

export type IPlayCardActionProperties = IStandardPlayActionProperties | ISmuggleCardActionProperties;

export type PlayCardContext = AbilityContext & { onPlayCardSource: any };

export abstract class PlayCardAction extends PlayerAction {
    public readonly costAdjusters: CostAdjuster[];
    public readonly exploitValue?: number;
    public readonly playType: PlayType;
    public readonly canPlayFromAnyZone: boolean;

    protected readonly createdWithProperties: IPlayCardActionProperties;

    public constructor(game: Game, card: Card, properties: IPlayCardActionProperties) {
        Contract.assertTrue(card.hasCost());

        let propertiesWithDefaults = {
            title: `Play ${card.title}`,
            playType: PlayType.PlayFromHand,
            triggerHandlingMode: TriggerHandlingMode.ResolvesTriggers,
            additionalCosts: [],
            ...properties,
            costAdjusters: Helpers.asArray(properties.costAdjusters)
        };

        Contract.assertFalse(
            Helpers.asArray(propertiesWithDefaults.costAdjusters).some(((adjuster) => adjuster && adjuster.isExploit())),
            `PlayCardAction for ${card.internalName} has an exploit adjuster already included in properties`
        );

        const usesExploit = !!properties.exploitValue;
        if (usesExploit) {
            propertiesWithDefaults = Helpers.mergeArrayProperty(
                propertiesWithDefaults, 'costAdjusters', [new ExploitCostAdjuster(card.game, card, { exploitKeywordAmount: properties.exploitValue })]
            );
        }

        let cost: number;
        let aspects: Aspect[];
        let appendSmuggleToTitle: boolean = null;
        if (properties.playType === PlayType.Smuggle) {
            cost = properties.smuggleResourceCost;
            aspects = properties.smuggleAspects;
            appendSmuggleToTitle = properties.appendSmuggleToTitle;
        } else {
            cost = card.cost;
            aspects = card.aspects;
        }

        const playCost = new PlayCardResourceCost(card, propertiesWithDefaults.playType, cost, aspects);

        super(
            game,
            card,
            PlayCardAction.getTitle(propertiesWithDefaults.title, propertiesWithDefaults.playType, usesExploit, appendSmuggleToTitle),
            propertiesWithDefaults.additionalCosts.concat(playCost),
            propertiesWithDefaults.targetResolver,
            propertiesWithDefaults.triggerHandlingMode
        );

        this.playType = propertiesWithDefaults.playType;
        this.costAdjusters = Helpers.asArray(propertiesWithDefaults.costAdjusters);
        this.exploitValue = properties.exploitValue;
        this.createdWithProperties = { ...properties };
        this.canPlayFromAnyZone = !!properties.canPlayFromAnyZone;
    }

    public hasAvailableExploit(context: AbilityContext) {
        return this.getCosts(context).some((cost) => cost.usesExploit && cost.usesExploit(context));
    }

    private static getTitle(title: string, playType: PlayType, withExploit: boolean = false, appendToTitle: boolean = true): string {
        let updatedTitle = title;

        switch (playType) {
            case PlayType.Smuggle:
                updatedTitle += appendToTitle ? ' with Smuggle' : '';
                break;
            case PlayType.PlayFromHand:
            case PlayType.PlayFromOutOfPlay:
                break;
            default:
                Contract.fail(`Unknown play type: ${playType}`);
        }

        if (withExploit) {
            updatedTitle += ' using Exploit';
        }

        return updatedTitle;
    }

    public abstract clone(overrideProperties: Partial<IPlayCardActionProperties>): PlayCardAction;

    public override hasMultipleModes(context: AbilityContext): boolean {
        return this.hasAvailableExploit(context);
    }

    public override meetsRequirements(context = this.createContext(), ignoredRequirements: string[] = []): string {
        if (
            !ignoredRequirements.includes('phase') &&
            context.game.currentPhase !== PhaseName.Action
        ) {
            return 'phase';
        }
        if (
            !ignoredRequirements.includes('zone') && !this.canPlayFromAnyZone &&
            !context.player.isCardInPlayableZone(context.source, this.playType)
        ) {
            return 'zone';
        }
        if (
            !ignoredRequirements.includes('cannotTrigger') &&
            !context.source.canPlay(context, this.playType)
        ) {
            return 'cannotTrigger';
        }
        if (PlayType.Smuggle === this.playType && !context.source.hasSomeKeyword(KeywordName.Smuggle)) {
            return 'smuggleKeyword';
        }
        return super.meetsRequirements(context, ignoredRequirements);
    }

    public override getContextProperties(player: Player, event: any) {
        return {
            ...super.getContextProperties(player, event),
            costAspects: this.card.aspects,
            playType: this.playType,
        };
    }

    public override isPlayCardAbility(): this is PlayCardAction {
        return true;
    }

    public override getAdjustedCost(context) {
        const resourceCost = this.getCosts(context).find((cost) => cost.getAdjustedCost);
        return resourceCost ? resourceCost.getAdjustedCost(context) : 0;
    }

    public override getCosts(context) {
        const costs = super.getCosts(context);
        if (context.player.hasOngoingEffect(EffectName.AdditionalPlayCost)) {
            const additionalPlayCosts = context.player
                .getOngoingEffectValues(EffectName.AdditionalPlayCost)
                .map((effect) => effect(context))
                // filter out any undefined or null cost
                .filter((cost) => cost);
            return costs.concat(additionalPlayCosts);
        }
        return costs;
    }

    protected addSmuggleEvent(events: any[], context: PlayCardContext) {
        if (context.player.drawDeck.length === 0) {
            return;
        }

        const smuggleEvent = resourceCard({
            target: context.player.getTopCardOfDeck(),
            readyResource: !this.card.exhausted,
        }).generateEvent(context);

        events.push(smuggleEvent);
    }

    protected generateOnPlayEvent(context: PlayCardContext, additionalProps: any = {}) {
        const handler = () => {
            this.logPlayCardEvent(context);
            if (additionalProps.handler) {
                additionalProps.handler();
            }
        };

        return new GameEvent(EventName.OnCardPlayed, context, {
            player: context.player,
            card: context.source,
            originalZone: context.source.zoneName,
            originallyOnTopOfDeck:
                        context.player && context.player.drawDeck && context.player.drawDeck[0] === context.source,
            onPlayCardSource: context.onPlayCardSource,
            playType: context.playType,
            costs: context.costs,
            ...additionalProps,
            handler
        });
    }

    private logPlayCardEvent(context: any): void {
        if (context.playType === PlayType.PlayFromHand) {
            context.game.clientUIProperties.lastPlayedCard = context.source.cardData.setId;
        }
    }
}
