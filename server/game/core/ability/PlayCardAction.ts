import * as CostLibrary from '../../costs/CostLibrary';
import { resourceCard } from '../../gameSystems/GameSystemLibrary';
import { IActionTargetResolver } from '../../TargetInterfaces';
import { Card } from '../card/Card';
import { EffectName, KeywordName, PhaseName, PlayType, Stage } from '../Constants';
import { ICost } from '../cost/ICost';
import { AbilityContext } from './AbilityContext';
import PlayerAction from './PlayerAction';
import { TriggerHandlingMode } from '../event/EventWindow.js';
import { CostAdjuster } from '../cost/CostAdjuster';
import * as Helpers from '../utils/Helpers';
import { UnitCard } from '../card/CardTypes';
import * as Contract from '../utils/Contract';

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

export interface IExploitProperties {
    availableExploit: number;
    usedExploit: number;
    exploitedUnits: UnitCard[];
}

export type PlayCardContext = AbilityContext & { onPlayCardSource: any };

export abstract class PlayCardAction extends PlayerAction {
    public readonly playType: PlayType;
    public readonly costAdjusters: CostAdjuster[];

    protected readonly createdWithProperties: IPlayCardActionProperties;

    protected _exploitProperties?: IExploitProperties = null;

    public get exploitProperties() {
        return this._exploitProperties;
    }

    public get usesExploit(): boolean {
        return !!this._exploitProperties;
    }

    public constructor(properties: IPlayCardActionProperties) {
        const usesExploit = !!properties.exploitValue;

        const propertiesWithDefaults = {
            title: `Play ${properties.card.title}`,
            playType: PlayType.PlayFromHand,
            triggerHandlingMode: TriggerHandlingMode.ResolvesTriggers,
            additionalCosts: [],
            ...properties
        };

        super(
            propertiesWithDefaults.card,
            PlayCardAction.getTitle(propertiesWithDefaults.title, propertiesWithDefaults.playType, usesExploit),
            propertiesWithDefaults.additionalCosts.concat(CostLibrary.payPlayCardResourceCost(propertiesWithDefaults.playType)),
            propertiesWithDefaults.targetResolver,
            propertiesWithDefaults.triggerHandlingMode
        );

        this.playType = propertiesWithDefaults.playType;
        this.costAdjusters = Helpers.asArray(propertiesWithDefaults.costAdjusters);
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

    public generateSmuggleEvent(context: PlayCardContext) {
        return resourceCard({ target: context.player.getTopCardOfDeck() }).generateEvent(context);
    }
}
