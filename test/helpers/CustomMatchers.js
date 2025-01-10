/* global describe, beforeEach, jasmine */

const Contract = require('../../server/game/core/utils/Contract.js');
const TestSetupError = require('./TestSetupError.js');
const Util = require('./Util.js');

var customMatchers = {
    toHavePrompt: function () {
        return {
            compare: function (actual, expected) {
                var result = {};
                var currentPrompt = actual.currentPrompt();
                result.pass = actual.hasPrompt(expected);

                if (result.pass) {
                    result.message = `Expected ${actual.name} not to have prompt '${expected}' but it did.`;
                } else {
                    result.message = `Expected ${actual.name} to have prompt '${expected}' but the prompt is:\n${Util.formatPrompt(actual.currentPrompt(), actual.currentActionTargets)}`;
                }

                return result;
            }
        };
    },
    toHaveEnabledPromptButton: function (util, customEqualityMatchers) {
        return {
            compare: function (actual, expected) {
                var buttons = actual.currentPrompt().buttons;
                var result = {};

                result.pass = buttons.some(
                    (button) => !button.disabled && util.equals(button.text, expected, customEqualityMatchers)
                );

                if (result.pass) {
                    result.message = `Expected ${actual.name} not to have enabled prompt button '${expected}' but it did.`;
                } else {
                    result.message = `Expected ${actual.name} to have enabled prompt button '${expected}' `;

                    if (buttons.length > 0) {
                        var buttonText = buttons.map(
                            (button) => '[' + button.text + (button.disabled ? ' (disabled) ' : '') + ']'
                        ).join('\n');
                        result.message += `but it had buttons:\n${buttonText}`;
                    } else {
                        result.message += 'but it had no buttons';
                    }
                }

                result.message += `\n\n${generatePromptHelpMessage(actual.testContext)}`;

                return result;
            }
        };
    },
    toHaveEnabledPromptButtons: function (util, customEqualityMatchers) {
        return {
            compare: function (actual, expecteds) {
                if (!Array.isArray(expecteds)) {
                    expecteds = [expecteds];
                }

                var buttons = actual.currentPrompt().buttons;
                var result = {};

                for (let expected of expecteds) {
                    result.pass = buttons.some(
                        (button) => !button.disabled && util.equals(button.text, expected, customEqualityMatchers)
                    );

                    if (result.pass) {
                        result.message = `Expected ${actual.name} not to have enabled prompt buttons '${expected}' but it did.`;
                    } else {
                        result.message = `Expected ${actual.name} to have enabled prompt buttons '${expected}' `;

                        if (buttons.length > 0) {
                            var buttonText = buttons.map(
                                (button) => '[' + button.text + (button.disabled ? ' (disabled) ' : '') + ']'
                            ).join('\n');
                            result.message += `but it had buttons:\n${buttonText}`;
                        } else {
                            result.message += 'but it had no buttons';
                        }
                    }
                }

                result.message += `\n\n${generatePromptHelpMessage(actual.testContext)}`;

                return result;
            }
        };
    },
    toHaveDisabledPromptButton: function (util, customEqualityMatchers) {
        return {
            compare: function (actual, expected) {
                var buttons = actual.currentPrompt().buttons;
                var result = {};

                result.pass = buttons.some(
                    (button) => button.disabled && util.equals(button.text, expected, customEqualityMatchers)
                );

                if (result.pass) {
                    result.message = `Expected ${actual.name} not to have disabled prompt button '${expected}' but it did.`;
                } else {
                    result.message = `Expected ${actual.name} to have disabled prompt button '${expected}' `;

                    if (buttons.length > 0) {
                        var buttonText = buttons.map(
                            (button) => '[' + button.text + (button.disabled ? ' (disabled) ' : '') + ']'
                        ).join('\n');
                        result.message += `but it had buttons:\n${buttonText}`;
                    } else {
                        result.message += 'but it had no buttons';
                    }
                }

                result.message += `\n\n${generatePromptHelpMessage(actual.testContext)}`;

                return result;
            }
        };
    },
    toHaveDisabledPromptButtons: function (util, customEqualityMatchers) {
        return {
            compare: function (actual, expecteds) {
                if (!Array.isArray(expecteds)) {
                    expecteds = [expecteds];
                }

                var buttons = actual.currentPrompt().buttons;
                var result = {};

                for (let expected of expecteds) {
                    result.pass = buttons.some(
                        (button) => button.disabled && util.equals(button.text, expected, customEqualityMatchers)
                    );

                    if (result.pass) {
                        result.message = `Expected ${actual.name} not to have disabled prompt button '${expected}' but it did.`;
                    } else {
                        result.message = `Expected ${actual.name} to have disabled prompt buttons '${expected}' `;

                        if (buttons.length > 0) {
                            var buttonText = buttons.map(
                                (button) => '[' + button.text + (button.disabled ? ' (disabled) ' : '') + ']'
                            ).join('\n');
                            result.message += `but it had buttons:\n${buttonText}`;
                        } else {
                            result.message += 'but it had no buttons';
                        }
                    }
                }

                result.message += `\n\n${generatePromptHelpMessage(actual.testContext)}`;

                return result;
            }
        };
    },
    toHavePassAbilityButton: function (util, customEqualityMatchers) {
        return {
            compare: function (actual) {
                var buttons = actual.currentPrompt().buttons;
                var result = {};

                result.pass = buttons.some(
                    (button) => !button.disabled && util.equals(button.text, 'Pass ability', customEqualityMatchers)
                );

                if (result.pass) {
                    result.message = `Expected ${actual.name} not to have enabled prompt button 'Pass ability' but it did.`;
                } else {
                    result.message = `Expected ${actual.name} to have enabled prompt button 'Pass ability' `;

                    if (buttons.length > 0) {
                        var buttonText = buttons.map(
                            (button) => '[' + button.text + (button.disabled ? ' (disabled) ' : '') + ']'
                        ).join('\n');
                        result.message += `but it had buttons:\n${buttonText}`;
                    } else {
                        result.message += 'but it had no buttons';
                    }
                }

                result.message += `\n\n${generatePromptHelpMessage(actual.testContext)}`;

                return result;
            }
        };
    },
    toHaveChooseNoTargetButton: function (util, customEqualityMatchers) {
        return {
            compare: function (actual) {
                var buttons = actual.currentPrompt().buttons;
                var result = {};

                result.pass = buttons.some(
                    (button) => !button.disabled &&
                      (util.equals(button.text, 'Choose no target', customEqualityMatchers) || util.equals(button.text, 'Choose no targets', customEqualityMatchers))
                );

                if (result.pass) {
                    result.message = `Expected ${actual.name} not to have enabled prompt button 'Choose no target(s)' but it did.`;
                } else {
                    result.message = `Expected ${actual.name} to have enabled prompt button 'Choose no target(s)' `;

                    if (buttons.length > 0) {
                        var buttonText = buttons.map(
                            (button) => '[' + button.text + (button.disabled ? ' (disabled) ' : '') + ']'
                        ).join('\n');
                        result.message += `but it had buttons:\n${buttonText}`;
                    } else {
                        result.message += 'but it had no buttons';
                    }
                }

                result.message += `\n\n${generatePromptHelpMessage(actual.testContext)}`;

                return result;
            }
        };
    },
    toHavePassAttackButton: function (util, customEqualityMatchers) {
        return {
            compare: function (actual) {
                var buttons = actual.currentPrompt().buttons;
                var result = {};

                result.pass = buttons.some(
                    (button) => !button.disabled && util.equals(button.text, 'Pass attack', customEqualityMatchers)
                );

                if (result.pass) {
                    result.message = `Expected ${actual.name} not to have enabled prompt button 'Pass attack' but it did.`;
                } else {
                    result.message = `Expected ${actual.name} to have enabled prompt button 'Pass attack' `;

                    if (buttons.length > 0) {
                        var buttonText = buttons.map(
                            (button) => '[' + button.text + (button.disabled ? ' (disabled) ' : '') + ']'
                        ).join('\n');
                        result.message += `but it had buttons:\n${buttonText}`;
                    } else {
                        result.message += 'but it had no buttons';
                    }
                }

                result.message += `\n\n${generatePromptHelpMessage(actual.testContext)}`;

                return result;
            }
        };
    },
    toHaveClaimInitiativeAbilityButton: function (util, customEqualityMatchers) {
        return {
            compare: function (actual) {
                var buttons = actual.currentPrompt().buttons;
                var result = {};

                result.pass = buttons.some(
                    (button) => !button.disabled && util.equals(button.text, 'Claim Initiative', customEqualityMatchers)
                );

                if (result.pass) {
                    result.message = `Expected ${actual.name} not to have enabled prompt button 'Claim Initiative' but it did.`;
                } else {
                    result.message = `Expected ${actual.name} to have enabled prompt button 'Claim Initiative' `;

                    if (buttons.length > 0) {
                        var buttonText = buttons.map(
                            (button) => '[' + button.text + (button.disabled ? ' (disabled) ' : '') + ']'
                        ).join('\n');
                        result.message += `but it had buttons:\n${buttonText}`;
                    } else {
                        result.message += 'but it had no buttons';
                    }
                }

                result.message += `\n\n${generatePromptHelpMessage(actual.testContext)}`;

                return result;
            }
        };
    },
    toBeAbleToSelect: function () {
        return {
            compare: function (player, card) {
                if (typeof card === 'string') {
                    card = player.findCardByName(card);
                } else {
                    Util.checkNullCard(card);
                }
                let result = {};

                result.pass = player.currentActionTargets.includes(card);

                if (result.pass) {
                    result.message = `Expected ${card.name} not to be selectable by ${player.name} but it was.`;
                } else {
                    result.message = `Expected ${card.name} to be selectable by ${player.name} but it wasn't.`;
                }

                result.message += `\n\n${generatePromptHelpMessage(player.testContext)}`;

                return result;
            }
        };
    },
    toBeAbleToSelectAllOf: function () {
        return {
            compare: function (player, cards) {
                Util.checkNullCard(cards);
                if (!Array.isArray(cards)) {
                    cards = [cards];
                }

                let cardsPopulated = [];
                for (let card of cards) {
                    if (typeof card === 'string') {
                        cardsPopulated.push(player.findCardByName(card));
                    } else {
                        cardsPopulated.push(card);
                    }
                }

                let result = {};

                let selectable = cardsPopulated.filter((x) => player.currentActionTargets.includes(x));
                let unselectable = cardsPopulated.filter((x) => !player.currentActionTargets.includes(x));

                result.pass = unselectable.length === 0;

                if (result.pass) {
                    if (selectable.length === 1) {
                        result.message = `Expected ${selectable[0].name} not to be selectable by ${player.name} but it was.`;
                    } else {
                        result.message = `Expected at least 1 of the following cards not to be selectable by ${player.name} but they all were: ${cardNamesToString(selectable)}`;
                    }
                } else {
                    if (unselectable.length === 1) {
                        result.message = `Expected ${unselectable[0].name} to be selectable by ${player.name} but it wasn't.`;
                    } else {
                        result.message = `Expected the following cards to be selectable by ${player.name} but they were not: ${cardNamesToString(unselectable)}`;
                    }
                }

                result.message += `\n\n${generatePromptHelpMessage(player.testContext)}`;

                return result;
            }
        };
    },
    toBeAbleToSelectNoneOf: function () {
        return {
            compare: function (player, cards) {
                Util.checkNullCard(cards);
                if (!Array.isArray(cards)) {
                    cards = [cards];
                }

                let cardsPopulated = [];
                for (let card of cards) {
                    if (typeof card === 'string') {
                        cardsPopulated.push(player.findCardByName(card));
                    } else {
                        cardsPopulated.push(card);
                    }
                }

                let result = {};

                let selectable = cardsPopulated.filter((x) => player.currentActionTargets.includes(x));
                let unselectable = cardsPopulated.filter((x) => !player.currentActionTargets.includes(x));

                result.pass = selectable.length === 0;

                if (result.pass) {
                    if (unselectable.length === 1) {
                        result.message = `Expected ${unselectable[0].name} to be selectable by ${player.name} but it wasn't.`;
                    } else {
                        result.message = `Expected at least 1 of the following cards to be selectable by ${player.name} but they all were not: ${cardNamesToString(unselectable)}`;
                    }
                } else {
                    if (selectable.length === 1) {
                        result.message = `Expected ${selectable[0].name} not to be selectable by ${player.name} but it was.`;
                    } else {
                        result.message = `Expected the following cards to not be selectable by ${player.name} but they were: ${cardNamesToString(selectable)}`;
                    }
                }

                result.message += `\n\n${generatePromptHelpMessage(player.testContext)}`;

                return result;
            }
        };
    },
    toBeAbleToSelectExactly: function () {
        return {
            compare: function (player, cards) {
                Util.checkNullCard(cards);
                if (!Array.isArray(cards)) {
                    cards = [cards];
                }

                let cardsPopulated = [];
                for (let card of cards) {
                    if (typeof card === 'string') {
                        cardsPopulated.push(player.findCardByName(card));
                    } else {
                        cardsPopulated.push(card);
                    }
                }

                let result = {};

                let expectedSelectable = cardsPopulated.filter((x) => player.currentActionTargets.includes(x));
                let unexpectedUnselectable = cardsPopulated.filter((x) => !player.currentActionTargets.includes(x));
                let unexpectedSelectable = player.currentActionTargets.filter((x) => !cardsPopulated.includes(x));

                result.pass = unexpectedUnselectable.length === 0 && unexpectedSelectable.length === 0;

                if (result.pass) {
                    result.message = `Expected ${player.name} not to be able to select exactly these cards but they can: ${cardNamesToString(expectedSelectable)}`;
                } else {
                    let message = '';

                    if (unexpectedUnselectable.length > 0) {
                        message = `Expected the following cards to be selectable by ${player.name} but they were not: ${cardNamesToString(unexpectedUnselectable)}`;
                    }
                    if (unexpectedSelectable.length > 0) {
                        if (message.length > 0) {
                            message += '\n';
                        }
                        message += `Expected the following cards not to be selectable by ${player.name} but they were: ${cardNamesToString(unexpectedSelectable)}`;
                    }
                    result.message = message;
                }

                result.message += `\n\n${generatePromptHelpMessage(player.testContext)}`;

                return result;
            }
        };
    },
    toHaveAvailableActionWhenClickedBy: function () {
        return {
            compare: function (card, player) {
                Util.checkNullCard(card);
                if (typeof card === 'string') {
                    card = player.findCardByName(card);
                }
                let result = {};

                const beforeClick = Util.getPlayerPromptState(player.player);

                player.clickCardNonChecking(card);

                const afterClick = Util.getPlayerPromptState(player.player);

                // if the prompt state changed after click, there was an action available
                result.pass = !Util.promptStatesEqual(beforeClick, afterClick);

                if (result.pass) {
                    result.message = `Expected ${card.name} not to have an action available when clicked by ${player.name} but it has ability prompt:\n${generatePromptHelpMessage(player.testContext)}`;
                } else {
                    result.message = `Expected ${card.name} to have an action available when clicked by ${player.name} but it did not.`;
                }

                return result;
            }
        };
    },
    toBeActivePlayer: function () {
        return {
            compare: function (player) {
                let result = {};

                // use player.player here because the received parameter is a PlayerInteractionWrapper
                result.pass = player.game.actionPhaseActivePlayer === player.player;

                if (result.pass) {
                    result.message = `Expected ${player.name} not to be the active player but they were.`;
                } else {
                    result.message = `Expected ${player.name} to be the active player but they were not.`;
                }

                result.message += `\n\n${generatePromptHelpMessage(player.testContext)}`;

                return result;
            }
        };
    },
    toHaveInitiative: function () {
        return {
            compare: function (player) {
                let result = {};

                result.pass = player.hasInitiative;

                if (result.pass) {
                    result.message = `Expected ${player.name} not to have initiative but it did.`;
                } else {
                    result.message = `Expected ${player.name} to have initiative but it did not.`;
                }

                return result;
            }
        };
    },
    toHavePassAbilityPrompt: function () {
        return {
            compare: function (player, abilityText) {
                var result = {};

                if (abilityText == null) {
                    throw new TestSetupError('toHavePassAbilityPrompt requires an abilityText parameter');
                }

                const passPromptText = `Trigger the ability '${abilityText}' or pass`;
                result.pass = player.hasPrompt(passPromptText);

                if (result.pass) {
                    result.message = `Expected ${player.name} not to have pass prompt '${passPromptText}' but it did.`;
                } else {
                    result.message = `Expected ${player.name} to have pass prompt '${passPromptText}' but it has prompt:\n${generatePromptHelpMessage(player.testContext)}`;
                }

                return result;
            }
        };
    },
    toHavePassSingleTargetPrompt: function () {
        return {
            compare: function (player, abilityText, target) {
                var result = {};

                if (abilityText == null || target == null) {
                    throw new TestSetupError('toHavePassSingleTargetPrompt requires the target and abilityText parameters');
                }

                // in certain cases the prompt may have additional text explaining the hidden zone rule
                const passPromptText = `Trigger the effect '${abilityText}' on target '${target.title}' or pass`;
                const passPromptTextForHiddenZone = passPromptText + ' \n(because you are choosing from a hidden zone you may choose nothing)';

                result.pass = player.hasPrompt(passPromptText) || player.hasPrompt(passPromptTextForHiddenZone);

                if (result.pass) {
                    result.message = `Expected ${player.name} not to have pass prompt '${passPromptText}' but it did.`;
                } else {
                    result.message = `Expected ${player.name} to have pass prompt '${passPromptText}' but it has prompt:\n${generatePromptHelpMessage(player.testContext)}`;
                }

                return result;
            }
        };
    },
    toBeInBottomOfDeck: function () {
        return {
            compare: function (card, player, numCards) {
                Util.checkNullCard(card);
                var result = {};
                const deck = player.deck;
                const L = deck.length;
                result.pass = L >= numCards;
                if (result.pass) {
                    result.pass = card.zoneName === 'deck';
                    if (!result.pass) {
                        result.message = `Expected ${card.title} to be in the deck.`;
                    } else {
                        var onBottom = false;
                        for (let i = 1; i <= numCards; i++) {
                            if (deck[L - i] === card) {
                                onBottom = true;
                                break;
                            }
                        }
                        result.pass = onBottom;
                        if (!onBottom) {
                            result.message = `Expected ${card.title} to be on the bottom of the deck.`;
                        }
                    }
                } else {
                    result.message = 'Deck is smaller than parameter numCards';
                }
                return result;
            }
        };
    },
    toAllBeInBottomOfDeck: function () {
        return {
            compare: function (cards, player, numCards) {
                Util.checkNullCard(cards);
                var result = {};
                const deck = player.deck;
                const L = deck.length;
                result.pass = L >= numCards;
                if (result.pass) {
                    var notInDeck = [];
                    var notOnBottom = [];
                    for (let card of cards) {
                        thisCardPass = card.zoneName === 'deck';
                        if (!thisCardPass) {
                            result.pass = thisCardPass;
                            notInDeck.push(card.title);
                        } else {
                            var onBottom = false;
                            for (let i = 1; i <= numCards; i++) {
                                if (deck[L - i] === card) {
                                    onBottom = true;
                                    break;
                                }
                            }
                            thisCardPass = onBottom;
                            if (!onBottom) {
                                result.pass = onBottom;
                                notOnBottom.push(card.title);
                            }
                        }
                    }

                    if (!result.pass) {
                        result.message = '';
                        if (notInDeck.length > 0) {
                            result.message += `Expected ${notInDeck.join(', ')} to be in the deck.`;
                        }
                        if (notOnBottom.length > 0) {
                            result.message += ` Expected ${notOnBottom.join(', ')} to be on the bottom of the deck`;
                        }
                    }
                } else {
                    result.message = 'Deck is smaller than parameter numCards';
                }
                return result;
            }
        };
    },
    toBeInZone: function () {
        return {
            compare: function (card, zone, player = null) {
                if (typeof card === 'string') {
                    throw new TestSetupError('This expectation requires a card object, not a name');
                }
                if (zone === 'capture') {
                    throw new TestSetupError('Do not use toBeInZone to check for capture zone, use to toBeCapturedBy instead');
                }
                let result = {};

                if (!checkConsistentZoneState(card, result)) {
                    return result;
                }

                const zoneOwningPlayer = player || card.controller;
                result.pass = zoneOwningPlayer.getCardsInZone(zone).includes(card);

                if (result.pass) {
                    result.message = `Expected ${card.internalName} not to be in zone '${zone}' but it is`;
                } else {
                    result.message = `Expected ${card.internalName} to be in zone '${zone}' but it is in zone '${card.zoneName}'`;
                }

                return result;
            }
        };
    },
    toAllBeInZone: function () {
        return {
            compare: function (cards, zone, player = null) {
                if (!Array.isArray(cards)) {
                    throw new TestSetupError('This expectation requires an array of card objects');
                }
                if (zone === 'capture') {
                    throw new TestSetupError('Do not use toBeInZone to check for capture zone, use to toBeCapturedBy instead');
                }

                let result = { pass: true };
                let cardsInWrongZone = [];

                for (const card of cards) {
                    if (!checkConsistentZoneState(card, result)) {
                        return result;
                    }

                    const zoneOwningPlayer = player || card.controller;
                    if (!zoneOwningPlayer.getCardsInZone(zone).includes(card)) {
                        cardsInWrongZone.push(card);
                        result.pass = false;
                    }
                }

                const playerStr = player ? ` for player ${player}` : '';

                if (result.pass) {
                    result.message = `Expected these cards not to be in zone ${zone}${playerStr} but they are: ${cardNamesToString(cards)}`;
                } else {
                    result.message = `Expected the following cards to be in zone ${zone}${playerStr} but they were not:`;

                    for (const card of cardsInWrongZone) {
                        result.message += `\n\t- ${card.internalName} is in zone ${card.zoneName}`;
                    }
                }

                return result;
            }
        };
    },
    toBeCapturedBy: function () {
        return {
            compare: function (card, captor) {
                if (typeof card === 'string' || typeof captor === 'string') {
                    throw new TestSetupError('This expectation requires a card object, not a name');
                }
                let result = {};

                if (card.zoneName !== 'capture' && !checkConsistentZoneState(card, result)) {
                    return result;
                }

                result.pass = captor.captureZone.hasCard(card);

                if (result.pass) {
                    result.message = `Expected ${card.internalName} not to be captured by ${captor.internalName} but it is`;
                } else {
                    result.message = `Expected ${card.internalName} to be captured by ${captor.internalName} but it is in zone '${card.zone}'`;
                }

                return result;
            }
        };
    },
    toHaveExactUpgradeNames: function () {
        return {
            compare: function (card, upgradeNames) {
                let result = {};

                if (!card.upgrades) {
                    throw new TestSetupError(`Card ${card.internalName} does not have an upgrades property`);
                }
                if (!Array.isArray(upgradeNames)) {
                    throw new TestSetupError(`Parameter upgradeNames is not an array: ${upgradeNames}`);
                }

                const actualUpgradeNames = card.upgrades.map((upgrade) => upgrade.internalName);

                const expectedUpgradeNames = [...upgradeNames];

                result.pass = Util.stringArraysEqual(actualUpgradeNames, expectedUpgradeNames);

                if (result.pass) {
                    result.message = `Expected ${card.internalName} not to have this exact set of upgrades but it does: ${expectedUpgradeNames.join(', ')}`;
                } else {
                    result.message = `Expected ${card.internalName} to have this exact set of upgrades: '${expectedUpgradeNames.join(', ')}' but it has: '${actualUpgradeNames.join(', ')}'`;
                }

                return result;
            }
        };
    },
    // TODO: could add a field to expect enabled or disabled per button
    toHaveExactPromptButtons: function () {
        return {
            compare: function (player, buttons) {
                let result = {};

                if (!Array.isArray(buttons)) {
                    throw new TestSetupError(`Parameter 'buttons' is not an array: ${buttons}`);
                }

                const actualButtons = player.currentPrompt().buttons.map((button) => button.text);

                const expectedButtons = [...buttons];

                result.pass = Util.stringArraysEqual(actualButtons, expectedButtons);

                if (result.pass) {
                    result.message = `Expected ${player.name} not to have this exact set of buttons but it does: ${expectedButtons.join(', ')}`;
                } else {
                    result.message = `Expected ${player.name} to have this exact set of buttons: '${expectedButtons.join(', ')}'`;
                }

                result.message += `\n\n${generatePromptHelpMessage(player.testContext)}`;

                return result;
            }
        };
    },
    toHaveExactDropdownListOptions: function () {
        return {
            compare: function (player, expectedOptions) {
                let result = {};

                if (!Array.isArray(expectedOptions)) {
                    throw new TestSetupError(`Parameter 'options' is not an array: ${expectedOptions}`);
                }

                const actualOptions = player.currentPrompt().dropdownListOptions;

                result.pass = Util.stringArraysEqual(actualOptions, expectedOptions);

                if (result.pass) {
                    result.message = `Expected ${player.name} not to have this exact list of options but it does: '${Util.createStringForOptions(expectedOptions)}'`;
                } else {
                    result.message = `Expected ${player.name} to have this exact list of options: '${Util.createStringForOptions(expectedOptions)}'`;
                }

                result.message += `\n\n${generatePromptHelpMessage(player.testContext)}`;

                return result;
            }
        };
    },
    toHaveExactDisplayPromptCards: function() {
        return {
            compare: function (player, expectedCardsInPrompt) {
                let result = {};

                if (!Array.isArray(expectedCardsInPrompt)) {
                    throw new TestSetupError(`Parameter 'expectedCardsInPrompt' is not an array: ${expectedCardsInPrompt}`);
                }

                const actualCardsInPrompt = player.currentPrompt().displayCards;

                const actualCardsUuids = new Set(actualCardsInPrompt.map((displayEntry) => displayEntry.cardUuid));
                const expectedCardsUuids = new Set(expectedCardsInPrompt.map((card) => card.uuid));

                let expectedAndFound = actualCardsInPrompt.filter((displayEntry) => expectedCardsUuids.has(displayEntry.cardUuid));
                let foundAndNotExpected = actualCardsInPrompt.filter((displayEntry) => !expectedCardsUuids.has(displayEntry.cardUuid));
                let expectedAndNotFound = expectedCardsInPrompt.filter((card) => !actualCardsUuids.has(card.uuid));

                result.pass = foundAndNotExpected.length === 0 && expectedAndNotFound.length === 0;

                if (result.pass) {
                    result.message = `Expected ${player.name} not to have exactly these cards in the card display prompt but they did: ${cardNamesToString(expectedAndFound)}`;
                } else {
                    let message = '';

                    if (expectedAndNotFound.length > 0) {
                        message = `Expected the following cards to be in the card display prompt for ${player.name} but they were not: ${cardNamesToString(expectedAndNotFound)}`;
                    }
                    if (foundAndNotExpected.length > 0) {
                        if (message.length > 0) {
                            message += '\n';
                        }
                        message += `Expected the following cards not to be in the card display prompt for ${player.name} but they were: ${cardNamesToString(foundAndNotExpected)}`;
                    }
                    result.message = message;
                }

                result.message += `\n\n${generatePromptHelpMessage(player.testContext)}`;

                return result;
            }
        };
    },
    toHaveExactDisplayPromptPerCardButtons: function() {
        return {
            compare: function (player, expectedButtonsInPrompt) {
                let result = {};

                if (!Array.isArray(expectedButtonsInPrompt)) {
                    throw new TestSetupError(`Parameter 'expectedButtonsInPrompt' is not an array: ${expectedButtonsInPrompt}`);
                }

                const actualButtonsInPrompt = player.currentPrompt().perCardButtons.map((button) => button.text);

                result.pass = Util.stringArraysEqual(actualButtonsInPrompt, expectedButtonsInPrompt);

                if (result.pass) {
                    result.message = `Expected ${player.name} not to have this exact set of "per card" buttons but it did: ${expectedButtonsInPrompt.join(', ')}`;
                } else {
                    result.message = `Expected ${player.name} to have this exact set of "per card" buttons: '${expectedButtonsInPrompt.join(', ')}' but it has: '${actualButtonsInPrompt.join(', ')}'`;
                }

                result.message += `\n\n${generatePromptHelpMessage(player.testContext)}`;

                return result;
            }
        };
    }
};

function generatePromptHelpMessage(testContext) {
    return `Current prompts for players:\n${Util.formatBothPlayerPrompts(testContext)}`;
}

function cardNamesToString(cards) {
    return cards.map((card) => card.internalName).join(', ');
}

function checkConsistentZoneState(card, result) {
    if (!card.controller.getCardsInZone(card.zoneName).includes(card)) {
        result.pass = false;
        result.message = `Card ${card.internalName} has inconsistent zone state, card.zoneName is '${card.zoneName}' but it is not in the corresponding pile for ${card.controller.name}'`;
        return false;
    }

    return true;
}

beforeEach(function () {
    jasmine.addMatchers(customMatchers);
});
