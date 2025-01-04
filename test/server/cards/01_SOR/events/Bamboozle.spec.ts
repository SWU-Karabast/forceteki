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

            const reset = () => {
                context.setDamage(context.p1Base, 0);
                context.player1.moveCard(context.bamboozle, 'hand');
                context.player2.passAction();
            };

            context.player1.clickCard(context.bamboozle);
            expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Play Bamboozle', 'Play Bamboozle by discarding a Cunning card']);
            // play bamboozle with resource
            context.player1.clickPrompt('Play Bamboozle');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.sawGerrera]);

            // exhaust green squadron awing, nothing to return in hand
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.player2).toBeActivePlayer();
            expect(context.player2.hand.length).toBe(0);

            expect(context.greenSquadronAwing.exhausted).toBeTrue();
            expect(context.craftySmuggler).toBeInZone('hand');

            expect(context.p1Base.damage).toBe(2);
            expect(context.player1.exhaustedResourceCount).toBe(2);

            reset();

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

            reset();

            // use the discard play mode again to confirm that the cost adjuster still works
            context.player1.clickCard(context.bamboozle);
            context.player1.clickPrompt('Play Bamboozle by discarding a Cunning card');

            expect(context.player1).toBeAbleToSelectExactly([context.lothalInsurgent]);
            context.player1.clickCard(context.lothalInsurgent);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeActivePlayer();

            expect(context.p1Base.damage).toBe(2);
            expect(context.battlefieldMarine.exhausted).toBeTrue();

            // no resource exhausted since the last action
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });

        it('Bamboozle\'s play modes should be available even if it is played by another card\'s effect', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['bamboozle', 'wampa', 'crafty-smuggler', 'lothal-insurgent'],
                    groundArena: ['battlefield-marine', 'bib-fortuna#jabbas-majordomo'],
                    leader: 'lando-calrissian#with-impeccable-taste'
                },
                player2: {
                    groundArena: ['saw-gerrera#extremist'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            const reset = () => {
                context.setDamage(context.p1Base, 0);
                context.player1.moveCard(context.bamboozle, 'hand');
                context.player2.passAction();
                context.bibFortuna.exhausted = false;
            };

            // play Bamboozle using Bib Fortuna ability
            context.player1.clickCard(context.bibFortuna);
            context.player1.clickPrompt('Play an event from your hand. It costs 1 less.');

            // expect to see both play actions, choose the discard mode
            context.player1.clickCard(context.bamboozle);
            expect(context.player1).toHaveExactPromptButtons(['Play Bamboozle', 'Play Bamboozle by discarding a Cunning card']);
            context.player1.clickPrompt('Play Bamboozle by discarding a Cunning card');

            // can discard only cunning card
            expect(context.player1).toBeAbleToSelectExactly([context.craftySmuggler, context.lothalInsurgent]);
            context.player1.clickCard(context.craftySmuggler);

            // choose to exhaust saw gerrera
            context.player1.clickCard(context.sawGerrera);
            expect(context.sawGerrera.exhausted).toBeTrue();

            // check costs (including Saw Gerrera additional cost)
            expect(context.player1.exhaustedResourceCount).toBe(0);
            expect(context.p1Base.damage).toBe(2);

            reset();

            // play Bamboozle using Bib Fortuna ability, choose normal play this time
            context.player1.clickCard(context.bibFortuna);
            context.player1.clickPrompt('Play an event from your hand. It costs 1 less.');
            context.player1.clickCard(context.bamboozle);
            context.player1.clickPrompt('Play Bamboozle');

            // choose to exhaust a-wing
            context.player1.clickCard(context.greenSquadronAwing);
            expect(context.greenSquadronAwing.exhausted).toBeTrue();

            // check costs (including Saw Gerrera additional cost)
            expect(context.player1.exhaustedResourceCount).toBe(1);
            expect(context.p1Base.damage).toBe(2);

            reset();

            // use the discard play mode again to confirm that the cost adjuster still works
            context.player1.clickCard(context.bibFortuna);
            context.player1.clickPrompt('Play an event from your hand. It costs 1 less.');
            context.player1.clickCard(context.bamboozle);
            context.player1.clickPrompt('Play Bamboozle by discarding a Cunning card');

            expect(context.player1).toBeAbleToSelectExactly([context.lothalInsurgent]);
            context.player1.clickCard(context.lothalInsurgent);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeActivePlayer();

            expect(context.p1Base.damage).toBe(2);
            expect(context.battlefieldMarine.exhausted).toBeTrue();

            // no resource exhausted since the last action
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });

        it('Bamboozle\'s alternate play mode should not be available when smuggled', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['wampa', 'crafty-smuggler', 'lothal-insurgent'],
                    groundArena: ['tech#source-of-insight'],
                    leader: 'jyn-erso#resisting-oppression',
                    resources: ['bamboozle', 'atst', 'atst', 'atst', 'atst']
                },
                player2: {
                    groundArena: [{ card: 'saw-gerrera#extremist', upgrades: ['entrenched', 'shield'] }]
                }
            });

            const { context } = contextRef;

            // expect to see both play actions, choose the discard mode
            context.player1.clickCard(context.bamboozle);

            // no play modes prompt, go directly to targeting
            expect(context.player1).toBeAbleToSelectExactly([context.tech, context.sawGerrera]);
            context.player1.clickCard(context.sawGerrera);
            expect(context.sawGerrera.exhausted).toBeTrue();
            expect(context.sawGerrera.isUpgraded()).toBeFalse();

            expect(context.player1.exhaustedResourceCount).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
