import Effect from '../effect/Effect';
import { TriggeredAbilityWindow } from './abilityWindow/TriggeredAbilityWindow';

// TODO: this is temporarily offline while testing the new ability window type
export class SimultaneousEffectWindow extends TriggeredAbilityWindow {
    // constructor(game) {
    //     super(game, 'delayedeffects');
    // }

    // override addToWindow(choice: Effect) {
    //     this.assertWindowResolutionNotStarted('effect', choice.source);

    //     if (!choice.condition) {
    //         choice.condition = () => true;
    //     }
    //     this.unresolved.push(choice);
    // }

    // /** @override */
    // filterChoices() {
    //     const choices = this.unresolved.filter((choice) => choice.condition());
    //     if (choices.length === 0) {
    //         return true;
    //     }
    //     if (choices.length === 1 || !this.currentlyResolvingPlayer.optionSettings.orderForcedAbilities) {
    //         this.resolveEffect(choices[0]);
    //     } else {
    //         this.promptBetweenChoices(choices);
    //     }
    //     return false;
    // }

    // promptBetweenChoices(choices) {
    //     this.game.promptWithHandlerMenu(this.currentlyResolvingPlayer, {
    //         source: 'Order Simultaneous effects',
    //         activePromptTitle: 'Choose an effect to be resolved',
    //         waitingPromptTitle: 'Waiting for opponent',
    //         choices: _.map(choices, (choice) => choice.title),
    //         handlers: _.map(choices, (choice) => (() => this.resolveEffect(choice)))
    //     });
    // }

    // resolveEffect(choice) {
    //     this.choices = this.choices.filter((c) => c !== choice);
    //     choice.handler();
    // }
}
