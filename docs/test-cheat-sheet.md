# Unit Testing Cheat Sheet

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
| toHaveAvailableActionWhenClickedInActionPhaseBy | [Salacious Crumb](..\test\server\cards\02_SHD\SalaciousCrumbObnoxiousPet.spec.js) | Checks that the card, when clicked, causes an action to happen. Since this expectation changes game state, only use it at the end of a test (unless using the `.not` form) |
| toBeActivePlayer | [Fleet Lieutenant](..\test\server\cards\01_SOR\FleetLieutenant.spec.js) | Checks that the selected player is active player (i.e., is currently choosing or resolving their action) |
| toHavePassAbilityPrompt | [Death Trooper](..\test\server\cards\01_SOR\DeathTrooper.spec.js) | Checks that the selected player's current prompt includes the "Pass ability" button |
| toBeInBottomOfDeck | [Mon Mothma](..\test\server\cards\01_SOR\MonMothmaVoiceoftheRebellion.spec.js) | Checks that the selected card is in the bottom N cards of the deck |
| toAllBeInBottomOfDeck | [Mon Mothma](..\test\server\cards\01_SOR\MonMothmaVoiceoftheRebellion.spec.js) | Checks that the selected cards are in the bottom N cards of the deck |
| toBeInLocation | [I Am Your Father](..\test\server\cards\01_SOR\SearchYourFeelings.spec.js) | Checks that the provided card is in the specified game zone. Use this instead of `expect(<card>.location).toBe(...)` because it will check for inconsistency in game state. |
| toHaveExactUpgradeNames | [TIE Advanced](..\test\server\cards\01_SOR\TieAdvanced.spec.js) | Checks that the names of the provided card's upgrades match the provided list of card names. |