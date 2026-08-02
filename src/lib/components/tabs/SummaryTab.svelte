<script lang="ts">
  import type { FoundryActor } from "../../models/foundry-actor";

  import {
    deriveCharacterValues,
    formatSignedNumber,
    getAbilityModifier,
    getAbilityScore
  } from "../../characters/derived-character";

  export let actor: FoundryActor;

  const abilities = [
    { key: "str", label: "Strength" },
    { key: "dex", label: "Dexterity" },
    { key: "con", label: "Constitution" },
    { key: "int", label: "Intelligence" },
    { key: "wis", label: "Wisdom" },
    { key: "cha", label: "Charisma" }
  ];

  $: derived = deriveCharacterValues(actor);

  function getProficiencySymbol(
    value: number
  ): string {
    if (value >= 2) {
      return "◆";
    }

    if (value >= 1) {
      return "●";
    }

    if (value > 0) {
      return "◐";
    }

    return "○";
  }

  function getAbilityAbbreviation(
    ability: string
  ): string {
    return ability.toUpperCase();
  }
</script>

<div class="summary-layout">
  <section class="sheet-section">
    <h3>Ability Scores</h3>

    <div class="ability-grid">
      {#each abilities as ability}
        {@const score = getAbilityScore(
          actor,
          ability.key
        )}

        <article class="ability-card">
          <span>{ability.label}</span>
          <strong>{score}</strong>

          <small>
            {formatSignedNumber(
              getAbilityModifier(
                actor,
                ability.key
              )
            )}
          </small>
        </article>
      {/each}
    </div>
  </section>

  <div class="summary-columns">
    <section class="sheet-section">
      <h3>Saving Throws</h3>

      <div class="save-list">
        {#each derived.savingThrows as save}
          <div class="save-row">
            <span
              class:proficient={save.proficient}
              class="proficiency-symbol"
              title={
                save.proficient
                  ? "Proficient"
                  : "Not proficient"
              }
            >
              {save.proficient ? "●" : "○"}
            </span>

            <span>{save.name}</span>

            <strong>
              {formatSignedNumber(
                save.modifier
              )}
            </strong>
          </div>
        {/each}
      </div>
    </section>

    <section class="sheet-section">
      <h3>Combat</h3>

      <div class="combat-grid">
        <div>
          <span>Armor Class</span>
          <strong>{derived.armorClass}</strong>
        </div>

        <div>
          <span>Initiative</span>
          <strong>
            {formatSignedNumber(
              derived.initiative
            )}
          </strong>
        </div>

        <div>
          <span>Proficiency</span>
          <strong>
            {formatSignedNumber(
              derived.proficiencyBonus
            )}
          </strong>
        </div>

        <div>
          <span>Speed</span>
          <strong>
            {derived.speed ?? "—"}
            {#if derived.speed !== null}
              <small>
                {derived.speedUnits}
              </small>
            {/if}
          </strong>
        </div>
      </div>

      <div class="health-panel">
        <div>
          <span>Current HP</span>
          <strong>{derived.currentHp}</strong>
        </div>

        <div>
          <span>Maximum HP</span>
          <strong>{derived.maximumHp}</strong>
        </div>

        <div>
          <span>Temporary HP</span>
          <strong>{derived.temporaryHp}</strong>
        </div>
      </div>
    </section>
  </div>

  <section class="sheet-section">
    <div class="section-heading">
      <h3>Skills</h3>

      <div class="legend">
        <span>○ None</span>
        <span>● Proficient</span>
        <span>◆ Expertise</span>
      </div>
    </div>

    <div class="skill-grid">
      {#each derived.skills as skill}
        <div class="skill-row">
          <span
            class:trained={skill.proficiency > 0}
            class:expert={skill.proficiency >= 2}
            class="proficiency-symbol"
          >
            {getProficiencySymbol(
              skill.proficiency
            )}
          </span>

          <span class="skill-name">
            {skill.name}

            <small>
              {getAbilityAbbreviation(
                skill.ability
              )}
            </small>
          </span>

          <strong>
            {formatSignedNumber(
              skill.modifier
            )}
          </strong>

          <span class="passive">
            Passive {skill.passive}
          </span>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  h3 {
    margin-top: 0;
  }

  .summary-layout {
    display: grid;
    gap: 1rem;
  }

  .sheet-section {
    padding: 1.25rem;
    border: 1px solid #454038;
    border-radius: 0.5rem;
    background: #24211d;
  }

  .sheet-section h3 {
    margin-bottom: 1rem;
  }

  .ability-grid {
    display: grid;
    grid-template-columns:
      repeat(6, minmax(90px, 1fr));
    gap: 0.75rem;
  }

  .ability-card {
    display: grid;
    place-items: center;
    padding: 0.85rem;
    border: 1px solid #514c43;
    border-radius: 0.4rem;
    background: #1d1b18;
  }

  .ability-card span {
    color: #aaa398;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .ability-card strong {
    margin: 0.2rem 0;
    font-size: 1.6rem;
  }

  .ability-card small {
    color: #c4bdae;
    font-size: 1rem;
  }

  .summary-columns {
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 1rem;
  }

  .save-list {
    display: grid;
  }

  .save-row {
    display: grid;
    grid-template-columns: 24px 1fr auto;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid #454038;
  }

  .save-row:last-child {
    border-bottom: 0;
  }

  .proficiency-symbol {
    color: #777168;
    text-align: center;
  }

  .proficiency-symbol.proficient,
  .proficiency-symbol.trained {
    color: #d4ae6d;
  }

  .proficiency-symbol.expert {
    color: #e2c289;
  }

  .combat-grid,
  .health-panel {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(90px, 1fr));
    gap: 0.75rem;
  }

  .combat-grid > div,
  .health-panel > div {
    display: grid;
    place-items: center;
    min-height: 82px;
    padding: 0.7rem;
    border: 1px solid #514c43;
    border-radius: 0.4rem;
    background: #1d1b18;
    text-align: center;
  }

  .combat-grid span,
  .health-panel span {
    color: #aaa398;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .combat-grid strong,
  .health-panel strong {
    font-size: 1.4rem;
  }

  .combat-grid small {
    margin-left: 0.2rem;
    color: #aaa398;
    font-size: 0.75rem;
  }

  .health-panel {
    grid-template-columns: repeat(3, 1fr);
    margin-top: 0.75rem;
  }

  .section-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    color: #8f887d;
    font-size: 0.75rem;
  }

  .skill-grid {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(280px, 1fr));
    gap: 0 1.25rem;
  }

  .skill-row {
    display: grid;
    grid-template-columns:
      24px minmax(140px, 1fr) 40px 90px;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid #454038;
  }

  .skill-name small {
    margin-left: 0.35rem;
    color: #777168;
    font-size: 0.7rem;
  }

  .passive {
    color: #8f887d;
    font-size: 0.72rem;
    text-align: right;
  }

  @media (max-width: 850px) {
    .ability-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .summary-columns {
      grid-template-columns: 1fr;
    }

    .skill-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .ability-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .combat-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .health-panel {
      grid-template-columns: 1fr;
    }

    .section-heading {
      flex-direction: column;
    }

    .skill-row {
      grid-template-columns:
        24px minmax(120px, 1fr) 40px;
    }

    .passive {
      display: none;
    }
  }
</style>