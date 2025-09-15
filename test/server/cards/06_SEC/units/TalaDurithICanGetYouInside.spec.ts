describe('Tala Durith, I Can Get You Inside', function() {
    integration(function(contextRef) {
        describe('Tala Durith\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: ['tala-durith#i-can-get-you-inside'],
                        leader: { card: 'iden-versio#inferno-squad-commander', deployed: false },
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder'],
                        leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: false }
                    }
                });
            });

            it('should give other friendly units hidden', function () {
                const { context } = contextRef;
                const { player1, player2 } = context;

                player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.talaDurithICanGetYouInside.hasSomeKeyword('hidden')).toBeFalse();
                expect(context.rebelPathfinder.hasSomeKeyword('hidden')).toBeFalse();

                // check current hidden
                player2.clickCard(context.rebelPathfinder);
                expect(player2).toBeAbleToSelectExactly([context.talaDurithICanGetYouInside, context.p1Base]);
                player2.clickCard(context.p1Base);

                context.player1.clickCard(context.idenVersioInfernoSquadCommander);
                context.player1.clickPrompt('Deploy Iden Versio');
                expect(context.idenVersioInfernoSquadCommander.hasSomeKeyword('hidden')).toBeTrue();

                context.player2.clickCard(context.cadBaneHeWhoNeedsNoIntroduction);
                context.player2.clickPrompt('Deploy Cad Bane');
                expect(context.cadBaneHeWhoNeedsNoIntroduction.hasSomeKeyword('hidden')).toBeFalse();

                context.player1.clickCard(context.idenVersioInfernoSquadCommander);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.cadBaneHeWhoNeedsNoIntroduction);
                expect(player2).toBeAbleToSelectExactly([context.talaDurithICanGetYouInside, context.p1Base]);
                context.player2.clickCard(context.p1Base);

                // move to next action phase
                context.moveToNextActionPhase();

                context.player1.clickPrompt('Pass');
                context.player2.clickCard(context.rebelPathfinder);
                expect(player2).toBeAbleToSelectExactly([context.talaDurithICanGetYouInside, context.battlefieldMarine, context.idenVersioInfernoSquadCommander, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });
        });
    });
});