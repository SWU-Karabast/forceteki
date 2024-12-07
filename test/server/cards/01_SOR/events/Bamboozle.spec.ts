describe('Bamboozle', function () {
    integration(function (contextRef) {
        it('Bamboozle should be played by discard a Cunning card, its ability should exhaust a unit and return each upgrades to owner hand', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['bamboozle', 'wampa', 'crafty-smuggler', 'lothal-insurgent'],
                    groundArena: ['battlefield-marine'],
                    leader: 'lando-calrissian#with-impeccable-taste'
                },
                player2: {
                    groundArena: [{ card: 'saw-gerrera#extremist', upgrades: ['entrenched', 'shield'] }],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bamboozle);
            expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Play this event', 'Play Bamboozle by discarding a Cunning card']);
            // play bamboozle with resource
            context.player1.clickPrompt('Play this event');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.sawGerrera]);

            // exhaust green squadron awing, nothing to return in hand
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.player2).toBeActivePlayer();
            expect(context.player2.hand.length).toBe(0);

            expect(context.greenSquadronAwing.exhausted).toBeTrue();
            expect(context.craftySmuggler).toBeInZone('hand');

            expect(context.p1Base.damage).toBe(2);
            expect(context.player1.exhaustedResourceCount).toBe(2);

            // reset
            context.setDamage(context.p1Base, 0);
            context.player1.moveCard(context.bamboozle, 'hand');
            context.player2.passAction();

            // play bamboozle by discarding
            context.player1.clickCard(context.bamboozle);
            context.player1.clickPrompt('Play Bamboozle by discarding a Cunning card');

            // can discard only cunning card
            expect(context.player1).toBeAbleToSelectExactly([context.craftySmuggler, context.lothalInsurgent]);
            context.player1.clickCard(context.craftySmuggler);

            // choose to exhaust saw gerrera
            context.player1.clickCard(context.sawGerrera);

            expect(context.player2).toBeActivePlayer();

            // saw gerrera should apply his ability even with alternate cost
            expect(context.p1Base.damage).toBe(2);

            // saw gerrera should be exhausted and all his upgrades should be return to hand
            expect(context.sawGerrera.exhausted).toBeTrue();
            expect(context.sawGerrera.isUpgraded()).toBeFalse();

            // only entrenched is return to hand, shield is destroyed
            expect(context.craftySmuggler).toBeInZone('discard');
            expect(context.entrenched).toBeInZone('hand');
            expect(context.player2.hand.length).toBe(1);

            // no resource exhausted since the last action
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });
    });
});
