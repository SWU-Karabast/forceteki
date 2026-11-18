import type { AbilityContext } from '../ability/AbilityContext';
import { DamageType, EventName } from '../Constants';
import { RelativeDamageTiming, type Attack } from './Attack';
import { BaseStepWithPipeline } from '../gameSteps/BaseStepWithPipeline';
import { SimpleStep } from '../gameSteps/SimpleStep';
import { EnumHelpers } from '../utils/EnumHelpers';
import { GameEvent } from '../event/GameEvent';
import { addAttackLastKnownInformationToEvent, buildAttackLastKnownInformationHandler } from '../event/LastKnownInformation';
import { TriggerHandlingMode } from '../event/EventWindow';
import { DamageSystem } from '../../gameSystems/DamageSystem';
import type { IAttackableCard } from '../card/CardInterfaces';
import { Contract } from '../utils/Contract';
import type { Player } from '../Player';
import { createAttackerCombatDamageEvent } from './AttackHelpers';

interface IResolvedRelativeDamageTiming {
    timing: RelativeDamageTiming;

    /** The player who chose this timing, if effects conflicted on which unit deals combat damage first */
    choosingPlayer?: Player;
}

export class AttackFlow extends BaseStepWithPipeline {
    private context: AbilityContext;
    private attack: Attack;
    private onAttackDeclared?: () => void;

    public constructor(
        context: AbilityContext,
        attack: Attack,
        onAttackDeclared?: () => void
    ) {
        super(context.game);

        this.context = context;
        this.attack = attack;
        this.onAttackDeclared = onAttackDeclared;

        this.pipeline.initialise([
            new SimpleStep(this.game, () => this.declareAttack(), 'declareAttack'),
            new SimpleStep(this.game, () => this.dealDamageAndCompleteAttack(), 'dealDamageAndCompleteAttack'),
            new SimpleStep(this.game, () => this.cleanUpAttack(), 'cleanUpAttack'),
            new SimpleStep(this.game, () => this.game.resolveGameState(true), 'resolveGameState')
        ]);
    }

    private setCurrentAttack() {
        this.attack.attacker.setActiveAttack(this.attack);
        this.attack.getAllTargets().forEach((target) => target.setActiveAttack(this.attack));
        this.attack.previousAttack = this.game.currentAttack;
        this.game.currentAttack = this.attack;
        this.game.resolveGameState(true);
    }

    private declareAttack() {
        const declareAttackEvent = new GameEvent(
            EventName.OnAttackDeclared,
            this.context,
            { attack: this.attack }
        );

        // Capture the attacker and defender's LKI on the event itself, before any "On Attack" / "On Defense"
        // abilities can mutate or defeat the attacker. Read by triggers that resolve during the
        // OnAttackDeclared window (e.g. Kragan Gorr's target resolver).
        const captureLastKnownInformation = buildAttackLastKnownInformationHandler(this.attack);

        declareAttackEvent.setPreResolutionEffect((event) => {
            this.setCurrentAttack();
            captureLastKnownInformation(event);
            this.onAttackDeclared?.();
        });

        this.context.game.openEventWindow([declareAttackEvent], TriggerHandlingMode.ResolvesTriggers);
    }

    private dealDamageAndCompleteAttack(): void {
        const attackCompleteEvent = new GameEvent(
            EventName.OnAttackEnd,
            this.context,
            { attack: this.attack }
        );

        // ensure that this resolves after the damage events
        attackCompleteEvent.order = 1;

        const dealDamageEvent = this.context.game.createEventAndOpenWindow(
            EventName.OnAttackDamageResolved,
            this.context,
            { attack: this.attack },
            TriggerHandlingMode.ResolvesTriggers,
            () => this.dealDamage(attackCompleteEvent)
        );

        // Capture the attacker and defender's LKI on the OnAttackDamageResolved event, which resolves before the OnAttackEnd event.
        // Read by triggers that resolve during the OnAttackDamageResolved window that may need to reference information from before
        // the attacker was defeated in combat
        addAttackLastKnownInformationToEvent(dealDamageEvent, this.attack);
    }

