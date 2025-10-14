import { UiPrompt } from './prompts/UiPrompt.js';
import { EventName, EffectName, SnapshotType } from '../Constants.js';
import * as EnumHelpers from '../utils/EnumHelpers.js';
import * as Contract from '../utils/Contract.js';
import type Game from '../Game.js';
import type { Player } from '../Player.js';
import type { Card } from '../card/Card.js';
import type { IPlayerPromptStateProperties } from '../PlayerPromptState.js';
import type { AbilityResolver } from './AbilityResolver.js';
import type { AbilityContext } from '../ability/AbilityContext.js';
import { PromptType, type IButton } from './PromptInterfaces.js';
import type { SnapshotManager } from '../snapshot/SnapshotManager.js';
import { SnapshotTimepoint } from '../snapshot/SnapshotInterfaces.js';

export class ActionWindow extends UiPrompt {
    public static readonly title = 'Action Window';
    public static readonly windowName = 'action';

    private readonly actionNumber: number;
    private readonly activePlayer: Player;
    private readonly prevPlayerPassed: boolean;
    private readonly setPassStatus: (passed: boolean) => boolean;
    private readonly snapshotManager: SnapshotManager;

    public constructor(
        game: Game,
        prevPlayerPassed: boolean,
        setPassStatus: (passed: boolean) => boolean,
        actionNumber: number,
        snapshotManager: SnapshotManager
    ) {
        super(game);
        this.prevPlayerPassed = prevPlayerPassed;
        this.setPassStatus = setPassStatus;
        this.snapshotManager = snapshotManager;
        this.actionNumber = actionNumber;

        this.activePlayer = this.game.actionPhaseActivePlayer;
        this.activePlayer.actionTimer.stop();

        Contract.assertNotNullLike(this.activePlayer);
    }

    public override activeCondition(player: Player) {
        return player === this.activePlayer;
    }

    public override onCardClicked(player: Player, card: Card) {
        this.stopActionTimer();

        if (player !== this.activePlayer) {
            return false;
        }

        const legalActions = this.getCardLegalActions(card, this.activePlayer);
        if (legalActions.length === 0) {
            return false;
        }

        if (legalActions.length === 1) {
            const action = legalActions[0];
            const requiresConfirmation = action.isActionAbility() && action.requiresConfirmation;
            const context = action.createContext(player);
            const targetPrompts = action.targetResolvers.some((targetResolver) => targetResolver.getChoosingPlayer(context) === player);
            if (!requiresConfirmation || action.getCosts(context).some((cost) => cost.promptsPlayer) || targetPrompts) {
                this.resolveAbility(context);
                return true;
            }
        }
        this.game.promptWithHandlerMenu(player, {
            activePromptTitle: (EnumHelpers.isArena(card.zoneName) ? 'Choose an ability:' : 'Play ' + card.title + ':'),
            source: card,
            choices: legalActions.map((action) => action.title).concat('Cancel'),
            handlers: legalActions.map((action) => (() => this.resolveAbility(action.createContext(player)))).concat(() => true)
        });
        return true;
    }

    private resolveAbility(context: AbilityContext) {
        const resolver = this.game.resolveAbility(context);
        this.game.queueSimpleStep(() => {
            if (resolver.resolutionComplete) {
                this.postResolutionUpdate(resolver);
            }
        }, `Check and pass priority for ${resolver.context.ability}`);
    }

    private postResolutionUpdate(resolver: AbilityResolver) {
        this.setPassStatus(false);

        this.complete();
    }

    public override continue() {
        this.checkUpdateSnapshot();

        // TODO: do we need promptedActionWindows?
        if (!this.activePlayer.promptedActionWindows[ActionWindow.windowName]) {
            this.pass();
        }

        const completed = super.continue();

        if (!completed) {
            this.highlightSelectableCards();
            this.game.currentActionWindow = this;
        } else {
            this.game.currentActionWindow = null;
        }
        return completed;
    }

