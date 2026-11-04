import type { AbilityContext } from '../ability/AbilityContext';
import { DamageType, EventName } from '../Constants';
import { DefenderDamageTiming, type Attack } from './Attack';
import { BaseStepWithPipeline } from '../gameSteps/BaseStepWithPipeline';
import { SimpleStep } from '../gameSteps/SimpleStep';
import { EnumHelpers } from '../utils/EnumHelpers';
import { GameEvent } from '../event/GameEvent';
import { addAttackLastKnownInformationToEvent, buildAttackLastKnownInformationHandler } from '../event/LastKnownInformation';
import type { Card } from '../card/Card';
import { TriggerHandlingMode } from '../event/EventWindow';
import { DamageSystem } from '../../gameSystems/DamageSystem';
import type { IAttackableCard } from '../card/CardInterfaces';
import { Contract } from '../utils/Contract';
import type { Player } from '../Player';

interface IResolvedDefenderDamageTiming {
    timing: DefenderDamageTiming;

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
            const defenderDamageTimings = this.resolveDefenderDamageTimings(inPlayTargets);

            this.context.game.queueSimpleStep(() => {
                this.logCombatDamageOrder(inPlayTargets, defenderDamageTimings);
                this.queueCombatDamageWindows(inPlayTargets, defenderDamageTimings, directOverwhelmDamageEvent, attackCompleteEvent);
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
    private resolveDefenderDamageTimings(targets: IAttackableCard[]): Map<IAttackableCard, IResolvedDefenderDamageTiming> {
        const timings = new Map<IAttackableCard, IResolvedDefenderDamageTiming>();

        for (const target of targets) {
            const timing = this.attack.getDefenderDamageTiming(target);

            if (timing === DefenderDamageTiming.Conflict) {
                this.promptForDamageOrder(target, (chosenTiming, choosingPlayer) => timings.set(target, { timing: chosenTiming, choosingPlayer }));
            } else {
                timings.set(target, { timing });
            }
        }

        return timings;
    }

    private promptForDamageOrder(target: IAttackableCard, onChosen: (timing: DefenderDamageTiming, choosingPlayer: Player) => void): void {
        const choosingPlayer = this.game.getActivePlayer();

        this.game.promptWithHandlerMenu(choosingPlayer, {
            activePromptTitle: `Choose whether the attacker (${this.attack.attacker.title}) or the defender (${target.title}) deals combat damage first`,
            waitingPromptTitle: 'Waiting for opponent to choose which unit deals combat damage first',
            choices: ['Attacker deals damage first', 'Defender deals damage first'],
            handlers: [
                () => onChosen(DefenderDamageTiming.AfterAttacker, choosingPlayer),
                () => onChosen(DefenderDamageTiming.BeforeAttacker, choosingPlayer)
            ]
        });
    }

    /**
     * Logs the combat damage order for each defender that does not deal damage at the same time as the attacker,
     * including the player who chose the order if it was chosen.
     */
    private logCombatDamageOrder(targets: IAttackableCard[], timings: Map<IAttackableCard, IResolvedDefenderDamageTiming>): void {
        const attacker = this.attack.attacker;

        for (const target of targets) {
            const { timing, choosingPlayer } = timings.get(target);

            if (timing === DefenderDamageTiming.WithAttacker) {
                continue;
            }

            const [firstUnit, secondUnit] = timing === DefenderDamageTiming.AfterAttacker
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
        defenderDamageTimings: Map<IAttackableCard, IResolvedDefenderDamageTiming>,
        directOverwhelmDamageEvent: GameEvent | null,
        attackCompleteEvent: GameEvent
    ): void {
        const defendersWithTiming = (timing: DefenderDamageTiming) =>
            inPlayTargets.filter((target) => defenderDamageTimings.get(target)?.timing === timing);

        const defendersBeforeAttacker = defendersWithTiming(DefenderDamageTiming.BeforeAttacker);
        const defendersWithAttacker = defendersWithTiming(DefenderDamageTiming.WithAttacker);
        const defendersAfterAttacker = defendersWithTiming(DefenderDamageTiming.AfterAttacker);

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
        const combatDamage = this.attack.getAttackerCombatDamage(this.context);

        if (combatDamage === null) {
            return null;
        }

        const attackerDamageEvent = new DamageSystem({
            type: DamageType.Combat,
            amount: combatDamage,
            sourceAttack: this.attack,
            target: target
        }).generateEvent(this.context);

        if (this.attack.hasOverwhelm()) {
            attackerDamageEvent.setContingentEventsGenerator((event) => {
                const attackTarget: Card = event.card;

                if (!attackTarget.isUnit() || event.damage <= attackTarget.remainingHp) {
                    return [];
                }

                const overwhelmSystem = new DamageSystem({
                    type: DamageType.Overwhelm,
                    contingentSourceEvent: attackerDamageEvent,
                    sourceAttack: this.attack,
                    target: event.card.controller.base
                });

                return [overwhelmSystem.generateEvent(this.context)];
            });
        }

        return attackerDamageEvent;
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
