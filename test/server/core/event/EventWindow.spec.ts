import { EventWindow, TriggerHandlingMode } from '../../../../server/game/core/event/EventWindow';
import type { Game } from '../../../../server/game/core/Game';

describe('Event window recursion guard', function() {
    it('should stop an automatic loop that never pauses for player input', function() {
        const game = {
            currentEventWindow: null,
            emit: jasmine.createSpy('emit'),
            reportError: (error: Error) => {
                throw error;
            }
        } as unknown as Game;

        const createRecursiveWindow = (): EventWindow => {
            const window = new EventWindow(game, [], TriggerHandlingMode.CannotHaveTriggers);
            window.addPostEventResolutionCallback(() => {
                window.queueStep(createRecursiveWindow());
            });
            return window;
        };

        expect(() => createRecursiveWindow().continue()).toThrowError(/Event window depth has reached 50/);
    });

    it('should stop contingent event generation that never runs out of new events', function() {
        const game = {
            currentEventWindow: null,
            emit: jasmine.createSpy('emit'),
            reportError: (error: Error) => {
                throw error;
            }
        } as unknown as Game;

        const window = new EventWindow(game, [], TriggerHandlingMode.CannotHaveTriggers);

        const createEndlessEvent = () => ({
            name: 'onCardsDrawn',
            canResolve: true,
            isCancelledOrReplaced: false,
            setWindow: () => undefined,
            checkCondition: () => undefined,
            generateReplacementEvents: () => [],
            generateContingentEvents: () => {
                window.addEvent(createEndlessEvent());
                return [];
            }
        });

        window.addEvent(createEndlessEvent());

        expect(() => window.continue()).toThrowError(/Contingent event generation .* has repeated 50 times/);
    });
});
