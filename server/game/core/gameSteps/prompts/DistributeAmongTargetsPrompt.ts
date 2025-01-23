import type Game from '../../Game';
import type Player from '../../Player';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import * as Contract from '../../utils/Contract';
import type { IDistributeAmongTargetsPromptData, IDistributeAmongTargetsPromptProperties, IDistributeAmongTargetsPromptResults, IStatefulPromptResults } from '../PromptInterfaces';
import { StatefulPromptType } from '../PromptInterfaces';
import { UiPrompt } from './UiPrompt';
import { PromptType } from '../../Constants';

/**
 * Prompt for distributing healing or damage among target cards.
 * Response data must be returned via {@link Game.statefulPromptResults}.
 *
 * Result will be passed to `properties.resultsHandler`.
 */
export class DistributeAmongTargetsPrompt extends UiPrompt {
    private readonly _activePrompt: IPlayerPromptStateProperties;
    private readonly distributeType: string;

    public constructor(
        game: Game,
        private readonly player: Player,
        private readonly properties: IDistributeAmongTargetsPromptProperties
    ) {
        super(game);

        Contract.assertNonNegative(properties.amount);

        if (!properties.waitingPromptTitle) {
            properties.waitingPromptTitle = 'Waiting for opponent to choose targets for ' + properties.source.name;
        }

        game.getPlayers().forEach((player) => player.clearSelectableCards());

        switch (this.properties.type) {
            case StatefulPromptType.DistributeDamage:
                this.distributeType = 'damage';
                break;
            case StatefulPromptType.DistributeHealing:
                this.distributeType = 'healing';
                break;
            case StatefulPromptType.DistributeExperience:
                this.distributeType = 'experience';
                break;
            default:
                Contract.fail(`Unknown prompt type: ${this.properties.type}`);
        }

        let menuTitle = null;
        if (this.properties.maxTargets) {
            menuTitle = this.properties.maxTargets > 1
                ? `Distribute ${this.properties.amount} ${this.distributeType} up to ${this.properties.maxTargets} targets`
                : `Distribute ${this.properties.amount} ${this.distributeType} to 1 target`;
        } else {
            menuTitle = `Distribute ${this.properties.amount} ${this.distributeType} among targets`;
        }

        const promptData: IDistributeAmongTargetsPromptData = {
            type: this.properties.type,
            amount: this.properties.amount
        };

        const buttons = [{ text: 'Done', arg: 'done', command: 'statefulPromptResults' }];
        if (this.properties.canChooseNoTargets) {
            buttons.push({ text: 'Choose no targets', arg: 'noTargets', command: '' });
        }

        this._activePrompt = {
            menuTitle,
            promptTitle: this.properties.promptTitle || (this.properties.source ? this.properties.source.name : undefined),
            distributeAmongTargets: promptData,
            buttons: buttons,
            promptUuid: this.uuid,
            promptType: PromptType.DistributeAmongTargets
        };
    }

    public override continue() {
        if (!this.isComplete()) {
            this.player.setSelectableCards(this.properties.legalTargets);
        } else {
            this.complete();
        }

        return super.continue();
    }

    public override activeCondition(player) {
        return player === this.player;
    }

    public override activePrompt(): IPlayerPromptStateProperties {
        return this._activePrompt;
    }

    public override waitingPrompt(): IPlayerPromptStateProperties {
        return { menuTitle: this.properties.waitingPromptTitle, promptUuid: this.uuid };
    }

    public override menuCommand(player: Player, arg: string, uuid: string): boolean {
        this.checkPlayerAndUuid(player, uuid);

        if (arg === 'noTargets') {
            this.complete();
            return true;
        }

        Contract.fail(`Unexpected menu command: '${arg}'`);
    }

    public override onStatefulPromptResults(player: Player, results: IStatefulPromptResults, uuid: string): boolean {
        this.checkPlayerAndUuid(player, uuid);
        this.assertPromptResultsValid(player, results);
        this.properties.resultsHandler(results);
        this.complete();

        return true;
    }

    private assertPromptResultsValid(player: Player, results: IStatefulPromptResults): asserts results is IDistributeAmongTargetsPromptResults {
        Contract.assertTrue(results.type === this.properties.type, `Unexpected prompt results type, expected '${this.properties.type}' but received result of type '${results.type}'`);

        const distributedValues = Array.from(results.valueDistribution.values());
        const distributedSum = distributedValues.reduce((sum, curr) => sum + curr, 0);

        Contract.assertNonEmpty(
            distributedValues,
            `Illegal prompt results for '${this._activePrompt.menuTitle}', no targets were selected`
        );

        if (this.properties.canDistributeLess) {
            Contract.assertTrue(
                distributedSum <= this.properties.amount,
                `Illegal prompt results for '${this._activePrompt.menuTitle}', distributed ${this.distributeType} should be less than or equal to ${this.properties.amount} but instead received a total of ${distributedSum}`
            );
        } else {
            Contract.assertTrue(
                distributedSum === this.properties.amount,
                `Illegal prompt results for '${this._activePrompt.menuTitle}', distributed ${this.distributeType} should be equal to ${this.properties.amount} but instead received a total of ${distributedSum}`
            );
        }

        Contract.assertFalse(
            distributedValues.some((value) => value < 0),
            `Illegal prompt results for '${this._activePrompt.menuTitle}', result contained negative values`
        );

        const cardsDistributedTo = Array.from(results.valueDistribution.keys());
        const illegalCardsDistributedTo = cardsDistributedTo.filter((card) => !this.properties.legalTargets.includes(card));

        if (this.properties.maxTargets) {
            Contract.assertFalse(cardsDistributedTo.length > this.properties.maxTargets,
                `Illegal prompt results for '${this._activePrompt.menuTitle}', distributed ${this.distributeType} should be distributed to maximum ${this.properties.maxTargets} targets but instead was distributed to ${cardsDistributedTo.length}`
            );
        }

        Contract.assertFalse(
            illegalCardsDistributedTo.length > 0,
            `Illegal prompt results for '${this._activePrompt.menuTitle}', the following cards were not legal targets for distribution: ${illegalCardsDistributedTo.map((card) => card.internalName).join(', ')}`
        );
    }
}
