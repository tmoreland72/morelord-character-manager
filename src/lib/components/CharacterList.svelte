<script lang="ts">
  import type { StoredCharacter } from "../models/stored-character";
  import { createCharacterSummary } from "../characters/character-summary";

  export let characters: StoredCharacter[];
  export let loading: boolean;

  export let onOpen: (
    character: StoredCharacter
  ) => void;

  export let onRemove: (
    character: StoredCharacter
  ) => void;

  export let onImport: () => void;

  function formatImportDate(
    dateValue: string
  ): string {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }

    return date.toLocaleString();
  }

  function getInitials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  function getCharacterDescription(
    character: StoredCharacter
  ): string {
    const summary = createCharacterSummary(character);

    const values = [
      summary.species,
      summary.background,
      summary.totalLevel > 0
        ? `Level ${summary.totalLevel}`
        : undefined
    ];

    return values
      .filter(
        (value): value is string =>
          typeof value === "string" &&
          value.length > 0
      )
      .join(" • ");
  }
</script>

<div class="section-heading">
  <div>
    <h2>Your Characters</h2>

    <p>
      Characters imported from Foundry are stored locally
      in this browser.
    </p>
  </div>
</div>

{#if loading}
  <section class="empty-state">
    <p>Loading characters…</p>
  </section>
{:else if characters.length === 0}
  <section class="empty-state">
    <h3>No characters imported</h3>

    <p>
      Import a character Actor JSON file exported from
      Foundry VTT.
    </p>

    <button
      type="button"
      class="import-button"
      on:click={onImport}
    >
      Import Your First Character
    </button>
  </section>
{:else}
  <section class="character-grid">
    {#each characters as character}
      {@const summary = createCharacterSummary(character)}

      <article class="character-card">
        <button
          type="button"
          class="card-open-button"
          aria-label={`Open ${character.name}`}
          on:click={() => onOpen(character)}
        >
          <div class="portrait">
            {getInitials(character.name)}
          </div>

          <div class="character-details">
            <h3>{character.name}</h3>

            <p class="class-line">
              {#if summary.classes.length > 0}
                {summary.classes
                  .map(
                    (item) =>
                      `${item.name} ${item.levels}`
                  )
                  .join(" / ")}
              {:else}
                Character
              {/if}
            </p>

            {#if getCharacterDescription(character)}
              <p class="secondary-line">
                {getCharacterDescription(character)}
              </p>
            {/if}

            <p class="imported-date">
              Imported
              {formatImportDate(character.importedAt)}
            </p>
          </div>
        </button>

        <button
          type="button"
          class="delete-button"
          aria-label={`Remove ${character.name}`}
          title="Remove character"
          on:click={() => onRemove(character)}
        >
          Remove
        </button>
      </article>
    {/each}
  </section>
{/if}

<style>
  h2,
  h3,
  p {
    margin-top: 0;
  }

  button {
    font: inherit;
  }

  .section-heading {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .section-heading h2 {
    margin-bottom: 0.25rem;
  }

  .section-heading p {
    margin-bottom: 0;
    color: #aaa398;
  }

  .empty-state {
    padding: 3rem;
    border: 1px dashed #514c43;
    border-radius: 0.5rem;
    text-align: center;
    color: #aaa398;
  }

  .empty-state h3 {
    color: #ece7dc;
  }

  .import-button {
    margin-top: 0.5rem;
    padding: 0.75rem 1.1rem;
    border: 1px solid #806c48;
    border-radius: 0.35rem;
    background: #4d3927;
    color: #ffffff;
    font-weight: 600;
    cursor: pointer;
  }

  .import-button:hover {
    background: #624a34;
  }

  .character-grid {
    display: grid;
    grid-template-columns:
      repeat(auto-fill, minmax(320px, 1fr));
    gap: 1rem;
  }

  .character-card {
    position: relative;
    display: flex;
    min-width: 0;
    border: 1px solid #454038;
    border-radius: 0.5rem;
    background: #24211d;
    overflow: hidden;
  }

  .card-open-button {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 1rem;
    min-width: 0;
    padding: 1.25rem;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .card-open-button:hover {
    background: #2d2924;
  }

  .card-open-button:focus-visible,
  .delete-button:focus-visible,
  .import-button:focus-visible {
    outline: 2px solid #c09a5b;
    outline-offset: -2px;
  }

  .portrait {
    display: grid;
    width: 76px;
    height: 76px;
    flex: 0 0 auto;
    place-items: center;
    border: 2px solid #806c48;
    border-radius: 50%;
    background: #302c26;
    font-size: 1.4rem;
    font-weight: 700;
  }

  .character-details {
    min-width: 0;
  }

  .character-details h3 {
    margin-bottom: 0.35rem;
    font-size: 1.25rem;
  }

  .character-details p {
    overflow-wrap: anywhere;
  }

  .class-line {
    margin-bottom: 0.25rem;
  }

  .secondary-line,
  .imported-date {
    color: #aaa398;
  }

  .secondary-line {
    margin-bottom: 0.55rem;
  }

  .imported-date {
    margin-bottom: 0;
    font-size: 0.78rem;
  }

  .delete-button {
    align-self: flex-start;
    margin: 0.75rem 0.75rem 0 0;
    padding: 0.4rem 0.55rem;
    border: 1px solid #69504b;
    border-radius: 0.3rem;
    background: #352725;
    color: #d9b8b2;
    cursor: pointer;
  }

  .delete-button:hover {
    background: #4a2e2a;
  }

  @media (max-width: 600px) {
    .character-grid {
      grid-template-columns: 1fr;
    }

    .empty-state {
      padding: 2rem 1rem;
    }
  }
</style>