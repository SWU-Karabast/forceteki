describe('GameObjectBase initialization', function() {
    it('calls onInitialize exactly once after constructor state is set', function() {
        const { game } = gameObjectHelper.createMockGame();
        const gameObject = new gameObjectHelper.TestGameObject(game, 'ready');

        expect(gameObject.initialized).toBeTrue();
        expect(gameObject.initializeCallCount).toBe(1);
        expect(gameObject.initializedWith).toBe('ready');
    });

    it('throws when initialize is called a second time', function() {
        const { game } = gameObjectHelper.createMockGame();
        const gameObject = new gameObjectHelper.TestGameObject(game, 'ready');

        expect(() => gameObject.initialize()).toThrowError(/already initialized/i);
    });

    it('initializes only once at the most-derived class boundary', function() {
        const { game } = gameObjectHelper.createMockGame();
        const gameObject = new gameObjectHelper.ChildGameObject(game, 'derived-ready');

        expect(gameObject.parentInitializeCallCount).toBe(1);
        expect(gameObject.childInitializeCallCount).toBe(1);
        expect(gameObject.initializedWith).toBe('derived-ready');
    });

    it('throws for classes missing @registerState', function() {
        const UndecoratedGameObject = gameObjectHelper.createUndecoratedGameObjectClass();
        const { game } = gameObjectHelper.createMockGame();
        expect(() => new UndecoratedGameObject(game)).toThrowError(/missing @registerState/i);
    });
});