    private dealDamage(attackCompleteEvent: GameEvent): void {
        if (!this.attack.isAttackerLegal()) {
            this.context.game.addMessage('The attack does not resolve because the attacker is no longer valid');
            return;
        }

        const legalTargets = this.attack.getLegalTargets();

        if (legalTargets.length === 0) {
            this.context.game.addMessage('The attack does not resolve because there is no longer a legal target');
            return;
        }

        // Capture the attacker and defender's LKI on the OnAttackEnd event just before combat damage events
        // resolve. Read by triggers that resolve after attack ends and may need to reference information
        // from before the attacker was defeated in combat (e.g. Whistling Birds).
        addAttackLastKnownInformationToEvent(attackCompleteEvent, this.attack);

        const inPlayTargets = [];
        let directOverwhelmDamage = 0;

        // Handle any targets that left play
        for (const target of legalTargets) {
            if (this.attack.isTargetStillInPlay(target)) {
                // Do nothing - normal attacks
                inPlayTargets.push(target);
            } else if (this.attack.hasOverwhelm()) {
                // This target is no longer in play
                directOverwhelmDamage += this.attack.getAttackerCombatDamage(this.context);
            }
        }

        // TSTODO: This will need to be updated to account for attacking units owned by different opponents
        const targetControllerBase = this.attack.getDefendingPlayer().base;

        const directOverwhelmDamageEvent = directOverwhelmDamage > 0
            ? new DamageSystem({
                type: DamageType.Overwhelm,
                amount: directOverwhelmDamage,
                sourceAttack: this.attack,
                target: targetControllerBase
            }).generateEvent(this.context)
            : null;

        if (inPlayTargets.length > 0) {
            const relativeDamageTimings = this.resolveRelativeDamageTimings(inPlayTargets);

            this.context.game.queueSimpleStep(() => {
                this.logCombatDamageOrder(inPlayTargets, relativeDamageTimings);
                this.queueCombatDamageWindows(inPlayTargets, relativeDamageTimings, directOverwhelmDamageEvent, attackCompleteEvent);
            }, 'queue combat damage windows');
        } else if (directOverwhelmDamageEvent !== null) {
            this.context.game.openEventWindow([directOverwhelmDamageEvent, attackCompleteEvent]);
        } else {
            // Every legal target has left play (e.g. defeated by a debuff from "While this unit
            // is attacking..." abilities) and the attacker has no Overwhelm to redirect damage
            // to the base, so no combat damage will be dealt.
            this.context.game.addMessage('The attack does not resolve because there is no longer a legal target');
            this.context.game.openEventWindow(attackCompleteEvent);
        }
    }

    /**
     * Determines when each target deals combat damage relative to the attacker. If effects conflict on who
     * deals damage first (e.g. both units have "deals combat damage after the other unit"), the active player
     * is prompted to choose. The returned map is populated by the time the next queued step runs.
     */
    private resolveRelativeDamageTimings(targets: IAttackableCard[]): Map<IAttackableCard, IResolvedRelativeDamageTiming> {
        const timings = new Map<IAttackableCard, IResolvedRelativeDamageTiming>();

        for (const target of targets) {
            const timing = this.attack.getRelativeDamageTiming(target);

            if (timing === RelativeDamageTiming.Conflict) {
                this.promptForDamageOrder(target, (chosenTiming, choosingPlayer) => timings.set(target, { timing: chosenTiming, choosingPlayer }));
            } else {
                timings.set(target, { timing });
            }
        }

        return timings;
    }

    private promptForDamageOrder(target: IAttackableCard, onChosen: (timing: RelativeDamageTiming, choosingPlayer: Player) => void): void {
        const choosingPlayer = this.game.getActivePlayer();

        this.game.promptWithHandlerMenu(choosingPlayer, {
            activePromptTitle: 'Multiple abilities conflict over combat damage timing. Choose which unit deals combat damage first:',
            waitingPromptTitle: 'Waiting for opponent to choose which unit deals combat damage first',
            choices: [`${this.attack.attacker.title} (attacker)`, `${target.title} (defender)`],
            handlers: [
                () => onChosen(RelativeDamageTiming.AttackerBeforeDefender, choosingPlayer),
                () => onChosen(RelativeDamageTiming.DefenderBeforeAttacker, choosingPlayer)
            ]
        });
    }

    /**
     * Logs the combat damage order for each defender that does not deal damage at the same time as the attacker,
     * including the player who chose the order if it was chosen.
     */
    private logCombatDamageOrder(targets: IAttackableCard[], timings: Map<IAttackableCard, IResolvedRelativeDamageTiming>): void {
        const attacker = this.attack.attacker;

        for (const target of targets) {
            const { timing, choosingPlayer } = timings.get(target);

            if (timing === RelativeDamageTiming.Simultaneous) {
                continue;
            }

            const [firstUnit, secondUnit] = timing === RelativeDamageTiming.AttackerBeforeDefender
                ? [{ card: attacker, role: 'attacker' }, { card: target, role: 'defender' }]
                : [{ card: target, role: 'defender' }, { card: attacker, role: 'attacker' }];

            if (choosingPlayer) {
                this.game.addMessage(
                    `{0} chooses for {1} (${firstUnit.role}) to deal combat damage before {2} (${secondUnit.role})`,
                    choosingPlayer,
                    firstUnit.card,
                    secondUnit.card
                );
            } else {
                this.game.addMessage(
                    `{0} (${firstUnit.role}) deals combat damage before {1} (${secondUnit.role})`,
                    firstUnit.card,
                    secondUnit.card
                );
            }
        }
    }

