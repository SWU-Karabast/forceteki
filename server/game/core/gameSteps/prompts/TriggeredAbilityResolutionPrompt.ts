import type { Player } from '../../Player';
import type { Game } from '../../Game';
import { OngoingEffectSource } from '../../ongoingEffect/OngoingEffectSource';
import { PromptType, type IResolutionChoice, type ITriggerWindowButton } from '../PromptInterfaces';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import { UiPrompt } from './UiPrompt';

export class TriggeredAbilityResolutionPrompt extends UiPrompt {
    private readonly source = new OngoingEffectSource(this.game, 'Choose Triggered Ability Resolution Order');
    private readonly player: Player;
    private readonly choices: IResolutionChoice[];

    public constructor(
        game: Game,
        player: Player,
        choices: IResolutionChoice[]
    ) {
        super(game);

        this.player = player;

        // sort so that choices that can actually do something are presented first
        this.choices = [...choices].sort((a, b) => {
            const aHasLegalEffects = a.hasLegalEffects();
            const bHasLegalEffects = b.hasLegalEffects();
            if (aHasLegalEffects && !bHasLegalEffects) {
                return -1;
            } else if (!aHasLegalEffects && bHasLegalEffects) {
                return 1;
            }
            return 0;
        });
    }

    public override activeCondition(player: Player): boolean {
        return player === this.player;
    }

    public override activePromptInternal(): IPlayerPromptStateProperties {
        const buttons = this.choices.map((choice, index) => this.makeChoiceButton(choice, index));

        return {
            menuTitle: 'You have multiple triggers to resolve. Choose which to resolve first:',
            buttons,
            promptTitle: this.source.name,
            promptUuid: this.uuid,
            promptType: PromptType.TriggerWindow
        };
    }

    private makeChoiceButton(choice: IResolutionChoice, num: number): ITriggerWindowButton {
        const hasLegalEffects = choice.hasLegalEffects();

        // Keep the "(No effect)" prefix for tests so it's easy to tell which abilities have no effect
        const noEffectPrefix = process.env.NODE_ENV === 'test' && !hasLegalEffects ? '(No effect) ' : '';
        const title = `${noEffectPrefix}${choice.getTitle()}`;

        return {
            text: title,
            arg: num.toString(),
            sourceCard: choice.getSourceCard(),
            hasLegalEffects,
            count: choice.count,
            // Optional triggers whose owner is the resolving player expose an inline Pass so the player can
            // decline without a follow-up interstitial; clicking the card itself triggers the ability.
            optional: choice.optional != null,
            passArg: choice.optional != null ? `pass${num}` : undefined,
            passText: choice.optional?.passButtonText
        };
    }

    public override waitingPrompt(): IPlayerPromptStateProperties {
        return {
            menuTitle: 'Waiting for opponent',
            promptUuid: this.uuid
        };
    }

    public override menuCommand(_player: Player, arg: string): boolean {
        if (arg === 'cancel') {
            this.complete();
            return true;
        }

        // Inline-optional choices decline via a `pass<index>` arg; the plain index arg triggers the choice.
        const isPass = arg.startsWith('pass');
        const selectedIndex = Number(isPass ? arg.slice('pass'.length) : arg);
        const choice = this.choices[selectedIndex];

        if (!choice) {
            return false;
        }

        if (isPass) {
            if (!choice.optional) {
                return false;
            }
            choice.optional.onPass();
        } else if (choice.optional) {
            choice.optional.onTrigger();
        } else {
            choice.handler();
        }

        this.complete();
        return true;
    }
}
