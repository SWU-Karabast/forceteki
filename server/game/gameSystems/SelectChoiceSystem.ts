import type { AbilityContext } from '../core/ability/AbilityContext';
import { SelectChoice } from '../core/ability/abilityTargets/SelectChoice';
import { SelectTargetResolver } from '../core/ability/abilityTargets/SelectTargetResolver';
import type { MsgArg } from '../core/chat/GameChat';
import { GameStateChangeRequired, MetaEventName, RelativePlayer, TargetMode } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import { AggregateSystem } from '../core/gameSystem/AggregateSystem';
import type { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import type { GameObject } from '../core/GameObject';
import type { Player } from '../core/Player';
import { EnumHelpers } from '../core/utils/EnumHelpers';
import type { IChoicesInterface, ISelectTargetResolver } from '../TargetInterfaces';

export type ISelectChoiceProperties<TContext extends AbilityContext = AbilityContext> = IGameSystemProperties
  & Omit<ISelectTargetResolver<TContext>, 'mode' | 'choices' | 'immediateEffect' | 'condition' | 'dependsOn' | 'checkTarget' | 'mustChangeGameState'>
  & {

      /**
       * Map of prompt button text to the system that is executed if that button is chosen.
       * Use the system's property factory if the choices depend on the context.
       */
      choices: IChoicesInterface<TContext>;
      name?: string;
  };

/**
 * A wrapper system for prompting the player to pick one of several systems to execute.
 * Functions the same as a {@link TargetMode.Select} target resolver: the player is shown one button per choice
 * that would have a legal target (auto-resolving if there is only one), and the chosen button text is written to
 * `context.selects[name]` (and to `context.select` if `name` is `'target'`, the default) before the chosen system executes.
 *
 * Use this instead of a `chooseModalEffects` system when the card text is a plain choice rather than a modal ("Choose one -") card.
 */
export class SelectChoiceSystem<TContext extends AbilityContext = AbilityContext> extends AggregateSystem<TContext, ISelectChoiceProperties<TContext>> {
    public override readonly name: string = 'selectChoice';
    public override readonly effectDescription: string = 'choose an option';
    public override readonly eventName = MetaEventName.SelectChoice;
    protected override readonly defaultProperties: Partial<ISelectChoiceProperties<TContext>> = {
        name: 'target',
    };

    public override getInnerSystems(properties: ISelectChoiceProperties<TContext>): GameSystem<TContext>[] {
        return Object.values(properties.choices);
    }

    public override canAffectInternal(target: GameObject | GameObject[], context: TContext, additionalProperties: Partial<ISelectChoiceProperties<TContext>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return Object.keys(properties.choices).some((choice) =>
            properties.choices[choice].canAffect(target, this.getCandidateContext(context, properties, choice), additionalProperties, mustChangeGameState)
        );
    }

    public override hasLegalTarget(context: TContext, additionalProperties: Partial<ISelectChoiceProperties<TContext>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return Object.keys(properties.choices).some((choice) =>
            properties.choices[choice].hasLegalTarget(this.getCandidateContext(context, properties, choice), additionalProperties, mustChangeGameState)
        );
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<ISelectChoiceProperties<TContext>> = {}): void {
        // skip the prompt entirely if no choice would change the game state
        if (!this.hasLegalTarget(context, additionalProperties, GameStateChangeRequired.MustFullyOrPartiallyResolve)) {
            return;
        }

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        // clear any stale selection so we can tell below whether a choice was actually made
        context.selects[properties.name] = null;

        const targetResolver = new SelectTargetResolver(properties.name, { ...properties, mode: TargetMode.Select }, context.ability);
        const targetResults = context.ability.getDefaultTargetResults(context, false);
        targetResolver.resolve(context, targetResults);

        context.game.queueSimpleStep(() => {
            const selection = context.selects[properties.name];
            if (targetResults.cancelled || !selection) {
                return;
            }

            const chosenSystem = this.generatePropertiesFromContext(context, additionalProperties).choices[selection.choice];
            this.addChoiceMessage(context, targetResolver.getChoosingPlayer(context), selection.choice, chosenSystem);
            chosenSystem.queueGenerateEventGameSteps(events, context, additionalProperties);
        }, `Execute chosen effect for select choice system "${properties.name}"`);
    }

    public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<ISelectChoiceProperties<TContext>> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const choosingPlayer = typeof properties.choosingPlayer === 'function' ? properties.choosingPlayer(context) : properties.choosingPlayer;

        if ((choosingPlayer ?? RelativePlayer.Self) === EnumHelpers.asRelativePlayer(context.player, player)) {
            return true;
        }

        return Object.values(properties.choices).some((system) => system.hasTargetsChosenByPlayer(context, player, additionalProperties));
    }

    private addChoiceMessage(context: TContext, choosingPlayer: Player, choice: string, chosenSystem: GameSystem<TContext>) {
        context.game.addMessage('{0} chooses "{1}"', choosingPlayer, choice);

        const [effectMessage, effectArgs] = chosenSystem.getEffectMessage(context);
        if (!effectMessage) {
            return;
        }

        const messageArgs: MsgArg[] = [context.player, ' uses ', context.source, ' to ', { format: effectMessage, args: effectArgs }];
        context.game.addMessage(`{${[...Array(messageArgs.length).keys()].join('}{')}}`, ...messageArgs);
    }

    /** A copy of the context with the given choice written in as the selection, for evaluating that choice's legality */
    private getCandidateContext(context: TContext, properties: ISelectChoiceProperties<TContext>, choice: string): TContext {
        const candidateContext = context.copy() as TContext;
        candidateContext.selects[properties.name] = new SelectChoice(choice);
        if (properties.name === 'target') {
            candidateContext.select = choice;
        }
        return candidateContext;
    }
}
