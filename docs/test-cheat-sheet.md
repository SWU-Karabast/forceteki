# Unit Testing Cheat Sheet

### Test Actions / Utilities

| Name | Example Test | Note |
| --- | --- | --- |
| player.clickCard() | [Wing Leader](..\test\server\cards\01_SOR\units\WingLeader.spec.js) | Clicks a card. Will throw an error if there is no response to the click. |
| player.clickPrompt() | [Yoda](..\test\server\cards\01_SOR\units\YodaOldMaster.spec.js) | Clicks a prompt button (not a card) |
| player.passAction() | [Snowtrooper Lieutenant](..\test\server\cards\01_SOR\units\SnowtrooperLieutenant.spec.js) | Player passes their current action in the action phase. |
| this.moveToNextActionPhase() | [Disarm](..\test\server\cards\01_SOR\events\Disarm.spec.js) | All players pass and then the game fast-forwards to the next action phase. No cards will be resourced. |
| player.clickCardNonChecking() | [Medal Ceremony](..\test\server\cards\01_SOR\events\MedalCeremony.spec.js) | Same as clickCard() except it will not throw an error if nothing happens on click. Used for testing when a click is expected to do nothing.
| player.setDeck(), player.setSpaceArenaUnits(),<br>player.setGroundArenaUnits(), player.setDiscard() | [Search Your Feelings](..\test\server\cards\01_SOR\events\SearchYourFeelings.spec.js),<br>[Death Trooper](..\test\server\cards\01_SOR\DeathTrooper.spec.js) | Set the units in an arena or card pile to override the initial test setup. Can use string names or existing card objects. |
| player.setResourceCount() | [Leader card tests](..\test\server\core\card\Leader.spec.js) | Change the player's number of resources, overriding the test setup. If cards are added, they will be of the filler card type. |
| player.setResourceCards() | N/A currently | Set the player's resource zone to the specified cards. |
| player.findCardByName() | [Avenger](..\test\server\cards\01_SOR\units\AvengerHuntingStarDestroyer.spec.js) | Get the object reference for a specific card of a player's. Useful when the test harness cannot automatically create a `this.<card>` reference (typically when there is multiple of a single card). |

### Custom Expectations

| Name | Example Test | Note |
| --- | --- | --- |
| toHavePrompt | [Mon Mothma](test\server\cards\01_SOR\MonMothmaVoiceoftheRebellion.spec.js) | Checks if the prompt's name or text matches (but not buttons) |
| toHaveEnabledPromptButton(s) | [Mon Mothma](..\test\server\cards\01_SOR\MonMothmaVoiceoftheRebellion.spec.js) | Checks if the prompt button is present and in an enabled state |
| toHaveDisabledPromptButton(s) | [Mon Mothma](..\test\server\cards\01_SOR\MonMothmaVoiceoftheRebellion.spec.js) | Checks if the prompt button is present and in a disabled state |
| toBeAbleToSelectExactly | [Surprise Strike](..\test\server\cards\01_SOR\SurpriseStrike.spec.js) | Checks that that specified player is able to select exactly the specified set of cards, no more and no less.
| toBeAbleToSelect | N/A | Checks if the card is one of the cards selectable by the specified player. Better in most cases to use toBeAbleToSelectExactly as it will fail if there are other selectable cards. |
| toBeAbleToSelectAllOf | N/A | Checks if the cards are a subset of the cards selectable by the specified player. Better in most cases to use toBeAbleToSelectExactly as it will fail if there are other selectable cards. |
| toBeAbleToSelectNoneOf | N/A | Checks that the player cannot select any of the specified cards. Better in most cases to use toBeAbleToSelectExactly to specify the exact set of expected cards. |
| toHaveAvailableActionWhenClickedBy | [Salacious Crumb](..\test\server\cards\02_SHD\SalaciousCrumbObnoxiousPet.spec.js) | Checks that the card, when clicked, causes an action to happen. Since this expectation changes game state, only use it at the end of a test (unless using the `.not` form) |
| toBeActivePlayer | [Fleet Lieutenant](..\test\server\cards\01_SOR\FleetLieutenant.spec.js) | Checks that the selected player is active player (i.e., is currently choosing or resolving their action) |
| toHavePassAbilityPrompt | [Death Trooper](..\test\server\cards\01_SOR\DeathTrooper.spec.js) | Checks that the selected player's current prompt includes the "Pass ability" button |
| toBeInBottomOfDeck | [Mon Mothma](..\test\server\cards\01_SOR\MonMothmaVoiceoftheRebellion.spec.js) | Checks that the selected card is in the bottom N cards of the deck |
| toAllBeInBottomOfDeck | [Mon Mothma](..\test\server\cards\01_SOR\MonMothmaVoiceoftheRebellion.spec.js) | Checks that the selected cards are in the bottom N cards of the deck |
| toBeInLocation | [I Am Your Father](..\test\server\cards\01_SOR\SearchYourFeelings.spec.js) | Checks that the provided card is in the specified game zone. Use this instead of `expect(<card>.location).toBe(...)` because it will check for inconsistency in game state. |
| toHaveExactUpgradeNames | [TIE Advanced](..\test\server\cards\01_SOR\TieAdvanced.spec.js) | Checks that the names of the provided card's upgrades match the provided list of card names. |