describe('Diplomatic Immunity', function() {
    integration(function(contextRef) {
        const disclosePrompt = 'Disclose Vigilance, Vigilance, Heroism, Heroism. If you do, the attacker gets -2/-0 for this attack';

        describe('Diplomatic Immunity\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['diplomatic-immunity', 'vigilance', 'medal-ceremony', 'snowspeeder'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['strikeship'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    },
                    player2: {
                        hand: ['pillage', 'protector', 'fleet-lieutenant', 'wing-leader'],
                        groundArena: ['rebel-pathfinder'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });
            });

            it('should give -2/-0 to the attacker while attached friendly ground unit is defending', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.diplomaticImmunity);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.strikeship, context.rebelPathfinder, context.cartelSpacer, context.lukeSkywalkerFaithfulFriend, context.grandInquisitorHuntingTheJedi]);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.rebelPathfinder);
                context.player2.clickCard(context.battlefieldMarine);

                context.player2.clickPrompt('You');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt(disclosePrompt);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.vigilance,
                    context.medalCeremony,
                    context.snowspeeder
                ]);
                context.player1.clickCard(context.vigilance);
                context.player1.clickCard(context.medalCeremony);
                context.player1.clickCard(context.snowspeeder);
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                expect(context.rebelPathfinder).toBeInZone('discard');
                expect(context.battlefieldMarine.damage).toBe(0);

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.grandInquisitorHuntingTheJedi);

                expect(context.grandInquisitor.damage).toBe(5);
                expect(context.battlefieldMarine.damage).toBe(3);
            });

            it('should give -2/-0 to the attacker while attached friendly space unit is defending', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.diplomaticImmunity);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.strikeship, context.rebelPathfinder, context.cartelSpacer, context.lukeSkywalkerFaithfulFriend, context.grandInquisitorHuntingTheJedi]);
                context.player1.clickCard(context.strikeship);

                context.player2.clickCard(context.cartelSpacer);
                context.player2.clickCard(context.strikeship);

                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt(disclosePrompt);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.vigilance,
                    context.medalCeremony,
                    context.snowspeeder
                ]);
                context.player1.clickCard(context.vigilance);
                context.player1.clickCard(context.medalCeremony);
                context.player1.clickCard(context.snowspeeder);
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                expect(context.cartelSpacer.damage).toBe(2);
                expect(context.strikeship.damage).toBe(0);
            });

            it('should give -2/-0 to the attacker while attached friendly leader unit is defending', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.diplomaticImmunity);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.strikeship, context.rebelPathfinder, context.cartelSpacer, context.lukeSkywalkerFaithfulFriend, context.grandInquisitorHuntingTheJedi]);
                context.player1.clickCard(context.lukeSkywalkerFaithfulFriend);

                context.player2.clickCard(context.rebelPathfinder);
                context.player2.clickCard(context.lukeSkywalkerFaithfulFriend);

                context.player2.clickPrompt('You');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt(disclosePrompt);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.vigilance,
                    context.medalCeremony,
                    context.snowspeeder
                ]);
                context.player1.clickCard(context.vigilance);
                context.player1.clickCard(context.medalCeremony);
                context.player1.clickCard(context.snowspeeder);
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                expect(context.rebelPathfinder).toBeInZone('discard');
                expect(context.lukeSkywalkerFaithfulFriend.damage).toBe(0);
            });

            it('should give -2/-0 to the attacker while attached enemy ground unit is defending', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.diplomaticImmunity);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.strikeship, context.rebelPathfinder, context.cartelSpacer, context.lukeSkywalkerFaithfulFriend, context.grandInquisitorHuntingTheJedi]);
                context.player1.clickCard(context.rebelPathfinder);

                context.player2.clickPrompt('Pass');

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.rebelPathfinder);

                context.player2.clickPrompt('Trigger');

                expect(context.player2).toHavePrompt(disclosePrompt);
                expect(context.player2).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player2).toBeAbleToSelectExactly([
                    context.protector,
                    context.fleetLieutenant,
                    context.wingLeader
                ]);
                context.player2.clickCard(context.protector);
                context.player2.clickCard(context.fleetLieutenant);
                context.player2.clickCard(context.wingLeader);
                context.player2.clickPrompt('Done');
                context.player1.clickPrompt('Done');

                expect(context.rebelPathfinder.damage).toBe(1);
                expect(context.battlefieldMarine).toBeInZone('discard');
            });

            it('should give -2/-0 to the attacker while attached enemy space unit is defending', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.diplomaticImmunity);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.strikeship, context.rebelPathfinder, context.cartelSpacer, context.lukeSkywalkerFaithfulFriend, context.grandInquisitorHuntingTheJedi]);
                context.player1.clickCard(context.cartelSpacer);

                context.player2.clickPrompt('Pass');

                context.player1.clickCard(context.strikeship);
                context.player1.clickCard(context.cartelSpacer);

                context.player2.clickPrompt('Trigger');

                expect(context.player2).toHavePrompt(disclosePrompt);
                expect(context.player2).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player2).toBeAbleToSelectExactly([
                    context.protector,
                    context.fleetLieutenant,
                    context.wingLeader
                ]);
                context.player2.clickCard(context.protector);
                context.player2.clickCard(context.fleetLieutenant);
                context.player2.clickCard(context.wingLeader);
                context.player2.clickPrompt('Done');
                context.player1.clickPrompt('Done');

                expect(context.strikeship).toBeInZone('discard');
                expect(context.cartelSpacer.damage).toBe(1);
            });

            it('should give -2/-0 to the attacker while attached enemy leader unit is defending', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.diplomaticImmunity);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.strikeship, context.rebelPathfinder, context.cartelSpacer, context.lukeSkywalkerFaithfulFriend, context.grandInquisitorHuntingTheJedi]);
                context.player1.clickCard(context.grandInquisitorHuntingTheJedi);

                context.player2.clickPrompt('Pass');

                context.player1.clickCard(context.lukeSkywalkerFaithfulFriend);
                context.player1.clickCard(context.grandInquisitorHuntingTheJedi);

                context.player1.clickPrompt('You');
                context.player1.clickPrompt('Pass');
                context.player2.clickPrompt('Trigger');

                expect(context.player2).toHavePrompt(disclosePrompt);
                expect(context.player2).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player2).toBeAbleToSelectExactly([
                    context.protector,
                    context.fleetLieutenant,
                    context.wingLeader
                ]);
                context.player2.clickCard(context.protector);
                context.player2.clickCard(context.fleetLieutenant);
                context.player2.clickCard(context.wingLeader);
                context.player2.clickPrompt('Done');
                context.player1.clickPrompt('Done');

                expect(context.lukeSkywalkerFaithfulFriend.damage).toBe(5);
                expect(context.grandInquisitorHuntingTheJedi.damage).toBe(2);
            });

            it('should be able to be passed', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.diplomaticImmunity);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.strikeship, context.rebelPathfinder, context.cartelSpacer, context.lukeSkywalkerFaithfulFriend, context.grandInquisitorHuntingTheJedi]);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.rebelPathfinder);
                context.player2.clickCard(context.battlefieldMarine);

                context.player2.clickPrompt('You');
                context.player1.clickPrompt('Pass');

                expect(context.rebelPathfinder).toBeInZone('discard');
                expect(context.battlefieldMarine.damage).toBe(2);
            });

            it('should not trigger if the hand does not have the disclose cards', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.diplomaticImmunity);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.strikeship, context.rebelPathfinder, context.cartelSpacer, context.lukeSkywalkerFaithfulFriend, context.grandInquisitorHuntingTheJedi]);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.pillage);
                context.player2.clickPrompt('Opponent discards');

                context.player1.clickCard(context.vigilance);
                context.player1.clickCard(context.medalCeremony);
                context.player1.clickPrompt('Done');
                context.player1.clickPrompt('Pass');

                context.player2.clickCard(context.rebelPathfinder);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.rebelPathfinder).toBeInZone('discard');
                expect(context.battlefieldMarine.damage).toBe(2);
            });

            it('should not give -2/-0 to either unit when attached unit is attacking', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.diplomaticImmunity);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.strikeship, context.rebelPathfinder, context.cartelSpacer, context.lukeSkywalkerFaithfulFriend, context.grandInquisitorHuntingTheJedi]);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.pillage);
                context.player2.clickPrompt('Opponent discards');

                context.player1.clickCard(context.vigilance);
                context.player1.clickCard(context.medalCeremony);
                context.player1.clickPrompt('Done');

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.rebelPathfinder);

                expect(context.rebelPathfinder).toBeInZone('discard');
                expect(context.battlefieldMarine.damage).toBe(2);
            });
        });
    });
});