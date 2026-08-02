<script lang="ts">
  import type {
    FoundryActor,
    FoundryActorItem
  } from "../../models/foundry-actor";

  export let actor: FoundryActor;

  interface SpellGroup {
    level: number;
    spells: FoundryActorItem[];
  }

  $: spells = actor.items
    .filter((item) => item.type === "spell")
    .sort((left, right) => {
      const levelDifference =
        getSpellLevel(left) -
        getSpellLevel(right);

      if (levelDifference !== 0) {
        return levelDifference;
      }

      return left.name.localeCompare(
        right.name
      );
    });

  $: spellGroups = groupSpells(spells);

  function getSpellLevel(
    item: FoundryActorItem
  ): number {
    const level = item.system?.level;

    return typeof level === "number"
      ? level
      : 0;
  }

  function getPreparedValue(
    item: FoundryActorItem
  ): number {
    const prepared = item.system?.prepared;

    return typeof prepared === "number"
      ? prepared
      : 0;
  }

  function getPreparationLabel(
    item: FoundryActorItem
  ): string {
    const prepared = getPreparedValue(item);

    if (prepared >= 2) {
      return "Always Prepared";
    }

    if (prepared === 1) {
      return "Prepared";
    }

    return "Not Prepared";
  }

  function isPrepared(
    item: FoundryActorItem
  ): boolean {
    return getPreparedValue(item) > 0;
  }

  function isAlwaysPrepared(
    item: FoundryActorItem
  ): boolean {
    return getPreparedValue(item) >= 2;
  }

  function getLevelLabel(
    level: number
  ): string {
    return level === 0
      ? "Cantrips"
      : `Level ${level}`;
  }

  function getSchool(
    item: FoundryActorItem
  ): string {
    const school = item.system?.school;

    const schools: Record<string, string> = {
      abj: "Abjuration",
      con: "Conjuration",
      div: "Divination",
      enc: "Enchantment",
      evo: "Evocation",
      ill: "Illusion",
      nec: "Necromancy",
      trs: "Transmutation"
    };

    return typeof school === "string"
      ? schools[school] ?? school
      : "Unknown school";
  }

  function getActivation(
    item: FoundryActorItem
  ): string {
    const activation = item.system?.activation;

    if (
      typeof activation !== "object" ||
      activation === null ||
      !("type" in activation) ||
      typeof activation.type !== "string"
    ) {
      return "—";
    }

    const labels: Record<string, string> = {
      action: "Action",
      bonus: "Bonus Action",
      reaction: "Reaction",
      minute: "Minute",
      hour: "Hour",
      special: "Special"
    };

    return (
      labels[activation.type] ??
      activation.type
    );
  }

  function groupSpells(
    values: FoundryActorItem[]
  ): SpellGroup[] {
    const groups =
      new Map<number, FoundryActorItem[]>();

    for (const spell of values) {
      const level = getSpellLevel(spell);
      const group = groups.get(level) ?? [];

      group.push(spell);
      groups.set(level, group);
    }

    return Array.from(groups.entries())
      .sort(([left], [right]) => left - right)
      .map(([level, group]) => ({
        level,
        spells: group
      }));
  }
</script>

<section class="tab-panel">
  <div class="panel-heading">
    <div>
      <h3>Spells</h3>
      <p>
        Spells embedded in the imported Foundry Actor.
      </p>
    </div>

    <span class="count-badge">
      {spells.length}
    </span>
  </div>

  {#if spells.length === 0}
    <div class="empty-state">
      No spells were found.
    </div>
  {:else}
    <div class="spell-groups">
      {#each spellGroups as group}
        <section class="spell-group">
          <h4>
            {getLevelLabel(group.level)}
            <span>{group.spells.length}</span>
          </h4>

          <div class="spell-list">
            {#each group.spells as spell}
              <article class="spell-row">
                <div class="spell-information">
                  <strong>{spell.name}</strong>

                  <small>
                    {getSchool(spell)}
                    •
                    {getActivation(spell)}
                  </small>
                </div>

                <span
                  class:prepared={isPrepared(spell)}
                  class:always-prepared={isAlwaysPrepared(spell)}
                  class="preparation-status"
                >
                  {getPreparationLabel(spell)}
                </span>
              </article>
            {/each}
          </div>
        </section>
      {/each}
    </div>
  {/if}
</section>

<style>
  h3,
  h4,
  p {
    margin-top: 0;
  }

  .tab-panel {
    padding: 1.25rem;
    border: 1px solid #454038;
    border-radius: 0.5rem;
    background: #24211d;
  }

  .panel-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .panel-heading h3 {
    margin-bottom: 0.25rem;
  }

  .panel-heading p {
    margin-bottom: 0;
    color: #aaa398;
  }

  .count-badge {
    min-width: 2.25rem;
    padding: 0.35rem 0.65rem;
    border: 1px solid #514c43;
    border-radius: 999px;
    background: #1d1b18;
    text-align: center;
  }

  .spell-groups {
    display: grid;
    gap: 1rem;
  }

  .spell-group {
    overflow: hidden;
    border: 1px solid #454038;
    border-radius: 0.4rem;
  }

  .spell-group h4 {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0;
    padding: 0.7rem 0.85rem;
    background: #302c26;
  }

  .spell-group h4 span {
    color: #aaa398;
  }

  .spell-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 0.85rem;
    border-bottom: 1px solid #454038;
  }

  .spell-row:last-child {
    border-bottom: 0;
  }

  .spell-row:nth-child(even) {
    background: #211f1b;
  }

  .spell-information {
    min-width: 0;
  }

  .spell-information strong,
  .spell-information small {
    display: block;
  }

  .spell-information small {
    margin-top: 0.15rem;
    color: #8f887d;
  }

  .preparation-status {
    flex: 0 0 auto;
    padding: 0.25rem 0.5rem;
    border: 1px solid #514c43;
    border-radius: 999px;
    background: #1d1b18;
    color: #8f887d;
    font-size: 0.75rem;
  }

  .preparation-status.prepared {
    border-color: #537a52;
    background: #203421;
    color: #bad5b9;
  }

  .preparation-status.always-prepared {
    border-color: #806c48;
    background: #3d3020;
    color: #e2c289;
  }

  .empty-state {
    padding: 2rem;
    border: 1px dashed #514c43;
    border-radius: 0.4rem;
    color: #aaa398;
    text-align: center;
  }
</style>