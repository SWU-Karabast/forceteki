describe('Attack interactions', function() {
    integration(function(contextRef) {
        // Ruling 2025-03-25: "When this unit completes an attack" triggers see the attack complete, and
        // any abilities triggered during or as a result of an attack resolve before the next action in a
        // multi-action ability (7.1.7). So when a unit's completed-attack trigger plays a card that
        // initiates further attacks, those attacks are nested and resolve inside the current attack,
        // before the controlling ability proceeds to its next attack.
        xit('Ezra\'s completed-attack trigger plays Rebel Assault, whose attacks nest inside Leia\'s first attack before her second', function () {
            // Player 1 activates Leia Organa (Alliance General) to attack with two Rebel units. The first
            // attack is made with Ezra Bridger (Resourceful Troublemaker). When Ezra completes that
            // attack, his ability plays Rebel Assault from the top of the deck, which itself initiates
            // two more Rebel attacks. Those Rebel Assault attacks (and any of their nested triggers)
            // resolve fully — nested inside Leia's first attack — before Leia's second attack is made.
        });
    });
});
