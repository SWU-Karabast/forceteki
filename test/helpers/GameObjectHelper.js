/* global global */

const { GameObjectBase } = require('../../server/game/core/GameObjectBase.js');
const { createGameObject, registerState } = require('../../server/game/core/GameObjectUtils.js');

function applyRegisterState(targetClass) {
    const parentMetadata = Object.getPrototypeOf(targetClass)?.[Symbol.metadata] ?? null;
    const context = {
        metadata: Object.create(parentMetadata)
    };

    return registerState()(targetClass, context);
}

function createGameObjectFactory(targetClass) {
    return class {
        constructor(...args) {
            return createGameObject(targetClass, ...args);
        }
    };
}

class TestGameObject extends GameObjectBase {
    constructor(game, initializedValue) {
        super(game);
        this.initializedValue = initializedValue;
        this.initializedWith = null;
        this.initializeCallCount = 0;
    }

    onInitialize() {
        this.initializeCallCount++;
        this.initializedWith = this.initializedValue;
    }
}

const DecoratedTestGameObject = applyRegisterState(TestGameObject);
const TestGameObjectFactory = createGameObjectFactory(DecoratedTestGameObject);

class ParentGameObject extends GameObjectBase {
    constructor(game) {
        super(game);
        this.parentInitializeCallCount = 0;
    }

    onInitialize() {
        this.parentInitializeCallCount++;
    }
}

const DecoratedParentGameObject = applyRegisterState(ParentGameObject);
const ParentGameObjectFactory = createGameObjectFactory(DecoratedParentGameObject);

class ChildGameObject extends DecoratedParentGameObject {
    constructor(game, childConstructorValue) {
        super(game);
        this.childConstructorValue = childConstructorValue;
        this.childInitializeCallCount = 0;
        this.initializedWith = null;
    }

    onInitialize() {
        super.onInitialize();
        this.childInitializeCallCount++;
        this.initializedWith = this.childConstructorValue;
    }
}

const DecoratedChildGameObject = applyRegisterState(ChildGameObject);
const ChildGameObjectFactory = createGameObjectFactory(DecoratedChildGameObject);

function createUndecoratedGameObjectClass() {
    return class UndecoratedGameObject extends GameObjectBase {
        constructor(game) {
            super(game);
        }
    };
}

function createMockGame() {
    const registered = [];
    const game = {
        gameObjectManager: {
            register: (gameObject) => {
                gameObject.uuid = `MockObject_${registered.length}`;
                registered.push(gameObject);
            }
        }
    };

    return { game, registered };
}

global.gameObjectHelper = {
    createMockGame,
    createUndecoratedGameObjectClass,
    TestGameObject: TestGameObjectFactory,
    ParentGameObject: ParentGameObjectFactory,
    ChildGameObject: ChildGameObjectFactory
};
