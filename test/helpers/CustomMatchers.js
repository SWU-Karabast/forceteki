/* global beforeEach, jasmine */

const exp = require('constants');
const Helpers = require('../../server/game/core/utils/Helpers.js');
const { stringArraysEqual } = require('../../server/Util.js');
const TestSetupError = require('./TestSetupError.js');
const Util = require('./Util.js');
const { Card } = require('../../server/game/core/card/Card.js');
const { TrackedGameCardMetric } = require('../../server/gameStatistics/GameStatisticsTracker.js');

var customMatchers = {
    toHavePrompt: function () {
        return {
            compare: function (actual, expected) {
                var result = {};
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
                    (button) => !button.disabled && util.equals(button.text, 'Pass', customEqualityMatchers)
                );

                if (result.pass) {
                    result.message = `Expected ${actual.name} not to have enabled prompt button 'Pass' but it did.`;
                } else {
                    result.message = `Expected ${actual.name} to have enabled prompt button 'Pass' `;

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
    toHaveChooseNothingButton: function (util, customEqualityMatchers) {
        return {
            compare: function (actual) {
                var buttons = actual.currentPrompt().buttons;
                var result = {};

                result.pass = buttons.some(
                    (button) => !button.disabled &&
                      (util.equals(button.text, 'Choose nothing', customEqualityMatchers) || util.equals(button.text, 'Choose no targets', customEqualityMatchers))
                );

                if (result.pass) {
                    result.message = `Expected ${actual.name} not to have enabled prompt button 'Choose nothing(s)' but it did.`;
                } else {
                    result.message = `Expected ${actual.name} to have enabled prompt button 'Choose nothing(s)' `;

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
                        result.message = `Expected at least 1 of the following cards not to be selectable by ${player.name} but they all were: ${Util.cardNamesToString(selectable)}`;
                    }
                } else {
                    if (unselectable.length === 1) {
                        result.message = `Expected ${unselectable[0].name} to be selectable by ${player.name} but it wasn't.`;
                    } else {
                        result.message = `Expected the following cards to be selectable by ${player.name} but they were not: ${Util.cardNamesToString(unselectable)}`;
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
                        result.message = `Expected at least 1 of the following cards to be selectable by ${player.name} but they all were not: ${Util.cardNamesToString(unselectable)}`;
                    }
                } else {
                    if (selectable.length === 1) {
                        result.message = `Expected ${selectable[0].name} not to be selectable by ${player.name} but it was.`;
                    } else {
                        result.message = `Expected the following cards to not be selectable by ${player.name} but they were: ${Util.cardNamesToString(selectable)}`;
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
                    result.message = `Expected ${player.name} not to be able to select exactly these cards but they can: ${Util.cardNamesToString(expectedSelectable)}`;
                } else {
                    let message = '';

                    if (unexpectedUnselectable.length > 0) {
                        message = `Expected the following cards to be selectable by ${player.name} but they were not: ${Util.cardNamesToString(unexpectedUnselectable)}`;
                    }
                    if (unexpectedSelectable.length > 0) {
                        if (message.length > 0) {
                            message += '\n';
                        }
                        message += `Expected the following cards not to be selectable by ${player.name} but they were: ${Util.cardNamesToString(unexpectedSelectable)}`;
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
                result.pass = player.game.getActivePlayer() === player.player;

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
                    result.message = `Expected these cards not to be in zone ${zone}${playerStr} but they are: ${Util.cardNamesToString(cards)}`;
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
    toBeAttachedTo: function () {
        return {
            compare: function (card, parentCard) {
                if (typeof card === 'string' || typeof parentCard === 'string') {
                    throw new TestSetupError('This expectation requires a card object, not a name');
                }
                let result = {};

                if (card.zoneName !== 'capture' && !checkConsistentZoneState(card, result)) {
                    return result;
                }

                result.pass = parentCard.upgrades.includes(card);

                if (result.pass) {
                    result.message = `Expected ${card.internalName} not to be attached to ${parentCard.internalName} but it is`;
                } else {
                    result.message = `Expected ${card.internalName} to be attached to ${parentCard.internalName} but it is in zone '${card.zone}'`;
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

                result.pass = stringArraysEqual(actualUpgradeNames, expectedUpgradeNames);

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

                result.pass = stringArraysEqual(actualButtons, expectedButtons);

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

                result.pass = stringArraysEqual(actualOptions, expectedOptions);

                if (result.pass) {
                    result.message = `Expected ${player.name} not to have this exact list of options but it does: '${Util.formatDropdownListOptions(expectedOptions)}'`;
                } else {
                    result.message = `Expected ${player.name} to have this exact list of options: '${Util.formatDropdownListOptions(expectedOptions)}'`;
                }

                result.message += `\n\n${generatePromptHelpMessage(player.testContext)}`;

                return result;
            }
        };
    },
    toHaveExactSelectableDisplayPromptCards: function() {
        return {
            compare: function (player, expectedCardsInPromptRaw) {
                const expectedCardsInPromptObject = { selectable: Helpers.asArray(expectedCardsInPromptRaw) };

                return processExpectedCardsInDisplayPrompt(player, expectedCardsInPromptObject);
            }
        };
    },
    toHaveExactViewableDisplayPromptCards: function() {
        return {
            compare: function (player, expectedCardsInPromptRaw) {
                const expectedCardsInPromptObject = { viewOnly: Helpers.asArray(expectedCardsInPromptRaw) };

                return processExpectedCardsInDisplayPrompt(player, expectedCardsInPromptObject);
            }
        };
    },
    toHaveExactDisplayPromptCards: function() {
        return {
            compare: function (player, expectedCardsInPromptRaw) {
                return processExpectedCardsInDisplayPrompt(player, expectedCardsInPromptRaw);
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

                result.pass = stringArraysEqual(actualButtonsInPrompt, expectedButtonsInPrompt);

                if (result.pass) {
                    result.message = `Expected ${player.name} not to have this exact set of "per card" buttons but it did: ${expectedButtonsInPrompt.join(', ')}`;
                } else {
                    result.message = `Expected ${player.name} to have this exact set of "per card" buttons: '${expectedButtonsInPrompt.join(', ')}' but it has: '${actualButtonsInPrompt.join(', ')}'`;
                }

                result.message += `\n\n${generatePromptHelpMessage(player.testContext)}`;

                return result;
            }
        };
    },
    toHaveExactEnabledDisplayPromptPerCardButtons: function() {
        return {
            compare: function (player, expectedButtonsInPrompt) {
                let result = {};

                if (!Array.isArray(expectedButtonsInPrompt)) {
                    throw new TestSetupError(`Parameter 'expectedButtonsInPrompt' is not an array: ${expectedButtonsInPrompt}`);
                }

                const actualButtonsInPrompt = player.currentPrompt().perCardButtons.filter((button) => button.disabled !== true).map((button) => button.text);

                result.pass = stringArraysEqual(actualButtonsInPrompt, expectedButtonsInPrompt);

                if (result.pass) {
                    result.message = `Expected ${player.name} not to have this exact set of enabled "per card" buttons but it did: ${expectedButtonsInPrompt.join(', ')}`;
                } else {
                    result.message = `Expected ${player.name} to have this exact set of enabled "per card" buttons: '${expectedButtonsInPrompt.join(', ')}' but it has: '${actualButtonsInPrompt.join(', ')}'`;
                }

                result.message += `\n\n${generatePromptHelpMessage(player.testContext)}`;

                return result;
            }
        };
    },
    toHaveExactDisabledDisplayPromptPerCardButtons: function() {
        return {
            compare: function (player, expectedButtonsInPrompt) {
                let result = {};

                if (!Array.isArray(expectedButtonsInPrompt)) {
                    throw new TestSetupError(`Parameter 'expectedButtonsInPrompt' is not an array: ${expectedButtonsInPrompt}`);
                }

                const actualButtonsInPrompt = player.currentPrompt().perCardButtons.filter((button) => button.disabled === true).map((button) => button.text);

                result.pass = stringArraysEqual(actualButtonsInPrompt, expectedButtonsInPrompt);

                if (result.pass) {
                    result.message = `Expected ${player.name} not to have this exact set of disabled "per card" buttons but it did: ${expectedButtonsInPrompt.join(', ')}`;
                } else {
                    result.message = `Expected ${player.name} to have this exact set of disabled "per card" buttons: '${expectedButtonsInPrompt.join(', ')}' but it has: '${actualButtonsInPrompt.join(', ')}'`;
                }

                result.message += `\n\n${generatePromptHelpMessage(player.testContext)}`;

                return result;
            }
        };
    },
    toBeCloneOf: function () {
        return {
            compare: function (card, targetCard) {
                if (typeof card === 'string' || typeof targetCard === 'string') {
                    throw new TestSetupError('This expectation requires a card object, not a name');
                }
                if (card?.internalName !== 'clone') {
                    throw new TestSetupError('This expectation requires an instance of a Clone card');
                }

                let failures = [];
                if (card.title !== targetCard.title) {
                    failures.push(`title: expected '${card.title}' but got '${targetCard.title}'`);
                }
                if (card.subtitle !== targetCard.subtitle) {
                    failures.push(`subtitle: expected '${card.subtitle}' but got '${targetCard.subtitle}'`);
                }
                if (card.printedCost !== targetCard.printedCost) {
                    failures.push(`printedCost: expected ${card.printedCost} but got ${targetCard.printedCost}`);
                }
                if (!Util.stringArraysEqual(card.aspects, targetCard.aspects)) {
                    failures.push(`aspects: expected ${card.aspects.join(', ')} but got ${targetCard.aspects.join(', ')}`);
                }
                if (card.defaultArena !== targetCard.defaultArena) {
                    failures.push(`defaultArena: expected '${card.defaultArena}' but got '${targetCard.defaultArena}'`);
                }
                if (card.unique !== false) {
                    failures.push('unique: expected cloned card to not be unique but it was');
                }
                if (card.printedType !== targetCard.printedType) {
                    failures.push(`printedType: expected '${card.printedType}' but got '${targetCard.printedType}'`);
                }
                if (!Util.setsEqual(card.getPrintedTraits(), targetCard.getPrintedTraits())) {
                    failures.push(`printedTraits: expected ${Array.from(card.getPrintedTraits()).join(', ')} but got ${Array.from(targetCard.getPrintedTraits()).join(', ')}`);
                }
                if (!card.traits.has('clone')) {
                    failures.push(`traits: expected cloned card to have the Clone trait but got ${Array.from(card.traits).join(', ')}}`);
                }
                if (card.getPrintedPower() !== targetCard.getPrintedPower()) {
                    failures.push(`printedPower: expected ${card.getPrintedPower()} but got ${targetCard.getPrintedPower()}`);
                }
                if (card.getPrintedHp() !== targetCard.getPrintedHp()) {
                    failures.push(`printedHp: expected ${card.getPrintedHp()} but got ${targetCard.getPrintedHp()}`);
                }
                if ((card.printedUpgradePower != null || targetCard.printedUpgradePower != null) && card.printedUpgradePower !== targetCard.printedUpgradePower) {
                    failures.push(`printedUpgradePower: expected ${card.printedUpgradePower} but got ${targetCard.printedUpgradePower}`);
                }
                if ((card.printedUpgradeHp != null || targetCard.printedUpgradeHp != null) && card.printedUpgradeHp !== targetCard.printedUpgradeHp) {
                    failures.push(`printedUpgradeHp: expected ${card.printedUpgradeHp} but got ${targetCard.printedUpgradeHp}`);
                }
                // Note: this relies on the fact that printed keywords are copied in order, if that stops being the case this will need to be updated
                // because keywords don't need to be in the same order for the Clone ability to work correctly
                if (card.printedKeywords.length !== targetCard.printedKeywords.length || !card.printedKeywords.every((keyword, index) => {
                    const otherKeyword = targetCard.printedKeywords[index];
                    if (keyword.name !== otherKeyword.name) {
                        return false;
                    }
                    if ((keyword.hasNumericValue() || otherKeyword.hasNumericValue()) && keyword.value !== otherKeyword.value) {
                        return false;
                    }
                    if ((keyword.hasAbilityDefinition() || otherKeyword.hasAbilityDefinition()) && keyword.abilityProps == null) {
                        return false;
                    }
                    return true;
                })) {
                    failures.push(`printedKeywords: expected ${card.printedKeywords.map((keyword) => keyword.name).join(', ')} but got ${targetCard.printedKeywords.map((keyword) => keyword.name).join(', ')}`);
                }
                if (card.getPrintedActionAbilities().length !== targetCard.getPrintedActionAbilities().length) {
                    failures.push(`expected ${card.getPrintedActionAbilities().length} action abilities but got ${targetCard.getPrintedActionAbilities().length}`);
                }
                if (card.getPrintedTriggeredAbilities().length !== targetCard.getPrintedTriggeredAbilities().length) {
                    failures.push(`expected ${card.getPrintedTriggeredAbilities().length} triggered abilities but got ${targetCard.getPrintedTriggeredAbilities().length}`);
                }
                if (card.getPrintedConstantAbilities().length !== targetCard.getPrintedConstantAbilities().length) {
                    failures.push(`expected ${card.getPrintedConstantAbilities().length} constant abilities but got ${targetCard.getPrintedConstantAbilities().length}`);
                }

                let result = {};
                result.pass = failures.length === 0;

                if (result.pass) {
                    result.message = `Expected ${card.internalName} not to be a clone of '${targetCard.internalName}' but it is`;
                } else {
                    result.message = `Expected ${card.internalName} to be a clone of '${targetCard.internalName}'`;
                }

                if (failures.length > 0) {
                    result.message += `\n\n${failures.join('\n')}`;
                }

                return result;
            }
        };
    },
    toBeVanillaClone: function () {
        return {
            compare: function (card) {
                if (typeof card === 'string') {
                    throw new TestSetupError('This expectation requires a card object, not a name');
                }
                if (card?.internalName !== 'clone') {
                    throw new TestSetupError('This expectation requires an instance of a Clone card');
                }

                let failures = [];
                if (card.title !== 'Clone') {
                    failures.push(`title: expected 'Clone' but got '${card.title}'`);
                }
                if (card.subtitle != null) {
                    failures.push(`subtitle: expected no subtitle but got '${card.subtitle}'`);
                }
                if (card.printedCost !== 7) {
                    failures.push(`printedCost: expected 7 but got ${card.printedCost}`);
                }
                if (!Util.stringArraysEqual(card.aspects, ['command'])) {
                    failures.push(`aspects: expected command but got ${card.aspects.join(', ')}`);
                }
                if (card.defaultArena !== 'groundArena') {
                    failures.push(`defaultArena: expected 'groundArena' but got '${card.defaultArena}'`);
                }
                if (card.unique !== false) {
                    failures.push('unique: expected cloned card to not be unique but it was');
                }
                if (card.printedType !== 'basicUnit') {
                    failures.push(`printedType: expected 'basicUnit' but got '${card.printedType}'`);
                }
                if (!Util.setsEqual(card.getPrintedTraits(), new Set(['clone']))) {
                    failures.push(`printedTraits: expected clone but got ${Array.from(card.getPrintedTraits()).join(', ')}`);
                }
                if (card.getPrintedPower() !== 0) {
                    failures.push(`printedPower: expected 0 but got ${card.getPrintedPower()}`);
                }
                if (card.getPrintedHp() !== 0) {
                    failures.push(`printedHp: expected 0 but got ${card.getPrintedHp()}`);
                }
                if (card.printedUpgradePower != null) {
                    failures.push(`printedUpgradePower: expected null but got ${card.printedUpgradePower}`);
                }
                if (card.printedUpgradeHp != null) {
                    failures.push(`printedUpgradeHp: expected null but got ${card.printedUpgradeHp}`);
                }
                if (card.printedKeywords.length > 0) {
                    failures.push(`printedKeywords: expected no keywords but got ${card.printedKeywords.map((keyword) => keyword.name).join(', ')}`);
                }
                if (card.getPrintedActionAbilities().length > 0) {
                    failures.push(`expected no action abilities but got ${card.getPrintedActionAbilities().length}`);
                }
                if (card.getPrintedTriggeredAbilities().length > 0) {
                    failures.push(`expected no triggered abilities but got ${card.getPrintedTriggeredAbilities().length}`);
                }
                if (card.getPrintedConstantAbilities().length > 0) {
                    failures.push(`expected no constant abilities but got ${card.getPrintedConstantAbilities().length}`);
                }
                if (!card.canRegisterPreEnterPlayAbilities() || card.getPreEnterPlayAbilities().length !== 1) {
                    failures.push(`expected 1 pre-enter play abilities but got ${card.canRegisterPreEnterPlayAbilities() ? card.getPreEnterPlayAbilities().length : 0}`);
                }

                let result = {};
                result.pass = failures.length === 0;

                if (result.pass) {
                    result.message = `Expected ${card.internalName} not to be a vanilla clone but it is`;
                } else {
                    result.message = `Expected ${card.internalName} to be a vanilla clone`;
                }

                if (failures.length > 0) {
                    result.message += `\n\n${failures.join('\n')}`;
                }

                return result;
            }
        };
    },

    /**
     * Checks if the actual array contains at least the elements of the expected array. Required for the new UndoArray class.
     * @param {jasmine.MatchersUtil} matchersUtil
     */
    toContainArray: function (matchersUtil) {
        return {
            compare: function (actualArray, expectedArray) {
                if (!Array.isArray(actualArray)) {
                    throw new TestSetupError(`Parameter 'actualArray' is not an array: ${actualArray}`);
                }
                if (!Array.isArray(expectedArray)) {
                    throw new TestSetupError(`Parameter 'expectedArray' is not an array: ${expectedArray}`);
                }

                const result = {};
                result.pass = matchersUtil.equals(actualArray, jasmine.arrayContaining(expectedArray));

                if (result.pass) {
                    result.message = 'Expected the array not to contain the elements but it does';
                } else {
                    result.message = 'Expected the array to contain the elements but it does not';
                }

                return result;
            }
        };
    },

    /**
     * Checks if the actual and expected arrays contain the exact same elements. Required for the new UndoArray class.
     * @param {jasmine.MatchersUtil} matchersUtil
     */
    toEqualArray: function (matchersUtil) {
        return {
            compare: function (actualArray, expectedArray) {
                if (!Array.isArray(actualArray)) {
                    throw new TestSetupError(`Parameter 'actualArray' is not an array: ${actualArray}`);
                }
                if (!Array.isArray(expectedArray)) {
                    throw new TestSetupError(`Parameter 'expectedArray' is not an array: ${expectedArray}`);
                }

                const result = {};
                result.pass = matchersUtil.equals(actualArray, jasmine.arrayWithExactContents(expectedArray));

                if (result.pass) {
                    result.message = 'Expected arrays not to have the exact same contents but they do';
                } else {
                    result.message = 'Expected arrays to have the exact same contents but they do not';
                }

                return result;
            }
        };
    }
};

function generatePromptHelpMessage(testContext) {
    return `Current prompts for players:\n${Util.formatBothPlayerPrompts(testContext)}`;
}

function checkConsistentZoneState(card, result) {
    if (!card.controller.getCardsInZone(card.zoneName).includes(card)) {
        result.pass = false;
        result.message = `Card ${card.internalName} has inconsistent zone state, card.zoneName is '${card.zoneName}' but it is not in the corresponding pile for ${card.controller.name}'`;
        return false;
    }

    return true;
}

function processExpectedCardsInDisplayPrompt(player, expectedCardsInPromptObject) {
    let result = {};

    if (Array.isArray(expectedCardsInPromptObject)) {
        throw new TestSetupError('Incorrectly formatted display cards expectation object');
    }

    // build selection ordering for expected selected cards (if any)
    let expectedSelectionOrderByUuid = null;
    if (expectedCardsInPromptObject.usesSelectionOrder) {
        if (!expectedCardsInPromptObject.selected) {
            throw new TestSetupError('\'usesSelectionOrder\' is set to true in the expectation but \'selected\' is not defined');
        }

        expectedSelectionOrderByUuid = new Map();
        for (let i = 0; i < expectedCardsInPromptObject.selected.length; i++) {
            const selectedCard = expectedCardsInPromptObject.selected[i];
            expectedSelectionOrderByUuid.set(selectedCard.uuid, i + 1);
        }
    }

    const expectedDisplayTextByUuid = new Map();
    const expectedSelectionStateByUuid = new Map();
    const expectedCardsInPrompt = [];

    for (const [selectionState, cards] of Object.entries(expectedCardsInPromptObject).filter(([key]) => key !== 'usesSelectionOrder')) {
        Util.checkNullCard(cards, `Card list for '${selectionState}' contains one more null elements`);

        for (const card of cards) {
            let concreteCard = card;

            if (selectionState === 'viewOnly') {
                if (!(card instanceof Card)) {
                    concreteCard = card.card;
                    expectedDisplayTextByUuid.set(concreteCard.uuid, card.displayText);
                }
            }

            expectedCardsInPrompt.push(concreteCard);
            expectedSelectionStateByUuid.set(concreteCard.uuid, selectionState);
        }
    }

    const actualCardsInPrompt = player.currentPrompt().displayCards;

    // check selection ordering for actual card prompt
    let actualUsesSelectionOrder = false;
    for (const card of actualCardsInPrompt) {
        if (card.selectionOrder != null) {
            actualUsesSelectionOrder = true;
            if (card.selectionState !== 'selected') {
                throw new TestSetupError(`Card ${card.internalName} has a selectionOrder of ${card.selectionOrder} but is in selection state ${card.selectionState}`);
            }
        }
    }

    const actualCardsUuids = new Set(actualCardsInPrompt.map((displayEntry) => displayEntry.cardUuid));
    const expectedCardsUuids = new Set(expectedCardsInPrompt.map((card) => card.uuid));

    let expectedAndFound = actualCardsInPrompt.filter((displayEntry) => expectedCardsUuids.has(displayEntry.cardUuid));
    let foundAndNotExpected = actualCardsInPrompt.filter((displayEntry) => !expectedCardsUuids.has(displayEntry.cardUuid));
    let expectedAndNotFound = expectedCardsInPrompt.filter((card) => !actualCardsUuids.has(card.uuid));

    let message = '';
    result.pass = foundAndNotExpected.length === 0 && expectedAndNotFound.length === 0;

    // check that selection orders match, if provided (but don't bother if the selection state is already known to be wrong)
    const incorrectSelectionOrderCards = [];
    if (result.pass) {
        if ((expectedSelectionOrderByUuid != null) !== actualUsesSelectionOrder) {
            result.pass = false;
            message += `Expected ${player.name}${expectedSelectionOrderByUuid ? '' : ' not'} to have selection ordering for its prompt but it did${actualUsesSelectionOrder ? '' : ' not'}\n`;
        } else if (actualUsesSelectionOrder) {
            for (const foundCard of expectedAndFound.filter((displayEntry) => displayEntry.selectionState === 'selected')) {
                const expectedOrder = expectedSelectionOrderByUuid.get(foundCard.cardUuid);
                if (expectedOrder !== foundCard.selectionOrder) {
                    incorrectSelectionOrderCards.push({ internalName: foundCard.internalName, expectedOrder, actualOrder: foundCard.selectionOrder });
                }
            }
        }
    }

    // collect any cards with incorrect selection state for printing error messages
    const incorrectSelectionStateCards = [];
    for (const foundCard of expectedAndFound) {
        const expectedState = expectedSelectionStateByUuid.get(foundCard.cardUuid);
        if (expectedState !== foundCard.selectionState) {
            incorrectSelectionStateCards.push({ internalName: foundCard.internalName, expectedState, actualState: foundCard.selectionState });
        }
    }

    // collect any cards with incorrect displaytext for printing error messages
    const incorrectDisplayTextCards = [];
    for (const foundCard of expectedAndFound) {
        const expectedDisplayText = expectedDisplayTextByUuid.get(foundCard.cardUuid);
        if (expectedDisplayText !== foundCard.displayText) {
            incorrectDisplayTextCards.push({ internalName: foundCard.internalName, expectedDisplayText, actualDisplayText: foundCard.displayText });
        }
    }

    if (incorrectDisplayTextCards.length > 0) {
        result.pass = false;
        message += `Found cards with incorrect display text in prompt for ${player.name}:\n`;
        message += incorrectDisplayTextCards.map((card) => `\t${card.internalName} - expected: [viewOnly, text: ${card.displayText}], actual: [viewOnly, text: ${card.actualDisplayText}]`).join('\n');
        message += '\n';
    }

    // generate error messages for any cards with incorrect selection state
    if (incorrectSelectionStateCards.length > 0 || incorrectSelectionOrderCards.length > 0) {
        result.pass = false;
        message += `Found cards with incorrect selection state in prompt for ${player.name}:\n`;

        if (incorrectSelectionStateCards.length > 0) {
            message += incorrectSelectionStateCards.map((card) => `\t${card.internalName} - expected: [${card.expectedState}], actual: [${card.actualState}]`).join('\n');
            message += '\n';
        }

        if (incorrectSelectionOrderCards.length > 0) {
            message += incorrectSelectionOrderCards.map((card) => `\t${card.internalName} - expected: [selected, selectionOrder: ${card.expectedOrder}], actual: [selected, selectionOrder: ${card.actualOrder}]`).join('\n');
            message += '\n';
        }
    }

    if (result.pass) {
        message += `Expected ${player.name} not to have exactly these cards in the card display prompt but they did: ${Util.cardNamesToString(expectedAndFound)}`;
    } else {
        if (expectedAndNotFound.length > 0) {
            message += `Expected the following cards to be in the card display prompt for ${player.name} but they were not: ${Util.cardNamesToString(expectedAndNotFound)}`;
        }
        if (foundAndNotExpected.length > 0) {
            if (message.length > 0) {
                message += '\n';
            }
            message += `Expected the following cards not to be in the card display prompt for ${player.name} but they were: ${Util.cardNamesToString(foundAndNotExpected)}`;
        }
    }

    message += `\n\n${generatePromptHelpMessage(player.testContext)}`;
    result.message = message;

    return result;
}

beforeEach(function () {
    jasmine.addMatchers(customMatchers);
    jasmine.addCustomEqualityTester((a, b) => {
        if (a instanceof TrackedGameCardMetric && b instanceof TrackedGameCardMetric) {
            return a.player === b.player && a.card === b.card && a.metric === b.metric;
        }
    });
});
