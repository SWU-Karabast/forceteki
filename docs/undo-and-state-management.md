# Undo and State Management
To enable Undo, we're going with a state snapshot design. State Snapshot means we capture any and all mutable state within the game so we can make copies, and then when we need to we can rollback to those copies.

This design could eventually be switched to be input based (we only record player actions) which is much smaller. However starting with State Snapshot opens up the door to other options as well.

The goals are as follows:
 * Enable undo
 * Keep undo functionality as isolated from the development of cards as possible
 * 

### What is State
There are 2 kinds of data we need to deal with, "state" and "settings". State is mutable data on classes, IE damage, controller, etc. This is data that can change during the lifetime and needs to be able to be rolled back to a prior state. Settings are fixed data that is assigned once when the object is created and never changed, either in the constructor or shortly thereafter, such as printed HP, owner, title, etc. Because settings don't change for the whole game, they don't need to be captured in the state for rollback, they should be deterministic for a given implementation, and can remain as properties on the class. An easy way to tell if a property is a "setting" is if to check if you can make the property readonly. If it can, it is absolutely a setting.

The goal is to have any and all state moved to an internal "state" object within each class, which is a part of the new GameObjectBase class (which I'll just refer to as GameObject), while settings can remain as as properties on the class itself. By have it all on a single object, it simplifies the process of actually taking snapshots and and rolling back to simply `const rollbackState = copy(gameObject.state)` and `gameObject.state = copy(rollbackState)`.

On the TS side, GameObject takes a generic argument that is used to extend the definition of the properties of the state object. Each class can create it's own interface that extends IGameObjectBaseState, add in their own properties necessary, and pass it down to GameObject. That class can also then include a generic argument, which could be an extension of it's own state interface. This allows for each class in the hierarchy to extend the defintion of state. Below is a simplified example.

```ts
export interface ICardState extends IGameObjectState { controller?: GameObjectRef<Player>, damage: number }

// require anything that is extending Card to extend ICardState as well, and default the state to ICardState if no further extension is required.
export class Card<T extends ICardState = ICardState> extends GameObject<T> { ... }

// ...Elsewhere
export interface IGameObjectState extends IGameObjectBaseState {
    id: string;
    nameField: string;
}

export abstract class GameObject<T extends IGameObjectState = IGameObjectState> extends GameObjectBase<T> { ... }
```
I could get in to the weeds about the default arguments, why we're extending this way, how you set defaults for properties on state, but that can be saved for another writeup. Best to go look at the GameObjectBase class first and get a feel for it, and then come and ask questions.

Now, for the time being I am enforcing a rule that when copying the state object to take a snapshot, the copying must done via structuredClone alone rather than any customization or on a class-by-class basis. This are for two reasons, the first is to prevent keeping references, as structuredClone makes deep copies. I'll talk about why in a later section. The other is to encourage the low-level devs working with state to try and isolate direct state manipulation away from the higher devs. mid-level or higher devs who aren't adding any new state properties but are just using existing state should never have to call `this.state.xxx`. Instead, the low-level devs should be writing accessors for the higher-level devs to update state indirectly, as I'll describe in the following section.

### The GameObject
GameObjectBase is the base class for any class that can contain state, or is otherwise referenced by the state of another derived GameObject (with a couple of exceptions). The GameObject always registers itself with the Game.js object and is given a unique ID, and is added to a master list of GameObjects that can be looked up. 

This unique ID is how we handle a reference in a state to other GameObject state. We don't want to keep direct references to classes in state, because classes can't be copied properly via structuredClone. Instead, GameObject can return a ref object, `const controllerRef = controller.getRef()`, which is a simple object containing the ID of said GameObject, referred to as a GameObjectRef. That ID object can then be used to lookup the reference to the gameObject from the master list in game, `const controller = this.game.getFromRef(this.state.controllerRef)`. 

`Game.getFromRef` here uses a simple dictionary, so the lookup is O(1). If you pass in a null/undefined object, it'll simply return null/undefined back. This passback was intentional so that I could easily drop-in replace existing references with this.game.getFromRef and only have to null check the output. That said, while the function has a "null returns null" logic, if you pass it a valid object and it fails to find it via the ID, it will throw an error, and a harsh one. Because the whole logic is self-contained within the app, it isn't ps

Now, we want calls directly to the state object to be isolated from card development. Someone building a card should never have to write `condition: (source, target) => this.game.getFromRef(source.state.controllerRef) === this.game.getFromRef(target.state.controllerRef)`. That's too verbose, and is just another layer of complexity that can cause confusion for them. So for state we use get/set accessors on the class to hide the complexity away from the card implementation. Here's an example for controller that would be added to the Card class:

```ts
public get controller(): Player {
	return this.game.getFromRef(this.state.controller);
}

public set controller(value: Player) {
	this.state.controller = value?.getFromRef();
}
```

With this, we now hide the lookup behind the accessors, and can reduce the above condition code to back to simply `(source, target) => source.controller === target.controller`. This allows for devs building cards to be completely unaware of how state works, and it can help cut down on the steps to change state.  For simple state such as numbers and strings it can be a little overkill, IE damage, but it hopefully encourages low-level devs to be more intentional with how accessible they want state to be accesed by outside callers, or even within in the class hierarchy.

### Why Copy via structuredClone?
You may see GameObjectRef and the usage of structuredClone and ask why not just keep references on the state object? We could do `Object.assign({}, card.state)` instead of `structuredClone(card.state)` and just make copies of the simple state while keeping any references as-is, as each GameObject being referenced will maintain their own state thereby eliminating the need for GameObjectRef. Technically this would work, and with the current design goal of "in-match rollback only" this wouldn't be bad either. There are a few reasons:
 * We're future-proofing for save/load. There's no way to keep references directly in JSON, so we'll need a design that can maintain references when moving between JS and JSON. By using GameObjectRef and doing the lookup to the master list on demand, we no longer need to worry about any special handling to "rewire" all of the objects when we go to rebuild the classes from JSON; they're all just ID lookups that happen at the time they are needed. The different derived GameObjects can then be recreated without needing any outside information (outside of the settings), and then they'll be added back to the master list on creation before any lookup needs to occur.
   * There is still work to do here, we would need to track some kind of state to be able to determine how to recreate a given state's class, but this is a big step towards the whole idea.
 * It enforces a consistent design pattern, if a little more work to setup. Everything on the state object must be a complete copy, there's no confusion on if a object within the state is a reference to an object that exists outside of that class, or is simply a nested state object. In C# terms, it's roughly like ensuring only value types or structs are used with the state object.

 structuredClone itself is not the fastest copy method, and it could likely be swapped out for a different method or a package. The main benefit for now is using it to enforce good copying.