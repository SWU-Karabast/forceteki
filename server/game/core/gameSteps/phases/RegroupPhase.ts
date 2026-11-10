import { AbilityRestriction, EffectName, EventName, PhaseName, RelativePlayer, TargetMode, ZoneName } from '../../Constants';
import type { Game } from '../../Game';
import { Phase, PhaseInitializeMode } from './Phase';
import { SimpleStep } from '../SimpleStep';
import { VariableResourcePrompt } from '../prompts/VariableResourcePrompt';
import { GameEvent } from '../../event/GameEvent';
import * as GameSystemLibrary from '../../../gameSystems/GameSystemLibrary';
import { DrawSystem } from '../../../gameSystems/DrawSystem';
import { TriggerHandlingMode } from '../../event/EventWindow';
import type { ICardWithExhaustProperty } from '../../card/baseClasses/PlayableOrDeployableCard';
import { Contract } from '../../utils/Contract';
import type { SnapshotManager } from '../../snapshot/SnapshotManager';
import { SnapshotTimepoint } from '../../snapshot/SnapshotInterfaces';
import type { AdditionalPhaseEffect } from '../../ongoingEffect/effectImpl/AdditionalPhaseEffect';
import type { IRegroupReadyLimitProperties } from '../../ongoingEffect/effectImpl/RegroupReadyLimit';
import type { Player } from '../../Player';
import type { Card } from '../../card/Card';
import * as CardSelectorFactory from '../../cardSelector/CardSelectorFactory';
import { AbilityContext } from '../../ability/AbilityContext';
import { SelectCardMode } from '../PromptInterfaces';
import { EnumHelpers } from '../../utils/EnumHelpers';
import { Helpers } from '../../utils/Helpers';

export class RegroupPhase extends Phase {
    public constructor(
        game: Game,
        snapshotManager: SnapshotManager,
        initializeMode: PhaseInitializeMode = PhaseInitializeMode.Normal,
        additionalPhaseEffect: AdditionalPhaseEffect = null
    ) {
        Contract.assertFalse(initializeMode === PhaseInitializeMode.RollbackToEndOfPhase, 'RegroupPhase does not support rolling back to the end of the phase');

        const resourceSteps = [];
        if (
            initializeMode !== PhaseInitializeMode.RollbackToEndOfPhase &&
            snapshotManager.currentSnapshottedTimepointType !== SnapshotTimepoint.RegroupReadyCards
        ) {
            resourceSteps.push(new SimpleStep(game, () => this.drawTwo(initializeMode), 'drawTwo'));
            resourceSteps.push(new SimpleStep(game, () => this.resourcePrompt(), 'resourcePrompt'));
        }

        super(game, PhaseName.Regroup, snapshotManager, additionalPhaseEffect);
        this.initialise(
            [
                ...resourceSteps,
                new SimpleStep(game, () => this.readyAllCards(initializeMode), 'readyAllCards')
            ],
            initializeMode
        );
    }

    private drawTwo(initializeMode: PhaseInitializeMode) {
        this.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.RegroupResource);

        if (initializeMode === PhaseInitializeMode.Normal || initializeMode === PhaseInitializeMode.RollbackToStartOfPhase) {
            this.takeActionSnapshotsForPromptedPlayers();
        }

        // Let's put both draws in the same event window, which should cause any resulting draw damage to be applied simultaneously
        const players = this.game.getPlayers();
        const drawEvents: GameEvent[] = [];

        for (const player of players) {
            const standardDrawCount = 2;

            // Check if the player has any effects that allow them to draw additional cards in the regroup phase
            const additionalDrawCount = player.getOngoingEffectValues<number>(EffectName.DrawAdditionalCardsInRegroup)
                .reduce((total, value) => total + value, 0);

            const drawSystem = new DrawSystem({
                amount: standardDrawCount + additionalDrawCount
            });

            drawSystem.queueGenerateEventGameSteps(
                drawEvents,
                this.game.getFrameworkContext(player)
            );
        }

