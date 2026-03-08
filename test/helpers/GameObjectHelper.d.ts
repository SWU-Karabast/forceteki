type Game = import('../../server/game/core/Game');
type GameObjectBase = import('../../server/game/core/GameObjectBase').GameObjectBase;

interface ITestGameObject extends GameObjectBase {
    initializedWith: string | null;
    initializeCallCount: number;
}

interface IParentGameObject extends GameObjectBase {
    parentInitializeCallCount: number;
}

interface IChildGameObject extends IParentGameObject {
    childInitializeCallCount: number;
    initializedWith: string | null;
}

declare const gameObjectHelper: {
    createMockGame: () => { game: Game; registered: GameObjectBase[] };
    createUndecoratedGameObjectClass: () => new (game: Game) => GameObjectBase;
    TestGameObject: new (game: Game, initializedValue: string) => ITestGameObject;
    ParentGameObject: new (game: Game) => IParentGameObject;
    ChildGameObject: new (game: Game, childConstructorValue: string) => IChildGameObject;
};
