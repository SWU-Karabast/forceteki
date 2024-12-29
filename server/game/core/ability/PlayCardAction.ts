import { resourceCard } from '../../gameSystems/GameSystemLibrary';
import { IActionTargetResolver } from '../../TargetInterfaces';
import { Card } from '../card/Card';
import { EffectName, EventName, KeywordName, PhaseName, PlayType, Stage } from '../Constants';
import { ICost } from '../cost/ICost';
import { AbilityContext } from './AbilityContext';
import PlayerAction from './PlayerAction';
import { TriggerHandlingMode } from '../event/EventWindow.js';
import { CostAdjuster } from '../cost/CostAdjuster';
import * as Helpers from '../utils/Helpers';
import * as Contract from '../utils/Contract';
import { PlayCardResourceCost } from '../../costs/PlayCardResourceCost';
import { ExploitPlayCardResourceCost } from '../../abilities/keyword/ExploitPlayCardResourceCost';
import { GameEvent } from '../event/GameEvent';

export interface IPlayCardActionProperties {
    card: Card;
    title?: string;
    playType?: PlayType;
    triggerHandlingMode?: TriggerHandlingMode;
    costAdjusters?: CostAdjuster | CostAdjuster[];
    targetResolver?: IActionTargetResolver;
    additionalCosts?: ICost[];
    exploitValue?: number;
}

export type PlayCardContext = AbilityContext & { onPlayCardSource: any };

export abstract class PlayCardAction extends PlayerAction {
    public readonly costAdjusters: CostAdjuster[];
    public readonly playType: PlayType;
    public readonly usesExploit: boolean;

    protected readonly createdWithProperties: IPlayCardActionProperties;

    public constructor(properties: IPlayCardActionProperties) {
        const usesExploit = !!properties.exploitValue;

        const propertiesWithDefaults = {
            title: `Play ${properties.card.title}`,
            playType: PlayType.PlayFromHand,
            triggerHandlingMode: TriggerHandlingMode.ResolvesTriggers,
            additionalCosts: [],
            ...properties
        };

        const playCost = usesExploit
            ? new ExploitPlayCardResourceCost(properties.exploitValue, propertiesWithDefaults.playType)
            : new PlayCardResourceCost(propertiesWithDefaults.playType);

        super(
            propertiesWithDefaults.card,
            PlayCardAction.getTitle(propertiesWithDefaults.title, propertiesWithDefaults.playType, usesExploit),
            propertiesWithDefaults.additionalCosts.concat(playCost),
            propertiesWithDefaults.targetResolver,
            propertiesWithDefaults.triggerHandlingMode
        );

        this.playType = propertiesWithDefaults.playType;
        this.costAdjusters = Helpers.asArray(propertiesWithDefaults.costAdjusters);
        this.usesExploit = usesExploit;
        this.createdWithProperties = { ...properties };
    }

    private static getTitle(title: string, playType: PlayType, withExploit: boolean = false): string {
        let updatedTitle = title;

        switch (playType) {
            case PlayType.Smuggle:
                updatedTitle += ' with Smuggle';
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

    public abstract clone(overrideProperties: IPlayCardActionProperties): PlayCardAction;

    public override meetsRequirements(context = this.createContext(), ignoredRequirements: string[] = []): string {
        if (
            !ignoredRequirements.includes('phase') &&
            context.game.currentPhase !== PhaseName.Action
        ) {
            return 'phase';
        }
        if (
            !ignoredRequirements.includes('zone') &&
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

    public override createContext(player = this.card.controller) {
        return new AbilityContext({
            ability: this,
            game: this.card.game,
            player: player,
            source: this.card,
            stage: Stage.PreTarget,
            costAspects: this.card.aspects
        });
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

    protected generateSmuggleEvent(context: PlayCardContext) {
        return resourceCard({ target: context.player.getTopCardOfDeck() }).generateEvent(context);
    }

    protected generateOnPlayEvent(context: PlayCardContext, additionalProps: any = {}) {
        return new GameEvent(EventName.OnCardPlayed, context, {
            player: context.player,
            card: context.source,
            originalZone: context.source.zoneName,
            originallyOnTopOfDeck:
                        context.player && context.player.drawDeck && context.player.drawDeck[0] === context.source,
            onPlayCardSource: context.onPlayCardSource,
            playType: context.playType,
            costs: context.costs,
            ...additionalProps
        });
    }
}