    // TODO: see if there's better logic for determining when and how to advance the turn, take new snapshots, etc.
    private checkUpdateSnapshot() {
        if (
            this.snapshotManager.currentSnapshottedTimepoint !== SnapshotTimepoint.Action ||
            this.snapshotManager.currentSnapshottedAction !== this.actionNumber
        ) {
            this.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
            this.snapshotManager.takeSnapshot({
                type: SnapshotType.Action,
                playerId: this.activePlayer.id
            });
        }
    }

    private stopActionTimer() {
        this.activePlayer.actionTimer.stop();
    }

    public override activePromptInternal(player: Player): IPlayerPromptStateProperties {
        const { mustTakeCardAction, overrideActionPromptTitle } = this.getSelectableCards();

        const buttons: IButton[] = [
            { text: 'Pass', arg: 'pass', disabled: mustTakeCardAction },
        ];
        if (!this.game.isInitiativeClaimed) {
            buttons.push({ text: 'Claim Initiative', arg: 'claimInitiative', disabled: mustTakeCardAction });
        }
        if (this.game.manualMode) {
            buttons.unshift({ text: 'Manual Action', arg: 'manual', disabled: mustTakeCardAction });
        }
        return {
            menuTitle: overrideActionPromptTitle ?? 'Choose an action',
            buttons: buttons,
            promptTitle: ActionWindow.title,
            promptUuid: this.uuid,
            promptType: PromptType.ActionWindow
        };
    }

    public override waitingPrompt() {
        return { menuTitle: 'Waiting for opponent to take an action or pass' };
    }

    public override menuCommand(player: Player, choice: string, uuid: string) {
        this.stopActionTimer();

        switch (choice) {
            // case 'manual':
            //     this.game.promptForSelect(this.activePlayer, {
            //         source: 'Manual Action',
            //         activePrompt: 'Which ability are you using?',
            //         zone: WildcardZoneName.Any,
            //         controller: RelativePlayer.Self,
            //         cardCondition: (card) => card.isFaceup() || card.canBeSmuggled(),
            //         onSelect: (player, card) => {
            //             this.game.addMessage('{0} uses {1}\'s ability', player, card);
            //             this.setPassStatus(false);
            //             return true;
            //         }
            //     });
            //     return true;

            case 'pass':
                this.pass();
                return true;

            case 'claimInitiative':
                this.claimInitiative();
                return true;

            default:
                Contract.fail(`Unknown menu command: ${choice}`);
        }
    }

    public pass(showMessage = true) {
        if (showMessage) {
            this.game.addMessage('{0} passes', this.activePlayer);
        }

        if (this.prevPlayerPassed) {
            // in the (unusual) case that both players pass without claiming initiative, phase ends and initiative stays where it is
            this.activePlayer.passedActionPhase = true;
            this.activePlayer.opponent.passedActionPhase = true;
        } else if (this.activePlayer.opponent.passedActionPhase) {
            // if opponent already claimed initiative, we're done
            this.activePlayer.passedActionPhase = true;
        } else {
            this.setPassStatus(true);
        }

        this.complete();

        // if (!this.activePlayer.opponent) {
        //     this.attemptComplete();
        //     return;
        // }

        // // TODO: is this right? need to investigate for e.g. Leia hero ability
        // if (this.activePlayerConsecutiveActions > 1) {
        //     this.markBonusActionsTaken();
        // }
    }

    public claimInitiative() {
        this.game.addMessage('{0} claims initiative and passes', this.activePlayer);
        this.game.claimInitiative(this.activePlayer);

        // Calls this.complete()
        this.pass(false);
    }

    public override complete() {
        this.game.emitEvent(EventName.OnActionTaken, null, { player: this.activePlayer });

        // this.teardownBonusActions();
        super.complete();
    }

    protected override highlightSelectableCards() {
        const { cardsWithLegalActions: selectableCards } = this.getSelectableCards();

        this.activePlayer.setSelectableCards(selectableCards);
        this.activePlayer.opponent.setSelectableCards([]);
    }

