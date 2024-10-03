# IMPORTANT NOTE: DEPRECATED
All content is being migrated to the [wiki](https://github.com/SWU-Karabast/forceteki/wiki), please use that in the future.

# Writing Card Tests

Unit tests for cards are located in [test/server/cards](../test/server/cards/).

Our policy for this repo is to have at least one unit test in place for each card that requires explicit implementation. The exception is cards which are marked "trivial," i.e., cards that either have no printed text or only have keyword abilities (since those abilities are processed automatically by the engine). All tests are required to pass for any PR to be merged.

The tests do not need to be exhaustive but they should cover at least the basic functionality of each card. There are several reasons for this policy:
- We can have higher confidence that newly-written cards are working correctly
- It makes it easier to enforce a high standard of quality across the repo
- When we have to make bigger changes that may affect a number of cards, it gives us confidence that those cards have not been broken

That said, we the repo maintainers are committed to ensuring that writing tests for new cards is as quick and painless a process as possible so that the burden of this ask is not high. Please reach out to us with feedback if you feel that writing tests could be improved or is becoming an obstacle to your ability to contribute to the repo.

See the [Test Cheat Sheet](./test-cheat-sheet.md) for a reference on various helper utilities used in the test code.

<!-- TODO: fill out this guide -->
**This guide is currently mostly TBD**

## Basic Test Writing

### Setting up tests **(TBD)**

### Using cards in tests
As you can see in the `setupTest` call, cards are added to the scenario using a condensed name format:

```javascript
beforeEach(function () {
    this.setupTest({
        phase: 'action',
        player1: {
            hand: ['clan-wren-rescuer'],
            groundArena: ['wampa'],
        },
        player2: {
            spaceArena: ['cartel-spacer']
        }
    });
});
```

This shortened name is referred to as the "internal name" of the card and also exists on `Card` objects as the `internalName` property. E.g., `ClanWrenRescuer.internalName = clan-wren-rescuer`.

These cards can then be referred to by name in the test cases as properties of the test context `this`:

```javascript
it('should give an experience token to a unit', function () {
    this.player1.clickCard(this.clanWrenRescuer);
    expect(this.player1).not.toHavePassAbilityButton();
    expect(this.player1).toBeAbleToSelectExactly([this.clanWrenRescuer, this.wampa, this.cartelSpacer]);

    this.player1.clickCard(this.clanWrenRescuer);
    expect(this.clanWrenRescuer).toHaveExactUpgradeNames(['experience']);
});
```

In addition, properties will be created for each player's leader and base: `p1Base`, `p2Base`, `p1Leader`, `p2Leader`
```javascript
// testing the Devotion upgrade granting Restore to Wampa
it('should cause the attached card to heal 2 damage from base on attack', function () {
    this.p1Base.damage = 5;

    this.player1.clickCard(this.wampa);

    // this.p1Base and this.p2Base are generated automatically by the test harness
    // (this.p1Leader and this.p2Leader are also available)
    expect(this.p1Base.damage).toBe(3);
    expect(this.p2Base.damage).toBe(5);
    expect(this.wampa.exhausted).toBe(true);
});
```

#### Card Name Rules

Here is a summary of the naming rules and some examples in the table below:

- **Internal name / test string name:** snake-case, with special characters removed and spaces replaced with dashes. The title and subtitle are separated by a '#' character.
- **Test property name(s) (i.e., this.<card>):** camelCase, with all special characters and spaces removed. If the name starts with a number, it will have an underscore '_' as a prefix. If there is a subtitle, two names will be generated - one with just the title and one with title + subtitle.

Examples:

| Printed name | Internal name | Property name |
| ---  | --- | --- |
| Alliance X-Wing | 'alliance-xwing' | this.allianceXwing |
| C-3PO, Protocol Droid  | 'c3po#protocol-droid' | this.c3po, this.c3poProtocolDroid |
| 2-1B Surgical Droid  | '21b-surgical-droid' | this._21bSurgicalDroid |
| Count Dooku, Darth Tyranus | 'count-dooku#darth-tyranus' | this.countDooku, this.countDookuDarthTyranus |

#### Duplicate card names
For ease of test writing and understanding, we strongly recommend that test scenarios have only one copy of any card whenever possible. If two cards share a title but have a different subtitle, then you must refer to them using the full title + subtitle property name. See the test of Luke's Lightsaber:

```javascript
beforeEach(function () {
    this.setupTest({
        phase: 'action',
        player1: {
            hand: ['lukes-lightsaber'],
            groundArena: [{ card: 'luke-skywalker#jedi-knight', damage: 5, upgrades: ['shield'] }, { card: 'battlefield-marine', damage: 2 }, 'reinforcement-walker'],
            leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
        }
    });
});

it('should heal all damage from and give a shield to its holder when played, only if that unit is Luke Skywalker', function () {
    this.player1.clickCard(this.lukesLightsaber);
    expect(this.player1).toBeAbleToSelectExactly([this.lukeSkywalkerJediKnight, this.lukeSkywalkerFaithfulFriend, this.battlefieldMarine]);

    this.player1.clickCard(this.lukeSkywalkerJediKnight);

    expect(this.lukeSkywalkerJediKnight.damage).toBe(0);
    expect(this.lukeSkywalkerJediKnight).toHaveExactUpgradeNames(['lukes-lightsaber', 'shield', 'shield']);
});
```

If two copies of a card with identical names are provided, then **no** property name will be generated and you must add it manually yourself in the test setup using `findCardByName()` or `findCardsByName()`:

```javascript
beforeEach(function () {
    this.setupTest({
        phase: 'action',
        player1: {
            hand: ['avenger#hunting-star-destroyer'],
            groundArena: ['pyke-sentinel'],
            spaceArena: ['imperial-interceptor']
        },
        player2: {
            groundArena: ['wampa'],
            spaceArena: ['cartel-spacer', 'avenger#hunting-star-destroyer']
        }
    });

    this.p1Avenger = this.player1.findCardByName('avenger#hunting-star-destroyer');
    this.p2Avenger = this.player2.findCardByName('avenger#hunting-star-destroyer');
});
```
