import * as fs from 'fs';
import * as path from 'path';
import { cards } from '../../../../server/game/cards/Index';
import { UiPrompt } from '../../../../server/game/core/gameSteps/prompts/UiPrompt';
import { AllPlayerPrompt } from '../../../../server/game/core/gameSteps/prompts/AllPlayerPrompt';
import { DisplayCardPrompt } from '../../../../server/game/core/gameSteps/prompts/DisplayCardPrompt';
import { DisplayCardsBasicPrompt } from '../../../../server/game/core/gameSteps/prompts/DisplayCardsBasicPrompt';
import { PassDelayPrompt } from '../../../../server/game/core/gameSteps/prompts/PassDelayPrompt';
import UndoConfirmationPrompt from '../../../../server/game/core/gameSteps/prompts/UndoConfirmationPrompt';

/**
 * Every concrete UiPrompt subclass states for itself whether completing it is a player decision (UiPrompt.isPlayerDecisionPrompt).
 * Game records the answer per player and SnapshotManager.getQuickRollbackPoint reads it at Regroup/Setup phase boundaries,
 * so a prompt type nobody declared would silently keep the default; this spec turns that into a failure.
 */
interface IClassLike {
    readonly name: string;
    readonly prototype: object;
}

describe('UiPrompt decision declarations', function() {
    // from build/test/server/core/gameSteps: the compiled server this spec runs against
    const serverGameDir = path.resolve(__dirname, '../../../../server/game');
    // from build/test/server/core/gameSteps: the server sources in the repository
    const repoServerGameDir = path.resolve(__dirname, '../../../../../server/game');

    const abstractBases: IClassLike[] = [UiPrompt, AllPlayerPrompt, DisplayCardPrompt];

    function listFiles(dir: string, extensions: string[]): string[] {
        const found: string[] = [];
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                found.push(...listFiles(full, extensions));
            } else if (extensions.some((ext) => entry.name.endsWith(ext) && !entry.name.endsWith('.d.ts'))) {
                found.push(full);
            }
        }
        return found;
    }

    function isPromptSubclass(value: unknown): value is IClassLike {
        return typeof value === 'function' && value !== UiPrompt && value.prototype instanceof UiPrompt;
    }

    /** Every UiPrompt subclass reachable from the loaded server modules, keyed by class name. */
    function discoverRuntimePromptClasses(): Map<string, IClassLike> {
        // the card index loads every card module (including card-local helper classes); the engine step modules are loaded explicitly
        expect(cards.size).toBeGreaterThan(0);
        for (const file of listFiles(path.join(serverGameDir, 'core/gameSteps'), ['.js'])) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            require(file);
        }

        const discovered = new Map<string, IClassLike>();
        for (const [filename, cachedModule] of Object.entries(require.cache)) {
            if (!path.resolve(filename).startsWith(serverGameDir) || !cachedModule?.exports) {
                continue;
            }

            const exported = cachedModule.exports;
            for (const value of [exported, ...Object.values(exported)]) {
                if (isPromptSubclass(value)) {
                    discovered.set(value.name, value);
                }
            }
        }

        return discovered;
    }

    /** Names of concrete classes (not the named abstract bases) that inherit the declaration instead of stating their own. */
    function findUndeclaredPromptClasses(classes: IClassLike[]): string[] {
        return classes
            .filter((cls) => !abstractBases.includes(cls))
            .filter((cls) => !Object.prototype.hasOwnProperty.call(cls.prototype, 'isPlayerDecisionPrompt'))
            .map((cls) => cls.name)
            .sort();
    }

    /** Names of every class in the server sources whose `extends` chain reaches UiPrompt, computed from the source text. */
    function discoverSourcePromptClassNames(): string[] {
        const parentByClass = new Map<string, string>();
        const classDeclaration = /^\s*(?:export\s+)?(?:default\s+)?(?:abstract\s+)?class\s+(\w+)(?:<[^>{]*>)?\s+extends\s+(\w+)/gm;

        for (const file of listFiles(repoServerGameDir, ['.ts', '.js'])) {
            const text = fs.readFileSync(file, 'utf8');
            for (const match of text.matchAll(classDeclaration)) {
                parentByClass.set(match[1], match[2]);
            }
        }

        const reachesUiPrompt = (name: string): boolean => {
            const seen = new Set<string>();
            let current = parentByClass.get(name);
            while (current != null && !seen.has(current)) {
                if (current === 'UiPrompt') {
                    return true;
                }
                seen.add(current);
                current = parentByClass.get(current);
            }
            return false;
        };

        return [...parentByClass.keys()].filter(reachesUiPrompt).sort();
    }

    it('every concrete prompt class states its own answer', function() {
        const discovered = discoverRuntimePromptClasses();

        // non-vacuity: the discovery really found the prompt classes
        for (const known of ['HandlerMenuPrompt', 'UndoConfirmationPrompt', 'DisplayCardsBasicPrompt', 'SelectCardPrompt', 'TriggeredAbilityResolutionPrompt']) {
            expect(discovered.has(known))
                .withContext(known)
                .toBeTrue();
        }

        const undeclared = findUndeclaredPromptClasses([...discovered.values()]);

        expect(undeclared)
            .withContext('prompt classes that inherit the default instead of declaring isPlayerDecisionPrompt')
            .toEqual([]);
    });

    it('the prompt classes found in the source text match the ones loaded at runtime', function() {
        const runtimeNames = [...discoverRuntimePromptClasses().keys()].sort();

        expect(discoverSourcePromptClassNames()).toEqual(runtimeNames);
    });

    it('answers false for the view-only, masking and undo-confirmation prompts', function() {
        expect(DisplayCardsBasicPrompt.prototype.isPlayerDecisionPrompt()).toBeFalse();
        expect(PassDelayPrompt.prototype.isPlayerDecisionPrompt()).toBeFalse();
        expect(UndoConfirmationPrompt.prototype.isPlayerDecisionPrompt()).toBeFalse();
    });

    it('the checker reports a class that only inherits and accepts one that states its answer', function() {
        class InheritsOnly extends DisplayCardsBasicPrompt {}

        class StatesAnswer extends DisplayCardsBasicPrompt {
            public override isPlayerDecisionPrompt(): boolean {
                return true;
            }
        }

        expect(findUndeclaredPromptClasses([InheritsOnly, StatesAnswer, DisplayCardsBasicPrompt])).toEqual(['InheritsOnly']);
    });
});