    private getSelectableCards() {
        const allPossibleCards: Card[] = this.game.findAnyCardsInPlay().concat(
            this.activePlayer.discardZone.cards,
            this.activePlayer.opponent.discardZone.cards,
            this.activePlayer.resourceZone.cards,
            this.activePlayer.handZone.cards,
            this.activePlayer.baseZone.cards
        );

        let overrideActionPromptTitle: string | undefined;
        let mustTakeCardAction = false;
        const cardsWithLegalActions: Card[] = [];
        for (const card of allPossibleCards) {
            const legalActions = this.getCardLegalActions(card, this.activePlayer);
            if (card.hasOngoingEffect(EffectName.MustAttack) && legalActions.some((action) => action.isAttackAction())) {
                mustTakeCardAction = true;
                overrideActionPromptTitle = `You must attack with ${card.title} because of ${card.getOngoingEffectSources(EffectName.MustAttack)[0].title}`;
                cardsWithLegalActions.splice(0, cardsWithLegalActions.length, card);
                break;
            } else if (legalActions.length > 0) {
                cardsWithLegalActions.push(card);
            }
        }

        return { cardsWithLegalActions, mustTakeCardAction, overrideActionPromptTitle };
    }

    // IMPORTANT: the below code is referenced in the debugging guide (docs/debugging-guide.md). If you make changes here, make sure to update that document as well.
    private getCardLegalActions(card: Card, player: Player) {
        const actions = card.getActions();
        const legalActions = actions.filter((action) => action.meetsRequirements(action.createContext(player)) === '');
        return legalActions;
    }

    // markBonusActionsTaken() {
    //     if (this.bonusActions) {
    //         this.bonusActions[this.activePlayer.uuid].actionsTaken = true;
    //     }
    // }

    // attemptComplete() {
    //     if (!this.activePlayer.opponent) {
    //         this.complete();
    //     }

    //     if (!this.checkBonusActions()) {
    //         this.complete();
    //     }
    // }

    // TODO: this "bonus actions" code from L5R is for a case where a card lets a user take extra actions out of sequence.
    // Leaving it here in case we ever have something similar

    // checkBonusActions() {
    //     if (!this.bonusActions) {
    //         if (!this.setupBonusActions()) {
    //             return false;
    //         }
    //     }

    //     const player1 = this.game.initiativePlayer();
    //     const player2 = player1.opponent;

    //     const p1 = this.bonusActions[player1.uuid];
    //     const p2 = this.bonusActions[player2.uuid];

    //     if (p1.actionCount > 0) {
    //         if (!p1.actionsTaken) {
    //             this.game.addMessage('{0} has a bonus action during resolution!', player1);
    //             this.prevPlayerPassed = false;
    //             // Set the current player to player1
    //             if (this.activePlayer !== player1) {
    //                 this.activePlayer = player1;
    //             }
    //             return true;
    //         }
    //     }
    //     if (p2.actionCount > 0) {
    //         if (!p2.actionsTaken) {
    //             this.game.addMessage('{0} has a bonus action during resolution!', player2);
    //             this.prevPlayerPassed = false;
    //             // Set the current player to player2
    //             if (this.activePlayer !== player2) {
    //                 this.activePlayer = player2;
    //             }
    //             return true;
    //         }
    //     }

    //     return false;
    // }

    // setupBonusActions() {
    //     const player1 = this.game.initiativePlayer;
    //     const player2 = player1.opponent;
    //     let p1ActionsPostWindow = player1.sumEffects(EffectName.AdditionalActionAfterWindowCompleted);
    //     let p2ActionsPostWindow = player2.sumEffects(EffectName.AdditionalActionAfterWindowCompleted);

    //     this.bonusActions = {
    //         [player1.uuid]: {
    //             actionCount: p1ActionsPostWindow,
    //             actionsTaken: false
    //         },
    //         [player2.uuid]: {
    //             actionCount: p2ActionsPostWindow,
    //             actionsTaken: false
    //         },
    //     };

    //     return p1ActionsPostWindow + p2ActionsPostWindow > 0;
    // }

    // teardownBonusActions() {
    //     this.bonusActions = undefined;
    // }
}