    /**
     * Queues up to three windows of combat damage: defenders that deal damage before the attacker, then the attacker
     * along with any defenders dealing damage at the same time, then defenders that deal damage after the attacker.
     * The attack ends in the same window as the final combat damage.
     */
    private queueCombatDamageWindows(
        inPlayTargets: IAttackableCard[],
        relativeDamageTimings: Map<IAttackableCard, IResolvedRelativeDamageTiming>,
        directOverwhelmDamageEvent: GameEvent | null,
        attackCompleteEvent: GameEvent
    ): void {
        const defendersWithTiming = (timing: RelativeDamageTiming) =>
            inPlayTargets.filter((target) => relativeDamageTimings.get(target)?.timing === timing);

        const defendersBeforeAttacker = defendersWithTiming(RelativeDamageTiming.DefenderBeforeAttacker);
        const defendersWithAttacker = defendersWithTiming(RelativeDamageTiming.Simultaneous);
        const defendersAfterAttacker = defendersWithTiming(RelativeDamageTiming.AttackerBeforeDefender);

        Contract.assertTrue(
            defendersBeforeAttacker.length + defendersWithAttacker.length + defendersAfterAttacker.length === inPlayTargets.length,
            'Combat damage timing was not resolved for every attack target'
        );

        const damageWindows: (() => GameEvent[])[] = [];

        if (defendersBeforeAttacker.length > 0) {
            damageWindows.push(() => this.createDefenderDamageEvents(defendersBeforeAttacker));
        }

        damageWindows.push(() => {
            const events = this.attack.isAttackerLegal()
                ? [
                    ...(directOverwhelmDamageEvent === null ? [] : [directOverwhelmDamageEvent]),
                    ...inPlayTargets
                        .filter((target) => this.attack.isTargetStillInPlay(target))
                        .map((target) => this.createAttackerDamageEvent(target))
                        .filter((event) => event !== null)
                ]
                : [];

            return [...events, ...this.createDefenderDamageEvents(defendersWithAttacker)];
        });

        if (defendersAfterAttacker.length > 0) {
            damageWindows.push(() => this.createDefenderDamageEvents(defendersAfterAttacker));
        }

        damageWindows.forEach((createEvents, index) => {
            this.context.game.queueSimpleStep(() => {
                const events = createEvents();
                if (index === damageWindows.length - 1) {
                    events.push(attackCompleteEvent);
                }
                this.context.game.openEventWindow(events);
            }, `combat damage window ${index + 1}`);
        });
    }

    private createAttackerDamageEvent(target: IAttackableCard): GameEvent | null {
        return createAttackerCombatDamageEvent(this.attack, target, this.context);
    }

    /**
     * Create the damage event for the given defenders dealing their combat damage to the attacker, skipping any
     * defenders that have left play. Returns an empty list if there is no damage to deal.
     */
    private createDefenderDamageEvents(defenders: IAttackableCard[]): GameEvent[] {
        if (!this.attack.isAttackerLegal()) {
            return [];
        }

        const defendersInPlay = defenders.filter((target) => !target.isBase() && this.attack.isTargetStillInPlay(target));
        const combatDamage = this.attack.getTargetCombatDamage(this.context, defendersInPlay);

        if (combatDamage === 0) {
            return [];
        }

        return [
            new DamageSystem({
                type: DamageType.Combat,
                amount: combatDamage,
                sourceAttack: this.attack,
                target: this.attack.attacker
            }).generateEvent(this.context)
        ];
    }

    private cleanUpAttack() {
        this.game.ongoingEffectEngine.unregisterOnAttackEffects();

        this.game.currentAttack = this.attack.previousAttack;
        this.checkUnsetActiveAttack(this.attack.attacker);
        this.attack.getAllTargets().forEach((target) => this.checkUnsetActiveAttack(target));
    }

    private checkUnsetActiveAttack(card: IAttackableCard) {
        // isUnit() check needed for pilots that may have become attached during the attack
        if ((EnumHelpers.isArena(card.zoneName) && card.isUnit()) || card.isBase()) {
            card.unsetActiveAttack();
        }
    }
}
