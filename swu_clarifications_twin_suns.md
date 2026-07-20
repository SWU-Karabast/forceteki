# SWU Clarifications — Twin Suns (Multiplayer) — For Later

Twin Suns (multiplayer) clarifications that we're deferring for a dedicated pass. These are hard to
capture as ordinary card-spec `xit` stubs because they need a multiplayer (3+ player) board, which the
standard two-player test harness doesn't set up. Collected here so nothing is lost.

---

## 1. Keyword granted during a modified Play a Card enabling a cost discount (Third Sister + Morgan Elsbeth)

**Clarification (full Q&A, condensed):**
> **Question: What is the exact timing of a keyword being granted in a modified play a card action?**
>
> [Twin Suns: Morgan Elsbeth (Following the Call) and Third Sister (Seething With Ambition) both
> deployed as leader units and both attack. The next unit played gains Hidden (Third Sister) and gets a
> cost discount if it shares a keyword with a friendly unit (Morgan Elsbeth). Does the unit gain Hidden
> at the Declare Intent step, so it benefits from the discount?]
>
> **Answer:** Yes, keywords that are granted as part of a modified Play a Card action are granted at the
> Declare Intent step and active throughout playing that unit. This was a recent change... All keywords
> will be granted at the same time to standardize the process. CR6 will further clarify.

**Findings:** The general principle (a keyword granted in a modified play is active for the play,
including for cost determination) is already covered by `BobaFettDaimyo.spec.ts:133` and
`MorganElsbethFollowingTheCall.spec.ts:200`. The specific Twin Suns combo — a unit that *gains* a
keyword (Hidden from Third Sister) during the play, and that gained keyword enabling Morgan Elsbeth's
cost discount — is untested and needs a Twin Suns board. Deferred.

---

## 2. Damage responsibility from undeployed leader abilities (Jabba / Jango / Dedra) — Twin Suns portion

**Clarification (full Q&A, condensed):**
> **Question: Who is responsible for the damage from undeployed leader abilities?**
>
> [Twin Suns: Player A has SEC Jabba (Wonderful Human Being) and Jango (Concealing the Conspiracy)
> leaders. Player A activates Jabba's leader side ability. Does Jango trigger? Is Dedra the source of
> her damage even though the opponent chooses? Can Dedra trigger JTL Boba leader? Can the Dedra player
> collect a Bounty?]
>
> **Answer:** Jabba's leader ability is considered both a leader dealing damage and a unit dealing
> damage. Dedra is the source of her damage even if the opponent chooses where. Players can't be sources
> of damage directly but can be responsible (e.g. for Bounty) if they control the ability. Multiple
> cards can be the source of damage simultaneously. Dedra leader can trigger JTL Boba leader.

**Findings:** Sprawling damage-source/responsibility ruling spanning Jabba/Jango/Dedra/Boba. Some
sub-claims are two-player testable (Jabba→Jango, Dedra→Boba, Dedra→Bounty), but the framing and several
examples are Twin Suns. Left for a deeper review (see the main review file item #23). Deferred.

---

## Notes

- The two-player-testable sub-parts of item #2 (e.g. "Dedra leader can trigger JTL Boba leader",
  "the Dedra player is responsible for a Bounty") could be pulled out into ordinary card-spec `xit`
  stubs (Dedra / Jango specs) if we decide not to wait for a Twin Suns harness.
- Other Twin Suns rulings encountered during triage were marked N/A at the time (multiplayer bounty
  collection order, player elimination + captured cards, Caught in the Crossfire, Clone Deserter with
  three players, etc.). If we build out Twin Suns testing, revisit those in the by-set doc.
