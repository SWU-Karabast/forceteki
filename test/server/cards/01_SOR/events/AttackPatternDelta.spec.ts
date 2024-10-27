describe('Attack Pattern Delta', function() {
    integration(function(contextRef) {
        describe('Attack Pattern Delta\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['attack-pattern-delta'],
                        groundArena: ['battlefield-marine', 'wampa'],
                        spaceArena: ['red-three#unstoppable', 'alliance-xwing']
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });
            });

            it(
                'should give a friendly unit +3/+3 for this phase, then give another friendly unit +2/+2 for this phase, the give a third friendly unit +1/+1 for this phase.',
                function () {
                    const { context } = contextRef;

                    // Case 1: The player can select any unit card.
                    context.player1.clickCard(context.attackPatternDelta);

                    expect(context.player1).toBeAbleToSelectExactly([
                        context.battlefieldMarine,
                        context.wampa,
                        context.redThree,
                        context.allianceXwing,
                    ]);

                    // Case 2: The player selects Wampa. It gets +3/+3.
                    context.player1.clickCard(context.wampa);

                    expect(context.wampa.getPower()).toEqual(7);
                    expect(context.wampa.getHp()).toEqual(8);

                    // Case 3: The player can select any unit card except Wampa.
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.battlefieldMarine,
                        context.redThree,
                        context.allianceXwing,
                    ]);

                    // Case 4: The player selects Battlefield Marine. It gets +2/+2.
                    context.player1.clickCard(context.battlefieldMarine);

                    expect(context.battlefieldMarine.getPower()).toEqual(5);
                    expect(context.battlefieldMarine.getHp()).toEqual(5);

                    // Case 5: The player can select any unit card except Wampa or Battlefield Marine.
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.redThree,
                        context.allianceXwing,
                    ]);

                    // Case 6: The player selects Red Three. It gets +1/+1.
                    context.player1.clickCard(context.redThree);

                    expect(context.redThree.getPower()).toEqual(3);
                    expect(context.redThree.getHp()).toEqual(4);

                    // Case 7: The buffs wear off at the end of the phase.
                    context.moveToNextActionPhase()

                    expect(context.wampa.getPower()).toEqual(4);
                    expect(context.wampa.getHp()).toEqual(5);
                    expect(context.battlefieldMarine.getPower()).toEqual(3);
                    expect(context.battlefieldMarine.getHp()).toEqual(3);
                    expect(context.redThree.getPower()).toEqual(2);
                    expect(context.redThree.getHp()).toEqual(3);
                }
            );
        });
    });
});
