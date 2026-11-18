// GENERATED from schema/ and registry/ — do not edit

export const attributes = [
    {
        "name": "round",
        "type": "count",
        "class": "public",
        "on": [
            "game"
        ],
        "meaning": "The current round number (0 during setup).",
        "cr": "5.1"
    },
    {
        "name": "phase",
        "type": "string",
        "class": "public",
        "on": [
            "game"
        ],
        "meaning": "setup, action or regroup.",
        "cr": "5.1"
    },
    {
        "name": "active",
        "type": "seat|null",
        "class": "public",
        "on": [
            "game"
        ],
        "meaning": "Whose turn it is in the action phase; null otherwise.",
        "cr": "5.3"
    },
    {
        "name": "initiative",
        "type": "seat",
        "class": "public",
        "on": [
            "game"
        ],
        "meaning": "Who holds the initiative counter.",
        "cr": "1.16.1, 5.4.1.b"
    },
    {
        "name": "initiativeTaken",
        "type": "bool",
        "class": "public",
        "on": [
            "game"
        ],
        "meaning": "Whether initiative was taken this round.",
        "cr": "1.16.1"
    },
    {
        "name": "result",
        "type": "string",
        "class": "public",
        "on": [
            "game"
        ],
        "meaning": "p1, p2 or draw, once the game is over.",
        "cr": "5.6"
    },
    {
        "name": "deckCount",
        "type": "count",
        "class": "public",
        "on": [
            "seat"
        ],
        "meaning": "Cards in the deck.",
        "cr": "4.6"
    },
    {
        "name": "handCount",
        "type": "count",
        "class": "public",
        "on": [
            "seat"
        ],
        "meaning": "Cards in hand, known or not.",
        "cr": "4.7"
    },
    {
        "name": "credits",
        "type": "count",
        "class": "public",
        "on": [
            "seat"
        ],
        "meaning": "Credit tokens.",
        "cr": "7.5.x (Credits)"
    },
    {
        "name": "force",
        "type": "bool",
        "class": "public",
        "on": [
            "seat"
        ],
        "meaning": "Whether the seat has the Force.",
        "cr": "8.x (the Force)"
    },
    {
        "name": "kind",
        "type": "string",
        "class": "identity",
        "on": [
            "card"
        ],
        "meaning": "unit, upgrade, event, leader, base or token; effect on effect entities.",
        "cr": "3"
    },
    {
        "name": "exhausted",
        "type": "bool",
        "class": "public",
        "on": [
            "unit",
            "leader",
            "resource"
        ],
        "meaning": "Exhausted (true) or ready (false). Upgrades are neither ready nor exhausted, so a card attached as an upgrade or a pilot never carries it.",
        "cr": "1.5.4",
        "faceDown": true
    },
    {
        "name": "damage",
        "type": "count",
        "class": "public",
        "on": [
            "unit",
            "base"
        ],
        "meaning": "Damage on it.",
        "cr": "1.9"
    },
    {
        "name": "power",
        "type": "int",
        "class": "public",
        "on": [
            "unit"
        ],
        "meaning": "Current power, after every effect.",
        "cr": "3.x"
    },
    {
        "name": "hp",
        "type": "int",
        "class": "public",
        "on": [
            "unit",
            "base"
        ],
        "meaning": "Current max HP, after every effect (remaining = hp - damage).",
        "cr": "3.x"
    },
    {
        "name": "keywords",
        "type": "string[]",
        "class": "public",
        "on": [
            "unit"
        ],
        "meaning": "Current keywords, sorted, each the keyword's name in lower case, stacked as CR 7.5.4 says: a keyword followed by a number once, with the numbers added (raid 2 for Raid 1 given twice); a keyword followed by a cost or by a dash and an ability once per instance, by name alone (smuggle, bounty); any other keyword once, however often it is given (sentinel).",
        "cr": "7.5.4"
    },
    {
        "name": "traits",
        "type": "string[]",
        "class": "public",
        "on": [
            "unit",
            "upgrade"
        ],
        "meaning": "Current traits, sorted, each as printed in lower case with its spaces (bounty hunter).",
        "cr": "1.16.1"
    },
    {
        "name": "aspects",
        "type": "string[]",
        "class": "identity",
        "on": [
            "card"
        ],
        "meaning": "Aspect icons, one entry per icon.",
        "cr": "2.x"
    },
    {
        "name": "cost",
        "type": "int",
        "class": "identity",
        "on": [
            "card"
        ],
        "meaning": "Printed cost (copy effects: copied cost)."
    },
    {
        "name": "name",
        "type": "string",
        "class": "identity",
        "on": [
            "card"
        ],
        "meaning": "The name to show, only when it differs from the CARDS name (copy effects, a leader's other side)."
    },
    {
        "name": "blank",
        "type": "bool",
        "class": "public",
        "on": [
            "unit"
        ],
        "meaning": "Has lost all abilities.",
        "cr": "8.14.2"
    },
    {
        "name": "leaderUnit",
        "type": "bool",
        "class": "public",
        "on": [
            "unit"
        ],
        "meaning": "An ability made it a leader unit.",
        "cr": "3.4.7"
    },
    {
        "name": "copyOf",
        "type": "string",
        "class": "public",
        "on": [
            "unit"
        ],
        "meaning": "The card id whose printed attributes it now has.",
        "cr": "8.5"
    },
    {
        "name": "deployed",
        "type": "bool",
        "class": "public",
        "on": [
            "leader"
        ],
        "meaning": "Leader Unit side up.",
        "cr": "3.4"
    },
    {
        "name": "onStartingSide",
        "type": "bool",
        "class": "public",
        "on": [
            "leader"
        ],
        "meaning": "Which side of a double-sided leader is up.",
        "cr": "3.4"
    },
    {
        "name": "epicActionUsed",
        "type": "bool",
        "class": "public",
        "on": [
            "leader",
            "base"
        ],
        "meaning": "Epic Action spent.",
        "cr": "1.16.1"
    },
    {
        "name": "defeated",
        "type": "bool",
        "class": "public",
        "on": [
            "base"
        ],
        "meaning": "Defeated (also without damage: the Death Star).",
        "cr": "5.6"
    },
    {
        "name": "abilityUses",
        "type": "object[]",
        "class": "identity",
        "on": [
            "card"
        ],
        "meaning": "One entry per limited ability used at least once: {ability: string, seat, count, per: \"phase\"|\"round\"|\"game\", max}. Its ability is opaque, as an effect's ability is.",
        "cr": "7.2.5, 1.16.3"
    },
    {
        "name": "src",
        "type": "ref",
        "class": "public",
        "on": [
            "effect"
        ],
        "meaning": "The card (or base) whose ability created it."
    },
    {
        "name": "targets",
        "type": "ref[]",
        "class": "public",
        "on": [
            "effect"
        ],
        "meaning": "The entities it applies to (seats allowed: \"p1\")."
    },
    {
        "name": "duration",
        "type": "string",
        "class": "public",
        "on": [
            "effect"
        ],
        "meaning": "attack, phase, round, whileSourceInPlay, until, delayed or game."
    },
    {
        "name": "untilText",
        "type": "string",
        "class": "public",
        "on": [
            "effect"
        ],
        "meaning": "Words for an until condition."
    },
    {
        "name": "ability",
        "type": "string",
        "class": "public",
        "on": [
            "effect"
        ],
        "meaning": "The writer's id for the ability: opaque, for display only, never branched on. Two writers, or two versions of one writer, may give one ability different ids."
    },
    {
        "name": "text",
        "type": "string",
        "class": "public",
        "on": [
            "effect"
        ],
        "meaning": "The effect in words."
    }
];
