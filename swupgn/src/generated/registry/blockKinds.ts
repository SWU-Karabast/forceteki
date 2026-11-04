// GENERATED from schema/ and registry/ — do not edit

export const blockKinds = [
    {
        "name": "play",
        "meaning": "A card is played.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The seat that played it."
            },
            "src": {
                "use": "required",
                "meaning": "The card played."
            },
            "targets": {
                "use": "optional",
                "meaning": "What was chosen while playing it, such as an upgrade's host."
            },
            "amount": {
                "use": "optional",
                "meaning": "The resources paid."
            },
            "via": {
                "use": "optional",
                "meaning": "The card whose ability let it be played."
            }
        }
    },
    {
        "name": "deploy",
        "meaning": "A leader is deployed.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The seat that deployed it."
            },
            "src": {
                "use": "required",
                "meaning": "The leader."
            },
            "targets": {
                "use": "optional",
                "meaning": "The unit it deploys onto, when it deploys as an upgrade."
            }
        }
    },
    {
        "name": "attack",
        "meaning": "A unit attacks.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The attacking seat."
            },
            "src": {
                "use": "required",
                "meaning": "The attacker."
            },
            "targets": {
                "use": "required",
                "meaning": "The defender: the unit or base attacked."
            },
            "via": {
                "use": "optional",
                "meaning": "The card whose ability made the attack."
            }
        }
    },
    {
        "name": "ability",
        "meaning": "An action ability is used, or an Epic Action other than deploying a leader.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The seat that used it."
            },
            "src": {
                "use": "required",
                "meaning": "The card (or base) whose ability it is."
            },
            "targets": {
                "use": "optional",
                "meaning": "What it was used on."
            },
            "via": {
                "use": "optional",
                "meaning": "The card that granted the ability."
            }
        }
    },
    {
        "name": "trigger",
        "meaning": "A triggered ability resolves.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The seat that controls the ability."
            },
            "src": {
                "use": "required",
                "meaning": "The card (or base) whose ability it is."
            },
            "targets": {
                "use": "optional",
                "meaning": "What it was used on."
            },
            "via": {
                "use": "optional",
                "meaning": "The card that granted the ability."
            }
        }
    },
    {
        "name": "damage",
        "meaning": "Damage is dealt.",
        "fields": {
            "p": {
                "use": "optional",
                "meaning": "The seat whose card dealt it; absent with src."
            },
            "src": {
                "use": "optional",
                "meaning": "The card that dealt it; absent only when no card did (a draw from an empty deck)."
            },
            "targets": {
                "use": "required",
                "meaning": "What took the damage."
            },
            "amount": {
                "use": "required",
                "meaning": "The damage each target took, after prevention. Damage of different amounts is separate blocks."
            },
            "group": {
                "use": "optional",
                "meaning": "Shared by damage dealt at the same time, such as combat damage."
            }
        }
    },
    {
        "name": "heal",
        "meaning": "Damage is healed.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The seat whose card healed it."
            },
            "src": {
                "use": "required",
                "meaning": "The card that healed it."
            },
            "targets": {
                "use": "required",
                "meaning": "What was healed."
            },
            "amount": {
                "use": "required",
                "meaning": "The damage removed from each target. Different amounts are separate blocks."
            },
            "group": {
                "use": "optional",
                "meaning": "Shared by healing done at the same time."
            }
        }
    },
    {
        "name": "defeat",
        "meaning": "Entities are defeated.",
        "fields": {
            "p": {
                "use": "optional",
                "meaning": "The seat whose card defeated them."
            },
            "src": {
                "use": "optional",
                "meaning": "The card that defeated them, when one did."
            },
            "targets": {
                "use": "required",
                "meaning": "What was defeated."
            },
            "group": {
                "use": "optional",
                "meaning": "Shared by defeats at the same time."
            }
        }
    },
    {
        "name": "capture",
        "meaning": "A card is captured.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The seat that controls the captor."
            },
            "src": {
                "use": "required",
                "meaning": "The captor: the unit or base that holds the card."
            },
            "targets": {
                "use": "required",
                "meaning": "The captured cards."
            },
            "via": {
                "use": "optional",
                "meaning": "The card whose ability made the capture."
            }
        }
    },
    {
        "name": "rescue",
        "meaning": "A captured card is rescued.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The seat the rescued cards return to."
            },
            "src": {
                "use": "optional",
                "meaning": "The card whose ability rescued them."
            },
            "targets": {
                "use": "required",
                "meaning": "The rescued cards."
            }
        }
    },
    {
        "name": "draw",
        "meaning": "Cards are drawn. A draw from an empty deck draws no card and is no draw block.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The drawing seat."
            },
            "src": {
                "use": "optional",
                "meaning": "The card whose ability made the draw; absent for the draws of setup and regroup."
            },
            "targets": {
                "use": "required",
                "meaning": "The drawn card entities."
            },
            "amount": {
                "use": "required",
                "meaning": "The cards drawn."
            },
            "group": {
                "use": "optional",
                "meaning": "Shared by draws at the same time, such as both seats' regroup draws."
            }
        }
    },
    {
        "name": "discard",
        "meaning": "Cards are discarded from a hand or a deck.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The seat whose cards were discarded."
            },
            "src": {
                "use": "optional",
                "meaning": "The card whose ability discarded them."
            },
            "targets": {
                "use": "required",
                "meaning": "The discarded cards."
            },
            "group": {
                "use": "optional",
                "meaning": "Shared by discards at the same time."
            }
        }
    },
    {
        "name": "resource",
        "meaning": "Cards are put into the resource row.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The seat whose resources they become."
            },
            "src": {
                "use": "optional",
                "meaning": "The card whose ability resourced them; absent for the resources of setup and regroup."
            },
            "targets": {
                "use": "required",
                "meaning": "The resourced cards."
            },
            "group": {
                "use": "optional",
                "meaning": "Shared by resources chosen at the same time, such as at setup."
            }
        }
    },
    {
        "name": "search",
        "meaning": "A deck is searched.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The searching seat."
            },
            "src": {
                "use": "required",
                "meaning": "The card whose ability searched."
            },
            "options": {
                "use": "optional",
                "meaning": "The cards looked at."
            },
            "targets": {
                "use": "optional",
                "meaning": "The cards chosen."
            },
            "amount": {
                "use": "required",
                "meaning": "How many cards were looked at."
            }
        }
    },
    {
        "name": "look",
        "meaning": "Cards are looked at.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The seat that looked."
            },
            "src": {
                "use": "optional",
                "meaning": "The card whose ability let it look."
            },
            "targets": {
                "use": "required",
                "meaning": "The cards looked at."
            },
            "amount": {
                "use": "required",
                "meaning": "How many cards were looked at."
            }
        }
    },
    {
        "name": "choice",
        "meaning": "A choice is made.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The choosing seat."
            },
            "src": {
                "use": "optional",
                "meaning": "The card whose ability asked for the choice."
            },
            "options": {
                "use": "optional",
                "meaning": "What could have been chosen."
            },
            "targets": {
                "use": "optional",
                "meaning": "What was chosen."
            },
            "amount": {
                "use": "optional",
                "meaning": "The number chosen, when the choice is a number."
            },
            "group": {
                "use": "optional",
                "meaning": "Shared by blind choices made without seeing each other."
            }
        }
    },
    {
        "name": "name",
        "meaning": "A name is chosen. The block's text is the chosen name.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The naming seat."
            },
            "src": {
                "use": "required",
                "meaning": "The card whose ability asked for the name."
            }
        }
    },
    {
        "name": "shuffle",
        "meaning": "A deck is shuffled, with or without entities shuffled into it.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The seat whose deck it is."
            },
            "src": {
                "use": "optional",
                "meaning": "The card whose ability shuffled it."
            },
            "targets": {
                "use": "optional",
                "meaning": "The entities shuffled into the deck."
            }
        }
    },
    {
        "name": "pass",
        "meaning": "A seat passes.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The passing seat."
            }
        }
    },
    {
        "name": "initiative",
        "meaning": "The initiative is taken.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The seat that took it."
            },
            "src": {
                "use": "optional",
                "meaning": "The card whose ability gave it."
            }
        }
    },
    {
        "name": "mulligan",
        "meaning": "A mulligan decision.",
        "fields": {
            "p": {
                "use": "required",
                "meaning": "The deciding seat."
            },
            "amount": {
                "use": "required",
                "meaning": "The cards shuffled back: 0 when the seat kept its hand."
            }
        }
    },
    {
        "name": "regroup",
        "meaning": "The regroup phase happens.",
        "fields": {}
    },
    {
        "name": "gameEnd",
        "meaning": "The game ends.",
        "fields": {
            "p": {
                "use": "optional",
                "meaning": "The winning seat; absent for a draw."
            }
        }
    }
];