        this.game.openEventWindow(drawEvents, TriggerHandlingMode.ResolvesTriggers);
    }

    private resourcePrompt() {
        this.game.queueStep(new VariableResourcePrompt(this.game, 0, 1));
    }

    private readyAllCards(initializeMode: PhaseInitializeMode) {
        const checkTakeSnapshot = initializeMode === PhaseInitializeMode.Normal || this.snapshotManager.currentSnapshottedTimepointType !== SnapshotTimepoint.RegroupReadyCards;
        if (checkTakeSnapshot) {
            // reset trackers indicating if a player has been prompted
            this.game.resetPromptedPlayersTracking();
            this.game.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.RegroupReadyCards);
        }

        const cardsToReady: ICardWithExhaustProperty[] = [];

        for (const player of this.game.getPlayers()) {
            cardsToReady.push(...player.getArenaUnits({ condition: (card) => !card.hasRestriction(AbilityRestriction.DoesNotReadyDuringRegroup) }));
            cardsToReady.push(...player.resources);

            for (const leader of player.getAllDeckLeaders()) {
                if (leader.zoneName === ZoneName.Base) {
                    cardsToReady.push(leader);
                }
            }
        }

        for (const player of this.game.getPlayersInInitiativeOrder()) {
            for (const { value: limit, context } of player.getOngoingEffectDetails<IRegroupReadyLimitProperties>(EffectName.LimitReadyDuringRegroup)) {
                this.game.queueSimpleStep(() => this.applyReadyLimit(player, limit, context.source, cardsToReady), 'apply limit on readying cards');
            }
        }

        this.game.queueSimpleStep(() => {
            // create a single event for the ready cards step as well as individual events for readying each card
            const events = [new GameEvent(EventName.OnRegroupPhaseReadyCards, this.game.getFrameworkContext(), {})];
            GameSystemLibrary.ready({ isRegroupPhaseReadyStep: true, target: cardsToReady })
                .queueGenerateEventGameSteps(events, this.game.getFrameworkContext());

            this.game.queueSimpleStep(() => this.game.openEventWindow(events, TriggerHandlingMode.ResolvesTriggers), 'open event window for card readying effects');
        }, 'ready cards');

        if (checkTakeSnapshot) {
            // checks if a player was prompted during the end step and if so, takes a snapshot so they can unwind to the prompt
            this.game.queueSimpleStep(() => this.takeActionSnapshotsForPromptedPlayers(), 'takeActionSnapshotsForPromptedPlayers');
        }
    }

    /**
     * Has `player` choose which of their exhausted cards limited by `limit` ready, and removes the rest from `cardsToReady`
     */
    private applyReadyLimit(player: Player, limit: IRegroupReadyLimitProperties, source: Card, cardsToReady: ICardWithExhaustProperty[]) {
        const context = this.game.getFrameworkContext(player);
        const readySystem = GameSystemLibrary.ready({ isRegroupPhaseReadyStep: true });

        const candidates: Card[] = cardsToReady.filter((card) =>
            card.controller === player &&
            card.exhausted &&
            EnumHelpers.cardZoneMatches(card.zoneName, limit.zoneFilter) &&
            (!limit.cardTypeFilter || EnumHelpers.cardTypeMatches(card.type, limit.cardTypeFilter)) &&
            (!limit.cardCondition || limit.cardCondition(card)) &&
            readySystem.canAffect(card, context)
        );

        const numCards = limit.numCardsFunc(candidates);
        if (candidates.length <= numCards) {
            return;
        }

        const keepExhausted = (readiedCandidates: Card[]) => {
            const stayExhausted = candidates.filter((card) => !readiedCandidates.includes(card));
            for (const card of stayExhausted) {
                cardsToReady.splice(cardsToReady.indexOf(card as ICardWithExhaustProperty), 1);
            }
            return stayExhausted;
        };

        if (numCards <= 0) {
            keepExhausted([]);
            this.game.addMessage('{0} cannot ready {1} due to {2}', player, candidates, source);
            return;
        }

        const selector = CardSelectorFactory.create({
            mode: TargetMode.ExactlyVariable,
            numCardsFunc: () => numCards,
            cardTypeFilter: limit.cardTypeFilter,
            cardCondition: (card) => candidates.includes(card),
            multiSelectCardCondition: limit.multiSelectCardCondition,
            zoneFilter: Array.from(new Set(candidates.map((card) => card.zoneName))),
            controller: RelativePlayer.Self,
        });

        const promptContext = new AbilityContext({ game: this.game, player, source });
        const activePromptTitle = typeof limit.activePromptTitle === 'function'
            ? limit.activePromptTitle(candidates)
            : limit.activePromptTitle ?? `${selector.defaultPromptString(promptContext)} to ready`;

        this.game.promptForSelect(player, {
            activePromptTitle,
            source,
            context: promptContext,
            selector,
            isOpponentEffect: source.controller !== player,
            selectCardMode: SelectCardMode.Multiple,
            onSelect: (cards) => {
                const readiedCards = Helpers.asArray(cards);
                const stayExhausted = keepExhausted(readiedCards);
                this.game.addMessage('{0} readies {1} and leaves {2} exhausted due to {3}', player, readiedCards, stayExhausted, source);
                return true;
            }
        });
    }
}
